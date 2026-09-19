import { findWorkspaceByOwner, findWorkspaceByToken } from '@/db/operator.ts';
import { getChatGPTUser } from '@/app/chatgpt-auth';
import { bearerToken } from '@/lib/http.ts';
import type { OperatorWorkspace } from '@/db/operator.ts';

export async function resolveOperatorWorkspace(
  request: Request,
): Promise<OperatorWorkspace | null> {
  const token = bearerToken(request);
  if (token) return findWorkspaceByToken(token);
  const user = await getChatGPTUser();
  if (!user) return null;
  return findWorkspaceByOwner(user.userId);
}
