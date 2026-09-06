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
