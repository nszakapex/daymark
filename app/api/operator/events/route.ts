import { listDecisions } from '@/db/operator.ts';
import { resolveOperatorWorkspace } from '@/lib/operator-access.ts';
import { jsonResponse } from '@/lib/http.ts';
import { publicDecision } from '@/lib/operator-dispatch.ts';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const workspace = await resolveOperatorWorkspace(request);
    if (!workspace) {
      return jsonResponse(
        { error: 'Sign in or send a Daymark key to read decisions.' },
        401,
      );
    }
    const rows = await listDecisions(workspace.id);
    return jsonResponse({
      workspace: {
        id: workspace.id,
        plan: workspace.plan,
        eventCountMonth: workspace.eventCountMonth,
      },
      decisions: rows.map((row) =>
        publicDecision(row, {
          id: row.id,
          receivedAt: row.receivedAt,
          source: row.source,
          type: row.type,
          email: row.email,
          amountCents: row.amountCents,
          dispatchedAt: row.dispatchedAt,
          dispatchError: row.dispatchError,
        }),
      ),
    });
  } catch {
    return jsonResponse(
      { error: 'Operator storage is temporarily unavailable.' },
      503,
    );
  }
}
