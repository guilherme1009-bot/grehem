import type { SqliteDatabase } from '../connection'
export interface HistoryEntry { id: number; profile_id: number; url: string; title: string; favicon: string | null; visited_at: string }
export class HistoryRepository {
  constructor(private readonly db: SqliteDatabase) {}
  add(profileId: number, url: string, title = '', favicon: string | null = null): HistoryEntry { const result = this.db.prepare('INSERT INTO history (profile_id, url, title, favicon) VALUES (?, ?, ?, ?)').run(profileId, url, title, favicon); return this.db.prepare('SELECT * FROM history WHERE id = ?').get(result.lastInsertRowid) as HistoryEntry }
  list(profileId: number, query = '', limit = 100): HistoryEntry[] { const safeLimit = Math.max(1, Math.min(limit, 500)); const term = `%${query}%`; return this.db.prepare('SELECT * FROM history WHERE profile_id = ? AND (url LIKE ? OR title LIKE ?) ORDER BY visited_at DESC LIMIT ?').all(profileId, term, term, safeLimit) as HistoryEntry[] }
  delete(profileId: number, historyId: number): void { this.db.prepare('DELETE FROM history WHERE profile_id = ? AND id = ?').run(profileId, historyId) }
  clear(profileId: number): void { this.db.prepare('DELETE FROM history WHERE profile_id = ?').run(profileId) }
}
