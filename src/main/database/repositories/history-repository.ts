import type { SqliteDatabase } from '../connection'
export interface HistoryEntry { id: number; profile_id: number; url: string; title: string; favicon: string | null; visited_at: string }
export class HistoryRepository {
  constructor(private readonly db: SqliteDatabase) {}
  add(profileId: number, url: string, title = '', favicon: string | null = null): HistoryEntry { if (url.startsWith('grehem://')) throw new Error('internal URLs are not stored in history'); const last = this.db.prepare('SELECT * FROM history WHERE profile_id = ? ORDER BY visited_at DESC, id DESC LIMIT 1').get(profileId) as HistoryEntry | undefined; let id: number | bigint; if (last?.url === url) { this.db.prepare('UPDATE history SET title = ?, favicon = ?, visited_at = CURRENT_TIMESTAMP WHERE id = ?').run(title, favicon, last.id); id = last.id } else { id = this.db.prepare('INSERT INTO history (profile_id, url, title, favicon) VALUES (?, ?, ?, ?)').run(profileId, url, title, favicon).lastInsertRowid } return this.db.prepare('SELECT * FROM history WHERE id = ?').get(id) as HistoryEntry }
  list(profileId: number, query = '', limit = 100): HistoryEntry[] { const safeLimit = Math.max(1, Math.min(limit, 500)); const term = `%${query.trim()}%`; return this.db.prepare('SELECT * FROM history WHERE profile_id = ? AND (url LIKE ? OR title LIKE ?) ORDER BY visited_at DESC, id DESC LIMIT ?').all(profileId, term, term, safeLimit) as HistoryEntry[] }
  delete(profileId: number, historyId: number): void { this.db.prepare('DELETE FROM history WHERE profile_id = ? AND id = ?').run(profileId, historyId) }
  clear(profileId: number): void { this.db.prepare('DELETE FROM history WHERE profile_id = ?').run(profileId) }
}
