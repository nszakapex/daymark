export const privateHeaders = { 'Cache-Control': 'private, no-store' };

export function jsonResponse(body: unknown, status = 200) {
  return Response.json(body, { status, headers: privateHeaders });
}

export function bearerToken(request: Request): string | null {
  const header = request.headers.get('authorization');
  if (header?.toLowerCase().startsWith('bearer ')) {
    const token = header.slice(7).trim();
    return token || null;
  }
  const fallback = request.headers.get('x-daymark-key')?.trim();
  return fallback || null;
}

export function sameOrigin(request: Request) {
  return request.headers.get('origin') === new URL(request.url).origin;
}

export async function readJsonObject(
  request: Request,
  maxBytes: number,
): Promise<Record<string, unknown>> {
  if (Number(request.headers.get('content-length') || 0) > maxBytes) {
    throw Object.assign(Error('Request too large.'), { status: 413 });
  }
  const raw = await request.text();
  if (raw.length > maxBytes) {
    throw Object.assign(Error('Request too large.'), { status: 413 });
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw Object.assign(Error('Send a JSON object.'), { status: 400 });
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw Object.assign(Error('Send a JSON object.'), { status: 400 });
  }
  return parsed as Record<string, unknown>;
}
