import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const workspaces = sqliteTable('workspaces', {
  ownerId: text('owner_id').primaryKey(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  website: text('website').notNull(),
  goal: text('goal').notNull(),
  toolsJson: text('tools_json').notNull(),
  contactAllowed: integer('contact_allowed', { mode: 'boolean' })
    .notNull()
    .default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const operatorWorkspaces = sqliteTable('operator_workspaces', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id'),
  email: text('email'),
  plan: text('plan').notNull(),
  planExpiresAt: text('plan_expires_at'),
  licenseHash: text('license_hash'),
  tokenHash: text('token_hash').notNull(),
  eventCountMonth: integer('event_count_month').notNull().default(0),
  eventMonth: text('event_month').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const operatorEvents = sqliteTable('operator_events', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull(),
  fingerprint: text('fingerprint').notNull(),
  source: text('source').notNull(),
  type: text('type').notNull(),
  occurredAt: text('occurred_at').notNull(),
  receivedAt: text('received_at').notNull(),
  email: text('email'),
  amountCents: integer('amount_cents'),
  payloadJson: text('payload_json').notNull(),
  idempotencyKey: text('idempotency_key'),
});

export const operatorDecisions = sqliteTable('operator_decisions', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull(),
  eventId: text('event_id').notNull(),
  action: text('action').notNull(),
  playbookId: text('playbook_id'),
  reason: text('reason').notNull(),
  evidenceJson: text('evidence_json').notNull(),
  nextStep: text('next_step').notNull(),
  outboundJson: text('outbound_json'),
  upgradeRequired: integer('upgrade_required', { mode: 'boolean' })
    .notNull()
    .default(false),
  dispatchedAt: text('dispatched_at'),
  dispatchError: text('dispatch_error'),
  createdAt: text('created_at').notNull(),
});

export const operatorDestinations = sqliteTable('operator_destinations', {
  id: text('id').primaryKey(),
  workspaceId: text('workspace_id').notNull(),
  url: text('url').notNull(),
  label: text('label').notNull(),
  createdAt: text('created_at').notNull(),
});
