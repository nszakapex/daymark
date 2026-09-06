CREATE TABLE `workspaces` (
	`owner_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`website` text NOT NULL,
	`goal` text NOT NULL,
	`tools_json` text NOT NULL,
	`contact_allowed` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
