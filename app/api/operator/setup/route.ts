import { getChatGPTUser } from '@/app/chatgpt-auth';
import {
  createOperatorWorkspace,
  findWorkspaceByOwner,
  rotateOperatorToken,
} from '@/db/operator.ts';
import { jsonResponse, sameOrigin } from '@/lib/http.ts';
import { planLimits } from '@/lib/operator.ts';
import { publicAppUrl } from '@/lib/secrets.ts';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const user = await getChatGPTUser();
  if (!user) {
    return jsonResponse(
      { error: 'Sign in to see your operator workspace.' },
      401,
    );
  }
  try {
    const workspace = await findWorkspaceByOwner(user.userId);
    if (!workspace) return jsonResponse({ workspace: null });
    return jsonResponse({
      workspace: publicWorkspace(workspace, request),
    });
  } catch {
    return jsonResponse(
      { error: 'Operator storage is temporarily unavailable.' },
      503,
    );
  }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) {
    return jsonResponse({ error: 'Sign in to start a trial workspace.' }, 401);
  }
  if (!sameOrigin(request)) {
    return jsonResponse(
      { error: 'Start a trial from the Daymark website.' },
      403,
    );
  }
  try {
    const existing = await findWorkspaceByOwner(user.userId);
    if (existing) {
      const token = await rotateOperatorToken(existing.id);
      return jsonResponse({
        workspace: publicWorkspace(existing, request),
        token,
        tokenShownOnce: true,
        rotated: true,
      });
    }
    const created = await createOperatorWorkspace({
      plan: 'trial',
      ownerId: user.userId,
      email: user.email,
    });
    return jsonResponse({
      workspace: publicWorkspace(created.workspace, request),
      token: created.token,
      tokenShownOnce: true,
      rotated: false,
    });
  } catch {
    return jsonResponse(
      { error: 'A trial workspace could not be created. Try again.' },
      503,
    );
  }
}

function publicWorkspace(
  workspace: Awaited<ReturnType<typeof findWorkspaceByOwner>>,
  request: Request,
) {
  if (!workspace) return null;
  return {
    id: workspace.id,
    plan: workspace.plan,
    planExpiresAt: workspace.planExpiresAt,
    eventCountMonth: workspace.eventCountMonth,
    monthlyLimit: planLimits[workspace.plan].monthlyEvents,
    destinationLimit: planLimits[workspace.plan].destinations,
    ingestUrl: `${publicAppUrl(request)}/api/operator/ingest`,
  };
}
