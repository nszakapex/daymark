import { getRawDb } from './index';
import { randomToken, sha256Hex } from '@/lib/crypto-hash.ts';
import {
  playbookById,
  planLimits,
  utcMonthKey,
  type OperatorDecision,
  type OperatorPlan,
  type RecentEvent,
} from '@/lib/operator.ts';

export type OperatorWorkspace = {
  id: string;
  ownerId: string | null;
  email: string | null;
  plan: OperatorPlan;
  planExpiresAt: string | null;
  eventCountMonth: number;
  eventMonth: string;
  createdAt: string;
  updatedAt: string;
};

export type StoredDecision = OperatorDecision & {
  id: string;
  eventId: string;
  receivedAt: string;
  source: string;
  type: string;
  email: string | null;
  amountCents: number | null;
  dispatchedAt: string | null;
  dispatchError: string | null;
};

type WorkspaceRow = {
  id: string;
  owner_id: string | null;
  email: string | null;
  plan: string;
  plan_expires_at: string | null;
  event_count_month: number;
  event_month: string;
  created_at: string;
  updated_at: string;
};

function mapWorkspace(row: WorkspaceRow): OperatorWorkspace {
  return {
    id: row.id,
    ownerId: row.owner_id,
    email: row.email,
    plan: row.plan as OperatorPlan,
    planExpiresAt: row.plan_expires_at,
    eventCountMonth: row.event_count_month,
    eventMonth: row.event_month,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createOperatorWorkspace(input: {
  plan: OperatorPlan;
  ownerId?: string | null;
  email?: string | null;
  licenseHash?: string | null;
  planExpiresAt?: string | null;
}): Promise<{ workspace: OperatorWorkspace; token: string }> {
  const now = new Date().toISOString();
  const token = randomToken('dmws_');
  const workspace: OperatorWorkspace = {
    id: crypto.randomUUID(),
    ownerId: input.ownerId ?? null,
    email: input.email ?? null,
    plan: input.plan,
    planExpiresAt: input.planExpiresAt ?? trialExpiry(input.plan),
    eventCountMonth: 0,
    eventMonth: utcMonthKey(),
    createdAt: now,
    updatedAt: now,
  };
  await getRawDb()
    .prepare(
      `INSERT INTO operator_workspaces (
        id, owner_id, email, plan, plan_expires_at, license_hash, token_hash,
        event_count_month, event_month, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
    )
    .bind(
      workspace.id,
      workspace.ownerId,
      workspace.email,
      workspace.plan,
      workspace.planExpiresAt,
      input.licenseHash ?? null,
      await sha256Hex(token),
      workspace.eventMonth,
      now,
      now,
    )
    .run();
  return { workspace, token };
}

export async function rotateOperatorToken(workspaceId: string) {
  const token = randomToken('dmws_');
  const now = new Date().toISOString();
  await getRawDb()
    .prepare(
      'UPDATE operator_workspaces SET token_hash = ?, updated_at = ? WHERE id = ?',
    )
    .bind(await sha256Hex(token), now, workspaceId)
    .run();
  return token;
}

export async function findWorkspaceByToken(token: string) {
  const row = await getRawDb()
    .prepare(
      `SELECT id, owner_id, email, plan, plan_expires_at, event_count_month,
              event_month, created_at, updated_at
       FROM operator_workspaces WHERE token_hash = ? LIMIT 1`,
    )
    .bind(await sha256Hex(token))
    .first<WorkspaceRow>();
  return row ? mapWorkspace(row) : null;
}

export async function findWorkspaceByOwner(ownerId: string) {
  const row = await getRawDb()
    .prepare(
      `SELECT id, owner_id, email, plan, plan_expires_at, event_count_month,
              event_month, created_at, updated_at
       FROM operator_workspaces WHERE owner_id = ? LIMIT 1`,
    )
    .bind(ownerId)
    .first<WorkspaceRow>();
  return row ? mapWorkspace(row) : null;
}

export async function findWorkspaceByLicenseHash(licenseHash: string) {
  const row = await getRawDb()
    .prepare(
      `SELECT id, owner_id, email, plan, plan_expires_at, event_count_month,
              event_month, created_at, updated_at
       FROM operator_workspaces WHERE license_hash = ? LIMIT 1`,
    )
    .bind(licenseHash)
    .first<WorkspaceRow>();
  return row ? mapWorkspace(row) : null;
}

export async function attachOwner(
  workspaceId: string,
  ownerId: string,
  email: string | null,
) {
  const now = new Date().toISOString();
  await getRawDb()
    .prepare(
      'UPDATE operator_workspaces SET owner_id = ?, email = COALESCE(?, email), updated_at = ? WHERE id = ?',
    )
    .bind(ownerId, email, now, workspaceId)
    .run();
}

export async function upgradeWorkspace(
  workspaceId: string,
  plan: OperatorPlan,
  planExpiresAt: string | null,
  licenseHash: string,
) {
  const now = new Date().toISOString();
  await getRawDb()
    .prepare(
      `UPDATE operator_workspaces
       SET plan = ?, plan_expires_at = ?, license_hash = ?, updated_at = ?
       WHERE id = ?`,
    )
    .bind(plan, planExpiresAt, licenseHash, now, workspaceId)
    .run();
}

export function workspaceAccessError(
  workspace: OperatorWorkspace,
  now = new Date(),
) {
  if (
    workspace.planExpiresAt &&
    Date.parse(workspace.planExpiresAt) <= now.getTime()
  ) {
    return 'This Operator plan has expired. Redeem a current license to continue.';
  }
  const month = utcMonthKey(now);
  const used = workspace.eventMonth === month ? workspace.eventCountMonth : 0;
  if (used >= planLimits[workspace.plan].monthlyEvents) {
    return 'This workspace has reached its event limit for the month.';
  }
  return null;
}

export async function incrementEventCount(workspace: OperatorWorkspace) {
  const month = utcMonthKey();
  if (workspace.eventMonth !== month) {
    await getRawDb()
      .prepare(
        `UPDATE operator_workspaces
         SET event_count_month = 1, event_month = ?, updated_at = ?
         WHERE id = ?`,
      )
      .bind(month, new Date().toISOString(), workspace.id)
      .run();
    return;
  }
  await getRawDb()
    .prepare(
      `UPDATE operator_workspaces
       SET event_count_month = event_count_month + 1, updated_at = ?
       WHERE id = ?`,
    )
    .bind(new Date().toISOString(), workspace.id)
    .run();
}

export async function findIdempotentDecision(
  workspaceId: string,
  idempotencyKey: string,
) {
  const row = await getRawDb()
    .prepare(
      `SELECT d.id, d.event_id, d.action, d.playbook_id, d.reason, d.evidence_json,
              d.next_step, d.outbound_json, d.upgrade_required, d.dispatched_at,
              d.dispatch_error, d.created_at, e.fingerprint, e.source, e.type,
              e.email, e.amount_cents, e.received_at
       FROM operator_events e
       JOIN operator_decisions d ON d.event_id = e.id
       WHERE e.workspace_id = ? AND e.idempotency_key = ?
       LIMIT 1`,
    )
    .bind(workspaceId, idempotencyKey)
    .first<DecisionRow>();
  return row ? mapDecision(row) : null;
}

export async function recentForFingerprint(
  workspaceId: string,
  fingerprint: string,
): Promise<RecentEvent[]> {
  const rows = await getRawDb()
    .prepare(
      `SELECT e.fingerprint, d.action, d.playbook_id
       FROM operator_events e
       JOIN operator_decisions d ON d.event_id = e.id
       WHERE e.workspace_id = ? AND e.fingerprint = ?
       ORDER BY e.received_at DESC
       LIMIT 8`,
    )
    .bind(workspaceId, fingerprint)
    .all<{ fingerprint: string; action: string; playbook_id: string | null }>();
  return (rows.results ?? []).map((row) => ({
    fingerprint: row.fingerprint,
    action: row.action as RecentEvent['action'],
    playbookId: row.playbook_id as RecentEvent['playbookId'],
  }));
}

export async function saveDecision(input: {
  workspaceId: string;
  event: {
    source: string;
    type: string;
    occurredAt: string;
    email: string | null;
    amountCents: number | null;
    idempotencyKey: string | null;
    payload: unknown;
  };
  decision: OperatorDecision;
}) {
  const now = new Date().toISOString();
  const eventId = crypto.randomUUID();
  const decisionId = crypto.randomUUID();
  const db = getRawDb();
  await db
    .prepare(
      `INSERT INTO operator_events (
        id, workspace_id, fingerprint, source, type, occurred_at, received_at,
        email, amount_cents, payload_json, idempotency_key
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      eventId,
      input.workspaceId,
      input.decision.fingerprint,
      input.event.source,
      input.event.type,
      input.event.occurredAt,
      now,
      input.event.email,
      input.event.amountCents,
      JSON.stringify(input.event.payload),
      input.event.idempotencyKey,
    )
    .run();
  await db
    .prepare(
      `INSERT INTO operator_decisions (
        id, workspace_id, event_id, action, playbook_id, reason, evidence_json,
        next_step, outbound_json, upgrade_required, dispatched_at, dispatch_error,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?)`,
    )
    .bind(
      decisionId,
      input.workspaceId,
      eventId,
      input.decision.action,
      input.decision.playbookId,
      input.decision.reason,
      JSON.stringify(input.decision.evidence),
      input.decision.nextStep,
      input.decision.outbound ? JSON.stringify(input.decision.outbound) : null,
      input.decision.upgradeRequired ? 1 : 0,
      now,
    )
    .run();
  return { eventId, decisionId, receivedAt: now };
}

type DecisionRow = {
  id: string;
  event_id: string;
  action: string;
  playbook_id: string | null;
  reason: string;
  evidence_json: string;
  next_step: string;
  outbound_json: string | null;
  upgrade_required: number;
  dispatched_at: string | null;
  dispatch_error: string | null;
  created_at: string;
  fingerprint: string;
  source: string;
  type: string;
  email: string | null;
  amount_cents: number | null;
  received_at: string;
};

function mapDecision(row: DecisionRow): StoredDecision {
  return {
    id: row.id,
    eventId: row.event_id,
    action: row.action as StoredDecision['action'],
    playbookId: row.playbook_id as StoredDecision['playbookId'],
    playbookTitle:
      playbookById(row.playbook_id as StoredDecision['playbookId'])?.title ??
      null,
    reason: row.reason,
    evidence: JSON.parse(row.evidence_json) as string[],
    nextStep: row.next_step,
    upgradeRequired: row.upgrade_required === 1,
    fingerprint: row.fingerprint,
    outbound: row.outbound_json
      ? (JSON.parse(row.outbound_json) as Record<string, unknown>)
      : null,
    zapFilter: {
      action: row.action as StoredDecision['action'],
      continue: row.action === 'fire' || row.action === 'escalate',
      path: 'none',
    },
    receivedAt: row.received_at,
    source: row.source,
    type: row.type,
    email: row.email,
    amountCents: row.amount_cents,
    dispatchedAt: row.dispatched_at,
    dispatchError: row.dispatch_error,
  };
}

export async function listDecisions(workspaceId: string, limit = 40) {
  const rows = await getRawDb()
    .prepare(
      `SELECT d.id, d.event_id, d.action, d.playbook_id, d.reason, d.evidence_json,
              d.next_step, d.outbound_json, d.upgrade_required, d.dispatched_at,
              d.dispatch_error, d.created_at, e.fingerprint, e.source, e.type,
              e.email, e.amount_cents, e.received_at
       FROM operator_decisions d
       JOIN operator_events e ON e.id = d.event_id
       WHERE d.workspace_id = ?
       ORDER BY d.created_at DESC
       LIMIT ?`,
    )
    .bind(workspaceId, limit)
    .all<DecisionRow>();
  return (rows.results ?? []).map(mapDecision);
}

export async function listDestinations(workspaceId: string) {
  const rows = await getRawDb()
    .prepare(
      'SELECT id, url, label, created_at FROM operator_destinations WHERE workspace_id = ? ORDER BY created_at DESC',
    )
    .bind(workspaceId)
    .all<{ id: string; url: string; label: string; created_at: string }>();
  return rows.results ?? [];
}

export function validateDestinationUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw Error('Enter a public HTTPS webhook URL from Zapier.');
  }
  const local =
    url.hostname === 'localhost' ||
    url.hostname === '127.0.0.1' ||
    url.hostname === '::1';
  if (url.username || url.password) {
    throw Error('Destination URLs cannot include login details.');
  }
  if (url.protocol === 'http:' && local) return url.href;
  if (url.protocol !== 'https:') {
    throw Error('Destination URLs must use HTTPS.');
  }
  return url.href;
}

export async function saveDestination(
  workspaceId: string,
  url: string,
  label: string,
) {
  const href = validateDestinationUrl(url);
  const safeLabel = label.trim().slice(0, 80) || 'Zapier catch hook';
  const existing = await listDestinations(workspaceId);
  const id = crypto.randomUUID();
  await getRawDb()
    .prepare(
      'INSERT INTO operator_destinations (id, workspace_id, url, label, created_at) VALUES (?, ?, ?, ?, ?)',
    )
    .bind(id, workspaceId, href, safeLabel, new Date().toISOString())
    .run();
  return {
    id,
    url: href,
    label: safeLabel,
    created_at: new Date().toISOString(),
    count: existing.length + 1,
  };
}

export async function deleteDestination(
  workspaceId: string,
  destinationId: string,
) {
  await getRawDb()
    .prepare(
      'DELETE FROM operator_destinations WHERE id = ? AND workspace_id = ?',
    )
    .bind(destinationId, workspaceId)
    .run();
}

export async function markDispatch(
  decisionId: string,
  result: { ok: true } | { ok: false; error: string },
) {
  await getRawDb()
    .prepare(
      'UPDATE operator_decisions SET dispatched_at = ?, dispatch_error = ? WHERE id = ?',
    )
    .bind(
      result.ok ? new Date().toISOString() : null,
      result.ok ? null : result.error.slice(0, 240),
      decisionId,
    )
    .run();
}

function trialExpiry(plan: OperatorPlan) {
  if (plan !== 'trial') return null;
  return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
}
