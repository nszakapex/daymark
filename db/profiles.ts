import { getRawDb } from './index';
import type { ProfileInput, SavedProfile } from '@/lib/profile';

export async function readProfile(
  ownerId: string,
): Promise<SavedProfile | null> {
  const row = await getRawDb()
    .prepare(
      'SELECT name, website, goal, tools_json, contact_allowed, updated_at FROM workspaces WHERE owner_id = ? LIMIT 1',
    )
    .bind(ownerId)
    .first<{
      name: string;
      website: string;
      goal: string;
      tools_json: string;
      contact_allowed: number;
      updated_at: string;
    }>();
  if (!row) return null;
  return {
    name: row.name,
    website: row.website,
    goal: row.goal,
    tools: JSON.parse(row.tools_json),
    contactAllowed: row.contact_allowed === 1,
    updatedAt: row.updated_at,
  };
}

export async function saveProfile(
  ownerId: string,
  email: string,
  input: ProfileInput,
): Promise<SavedProfile> {
  const now = new Date().toISOString();
  await getRawDb()
    .prepare(`INSERT INTO workspaces (owner_id, email, name, website, goal, tools_json, contact_allowed, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(owner_id) DO UPDATE SET email=excluded.email, name=excluded.name, website=excluded.website, goal=excluded.goal, tools_json=excluded.tools_json, contact_allowed=excluded.contact_allowed, updated_at=excluded.updated_at`)
    .bind(
      ownerId,
      email,
      input.name,
      input.website,
      input.goal,
      JSON.stringify(input.tools),
      input.contactAllowed ? 1 : 0,
      now,
      now,
    )
    .run();
  return { ...input, updatedAt: now };
}

export async function deleteProfile(ownerId: string) {
  await getRawDb()
    .prepare('DELETE FROM workspaces WHERE owner_id = ?')
    .bind(ownerId)
    .run();
}
