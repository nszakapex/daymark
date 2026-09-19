import { getChatGPTUser } from '@/app/chatgpt-auth';
import { sha256Hex } from '@/lib/crypto-hash.ts';
import {
  attachOwner,
  createOperatorWorkspace,
  findWorkspaceByLicenseHash,
  findWorkspaceByOwner,
  rotateOperatorToken,
  upgradeWorkspace,
} from '@/db/operator.ts';
import { jsonResponse, readJsonObject, sameOrigin } from '@/lib/http.ts';
import { planLimits } from '@/lib/operator.ts';
import { verifyLicense } from '@/lib/license.ts';
import { publicAppUrl, readSecret } from '@/lib/secrets.ts';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return jsonResponse(
      { error: 'Redeem a license from the Daymark website.' },
      403,
    );
  }
  let body: Record<string, unknown>;
  try {
    body = await readJsonObject(request, 2000);
  } catch (error) {
    const status = (error as { status?: number }).status ?? 400;
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Send a license key.' },
      status,
    );
  }
  const key = typeof body.key === 'string' ? body.key.trim() : '';
  const secret = readSecret('DAYMARK_LICENSE_SECRET');
  if (!secret) {
    return jsonResponse(
      {
        error:
          'License signing is not configured on this host. The seller needs DAYMARK_LICENSE_SECRET before keys can be redeemed.',
      },
      503,
    );
  }
  const parsed = await verifyLicense(secret, key);
  if (!parsed) {
    return jsonResponse(
      { error: 'That license is not valid or has expired.' },
      400,
    );
  }
  const user = await getChatGPTUser();
  const licenseHash = await sha256Hex(key);
  try {
    const existingLicense = await findWorkspaceByLicenseHash(licenseHash);
    if (existingLicense) {
      if (user && !existingLicense.ownerId) {
        await attachOwner(existingLicense.id, user.userId, user.email);
      }
      const token = await rotateOperatorToken(existingLicense.id);
      return jsonResponse({
        workspace: {
          id: existingLicense.id,
          plan: parsed.plan,
          planExpiresAt: parsed.expiresAt,
          monthlyLimit: planLimits[parsed.plan].monthlyEvents,
          ingestUrl: `${publicAppUrl(request)}/api/operator/ingest`,
        },
        token,
        tokenShownOnce: true,
        rotated: true,
      });
    }
    const owned = user ? await findWorkspaceByOwner(user.userId) : null;
    if (owned) {
      await upgradeWorkspace(
        owned.id,
        parsed.plan,
        parsed.expiresAt,
        licenseHash,
      );
      const token = await rotateOperatorToken(owned.id);
      return jsonResponse({
        workspace: {
          id: owned.id,
          plan: parsed.plan,
          planExpiresAt: parsed.expiresAt,
          monthlyLimit: planLimits[parsed.plan].monthlyEvents,
          ingestUrl: `${publicAppUrl(request)}/api/operator/ingest`,
        },
        token,
        tokenShownOnce: true,
        rotated: true,
      });
    }
    const created = await createOperatorWorkspace({
      plan: parsed.plan,
      ownerId: user?.userId ?? null,
      email: user?.email ?? null,
      licenseHash,
      planExpiresAt: parsed.expiresAt,
    });
    return jsonResponse({
      workspace: {
        id: created.workspace.id,
        plan: created.workspace.plan,
        planExpiresAt: created.workspace.planExpiresAt,
        monthlyLimit: planLimits[created.workspace.plan].monthlyEvents,
        ingestUrl: `${publicAppUrl(request)}/api/operator/ingest`,
      },
      token: created.token,
      tokenShownOnce: true,
      rotated: false,
    });
  } catch {
    return jsonResponse(
      { error: 'The license could not be redeemed. Try again.' },
      503,
    );
  }
}
