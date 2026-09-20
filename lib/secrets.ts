import { env } from 'cloudflare:workers';

export function readSecret(name: string): string | undefined {
  const fromEnv = (env as unknown as Record<string, unknown>)[name];
  if (typeof fromEnv === 'string' && fromEnv.trim()) return fromEnv.trim();
  const fromProcess = process.env[name];
  return fromProcess?.trim() || undefined;
}

export function publicAppUrl(request: Request): string {
  const configured = readSecret('DAYMARK_PUBLIC_URL');
  if (configured) return configured.replace(/\/$/, '');
  return new URL(request.url).origin;
}

export function whopListingUrl(): string | null {
  const url = readSecret('DAYMARK_WHOP_URL');
  return url || null;
}
