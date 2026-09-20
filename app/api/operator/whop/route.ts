import { hmacSha256Hex } from '@/lib/crypto-hash.ts';
import { jsonResponse, readJsonObject } from '@/lib/http.ts';
import { readSecret } from '@/lib/secrets.ts';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const secret = readSecret('WHOP_WEBHOOK_SECRET');
  if (!secret) {
    return jsonResponse(
      {
        error:
          'Whop webhooks are not configured. Set WHOP_WEBHOOK_SECRET on the host before connecting a live listing.',
      },
      503,
    );
  }
  const signature =
    request.headers.get('webhook-signature') ??
    request.headers.get('x-whop-signature') ??
    '';
  let body: Record<string, unknown>;
  try {
    body = await readJsonObject(request, 12_000);
  } catch (error) {
    const status = (error as { status?: number }).status ?? 400;
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Invalid webhook.' },
      status,
    );
  }
  const expected = await hmacSha256Hex(secret, JSON.stringify(body));
  if (!signature || !timingSafeIncludes(signature, expected)) {
    return jsonResponse(
      { error: 'The webhook signature was not accepted.' },
      401,
    );
  }
  return jsonResponse({
    received: true,
    type: typeof body.type === 'string' ? body.type : null,
    note: 'Signature accepted. Membership fulfillment still happens through a Daymark license key on Whop, then redeem on /operator. This endpoint does not invent a membership or send email.',
  });
}

function timingSafeIncludes(provided: string, expectedHex: string) {
  const normalized = provided.toLowerCase().replace(/^sha256=/, '');
  if (normalized.length !== expectedHex.length) return false;
  let mismatch = 0;
  for (let index = 0; index < expectedHex.length; index += 1) {
    mismatch |= normalized.charCodeAt(index) ^ expectedHex.charCodeAt(index);
  }
  return mismatch === 0;
}
