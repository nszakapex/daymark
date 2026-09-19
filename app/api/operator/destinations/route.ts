import {
  deleteDestination,
  listDestinations,
  saveDestination,
  workspaceAccessError,
} from '@/db/operator.ts';
import { resolveOperatorWorkspace } from '@/lib/operator-access.ts';
import { jsonResponse, readJsonObject, sameOrigin } from '@/lib/http.ts';
import { planLimits } from '@/lib/operator.ts';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const workspace = await resolveOperatorWorkspace(request);
    if (!workspace) {
      return jsonResponse({ error: 'Sign in or send a Daymark key.' }, 401);
    }
    return jsonResponse({
      destinations: await listDestinations(workspace.id),
      limit: planLimits[workspace.plan].destinations,
    });
  } catch {
    return jsonResponse(
      { error: 'Operator storage is temporarily unavailable.' },
      503,
    );
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return jsonResponse(
      { error: 'Add destinations from the Daymark website.' },
      403,
    );
  }
  try {
    const workspace = await resolveOperatorWorkspace(request);
    if (!workspace) {
      return jsonResponse({ error: 'Sign in or send a Daymark key.' }, 401);
    }
    const blocked = workspaceAccessError(workspace);
    if (blocked) return jsonResponse({ error: blocked }, 402);
    const limit = planLimits[workspace.plan].destinations;
    if (limit < 1) {
      return jsonResponse(
        {
          error:
            'Outbound Zapier destinations are included with Operator. Starter and trial return the decision in the ingest response instead.',
        },
        402,
      );
    }
    const existing = await listDestinations(workspace.id);
    if (existing.length >= limit) {
      return jsonResponse(
        {
          error: `This plan allows ${limit} destination webhook${limit === 1 ? '' : 's'}.`,
        },
        402,
      );
    }
    const body = await readJsonObject(request, 2000);
    const url = typeof body.url === 'string' ? body.url : '';
    const label =
      typeof body.label === 'string' ? body.label : 'Zapier catch hook';
    const destination = await saveDestination(workspace.id, url, label);
    return jsonResponse({ destination });
  } catch (error) {
    const status = (error as { status?: number }).status;
    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : 'The destination could not be saved.',
      },
      status ?? 400,
    );
  }
}

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) {
    return jsonResponse(
      { error: 'Remove destinations from the Daymark website.' },
      403,
    );
  }
  try {
    const workspace = await resolveOperatorWorkspace(request);
    if (!workspace) {
      return jsonResponse({ error: 'Sign in or send a Daymark key.' }, 401);
    }
    const body = await readJsonObject(request, 1000);
    const id = typeof body.id === 'string' ? body.id : '';
    if (!id)
      return jsonResponse({ error: 'Choose a destination to remove.' }, 400);
    await deleteDestination(workspace.id, id);
    return jsonResponse({ deleted: true });
  } catch {
    return jsonResponse(
      { error: 'The destination could not be removed.' },
      503,
    );
  }
}
