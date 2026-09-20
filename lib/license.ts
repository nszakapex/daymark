import { hmacSha256Hex } from './crypto-hash.ts';

export const LICENSE_PLANS = ['starter', 'operator'] as const;
export type LicensePlan = (typeof LICENSE_PLANS)[number];

export type IssuedLicense = {
  key: string;
  plan: LicensePlan;
  expiresAt: string | null;
};

const LICENSE_PREFIX = 'dm1';

export function isLicensePlan(value: string): value is LicensePlan {
  return LICENSE_PLANS.includes(value as LicensePlan);
}

export async function issueLicense(
  secret: string,
  plan: LicensePlan,
  options: { validDays?: number; now?: Date } = {},
): Promise<IssuedLicense> {
  if (!secret || secret.length < 16) {
    throw Error(
      'A license signing secret of at least 16 characters is required.',
    );
  }
  const now = options.now ?? new Date();
  const expiresAt =
    plan === 'starter'
      ? null
      : new Date(
          now.getTime() + (options.validDays ?? 35) * 24 * 60 * 60 * 1000,
        ).toISOString();
  const nonce = crypto.randomUUID().replaceAll('-', '');
  const payload = `${plan}.${expiresAt ?? '0'}.${nonce}`;
  const signature = await hmacSha256Hex(secret, payload);
  return {
    key: `${LICENSE_PREFIX}.${payload}.${signature.slice(0, 32)}`,
    plan,
    expiresAt,
  };
}

export async function verifyLicense(
  secret: string,
  key: string,
  now = new Date(),
): Promise<{ plan: LicensePlan; expiresAt: string | null } | null> {
  if (!secret || typeof key !== 'string') return null;
  const parts = key.trim().split('.');
  if (parts.length !== 5 || parts[0] !== LICENSE_PREFIX) return null;
  const [, plan, expiresRaw, nonce, signature] = parts;
  if (!isLicensePlan(plan) || !nonce || !signature) return null;
  if (!/^[a-f0-9]{16,}$/i.test(nonce) || !/^[a-f0-9]{32}$/i.test(signature)) {
    return null;
  }
  const payload = `${plan}.${expiresRaw}.${nonce}`;
  const expected = (await hmacSha256Hex(secret, payload)).slice(0, 32);
  if (!timingSafeEqual(signature.toLowerCase(), expected.toLowerCase())) {
    return null;
  }
  if (expiresRaw === '0') {
    return { plan, expiresAt: null };
  }
  const expiresAt = new Date(expiresRaw);
  if (
    Number.isNaN(expiresAt.getTime()) ||
    expiresAt.getTime() <= now.getTime()
  ) {
    return null;
  }
  return { plan, expiresAt: expiresAt.toISOString() };
}

function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}
