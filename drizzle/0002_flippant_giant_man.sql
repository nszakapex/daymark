CREATE TABLE `operator_decisions` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`event_id` text NOT NULL,
	`action` text NOT NULL,
	`playbook_id` text,
	`reason` text NOT NULL,
	`evidence_json` text NOT NULL,
	`next_step` text NOT NULL,
	`outbound_json` text,
	`upgrade_required` integer DEFAULT false NOT NULL,
	`dispatched_at` text,
	`dispatch_error` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `operator_destinations` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`url` text NOT NULL,
	`label` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `operator_events` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`fingerprint` text NOT NULL,
	`source` text NOT NULL,
	`type` text NOT NULL,
	`occurred_at` text NOT NULL,
	`received_at` text NOT NULL,
	`email` text,
	`amount_cents` integer,
	`payload_json` text NOT NULL,
	`idempotency_key` text
);
--> statement-breakpoint
CREATE TABLE `operator_workspaces` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text,
	`email` text,
	`plan` text NOT NULL,
	`plan_expires_at` text,
	`license_hash` text,
	`token_hash` text NOT NULL,
	`event_count_month` integer DEFAULT 0 NOT NULL,
	`event_month` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `operator_events_workspace_fingerprint` ON `operator_events` (`workspace_id`,`fingerprint`);
--> statement-breakpoint
CREATE INDEX `operator_events_workspace_idempotency` ON `operator_events` (`workspace_id`,`idempotency_key`);
--> statement-breakpoint
CREATE INDEX `operator_decisions_workspace_created` ON `operator_decisions` (`workspace_id`,`created_at`);
