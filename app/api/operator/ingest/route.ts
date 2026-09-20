import {
  decideEvent,
  eventFingerprint,
  parseOperatorEvent,
  SAMPLE_INGEST_TOKEN,
} from '@/lib/operator.ts';
import { publicDecision, dispatchDecision } from '@/lib/operator-dispatch.ts';
import {
  findIdempotentDecision,
  findWorkspaceByToken,
  incrementEventCount,
  listDestinations,
  recentForFingerprint,
  saveDecision,
  workspaceAccessError,
} from '@/db/operator.ts';
import { bearerToken, jsonResponse, readJsonObject } from '@/lib/http.ts';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const token = bearerToken(request);
  if (!token) {
    return jsonResponse(
      { error: 'Send your Daymark key as a Bearer token or X-Daymark-Key.' },
      401,
    );
  }
  let body: Record<string, unknown>;
  try {
    body = await readJsonObject(request, 12_000);
  } catch (error) {
    const status = (error as { status?: number }).status ?? 400;
    return jsonResponse(
      { error: error instanceof Error ? error.message : 'Send a JSON object.' },
      status,
    );
  }

  let event;
  try {
    event = parseOperatorEvent(body);
  } catch (error) {
    return jsonResponse(
      {
        error:
          error instanceof Error
            ? error.message
            : 'The event could not be read.',
      },
      400,
    );
  }

  if (token === SAMPLE_INGEST_TOKEN) {
    const decision = decideEvent(event, { plan: 'operator', recent: [] });
    return jsonResponse({
      ...publicDecision(decision),
      persisted: false,
      sample: true,
      note: 'dm_sample returns a decision and does not store the event. It is for setup tests, not a customer audit trail.',
    });
  }

  try {
    const workspace = await findWorkspaceByToken(token);
    if (!workspace) {
      return jsonResponse(
        { error: 'That Daymark key was not recognized.' },
        401,
      );
    }
    const blocked = workspaceAccessError(workspace);
    if (blocked) return jsonResponse({ error: blocked }, 402);

    if (event.idempotencyKey) {
      const existing = await findIdempotentDecision(
        workspace.id,
        event.idempotencyKey,
      );
      if (existing) {
        return jsonResponse({
          ...publicDecision(existing),
          persisted: true,
          replayed: true,
        });
      }
    }

    const recent = await recentForFingerprint(
      workspace.id,
      eventFingerprint(event),
    );
    const decision = decideEvent(event, { plan: workspace.plan, recent });
    const saved = await saveDecision({
      workspaceId: workspace.id,
      event: {
        source: event.source,
        type: event.type,
        occurredAt: event.occurredAt,
        email: event.email,
        amountCents: event.amountCents,
        idempotencyKey: event.idempotencyKey,
        payload: body,
      },
      decision,
    });
    await incrementEventCount(workspace);
    const destinations = await listDestinations(workspace.id);
    await dispatchDecision(destinations, decision, saved.decisionId);
    return jsonResponse({
      ...publicDecision(decision),
      persisted: true,
      replayed: false,
      eventId: saved.eventId,
    });
  } catch {
    return jsonResponse(
      { error: 'Operator storage is temporarily unavailable. Try again.' },
      503,
    );
  }
}
