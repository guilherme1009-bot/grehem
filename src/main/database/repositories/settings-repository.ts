import type { SqliteDatabase } from '../connection'
export interface Setting { key: string; value: string }
export class SettingsRepository {
  constructor(private readonly db: SqliteDatabase) {}
  get(profileId: number, key: string): string | null { return (this.db.prepare('SELECT value FROM settings WHERE profile_id = ? AND key = ?').get(profileId, key) as { value: string } | undefined)?.value ?? null }
  list(profileId: number): Setting[] { return this.db.prepare('SELECT key, value FROM settings WHERE profile_id = ? ORDER BY key').all(profileId) as Setting[] }
  set(profileId: number, key: string, value: string): void { this.db.prepare('INSERT INTO settings (profile_id, key, value) VALUES (?, ?, ?) ON CONFLICT(profile_id, key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP').run(profileId, key, value) }
  seed(profileId: number, values: Record<string, string>): void { this.db.transaction(() => { for (const [key, value] of Object.entries(values)) this.set(profileId, key, value) })() }
}
