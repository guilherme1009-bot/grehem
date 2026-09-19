import type { SqliteDatabase } from '../connection'
export interface Bookmark { id: number; profile_id: number; folder_id: number | null; title: string; url: string; favicon: string | null; position: number; created_at: string; updated_at: string }
export class BookmarkRepository {
  constructor(private readonly db: SqliteDatabase) {}
  list(profileId: number, query = ''): Bookmark[] { const term = `%${query}%`; return this.db.prepare('SELECT * FROM bookmarks WHERE profile_id = ? AND (title LIKE ? OR url LIKE ?) ORDER BY position, title').all(profileId, term, term) as Bookmark[] }
  create(profileId: number, title: string, url: string, folderId: number | null = null, favicon: string | null = null): Bookmark { const result = this.db.prepare('INSERT INTO bookmarks (profile_id, folder_id, title, url, favicon) VALUES (?, ?, ?, ?, ?)').run(profileId, title.trim(), url.trim(), folderId, favicon); return this.db.prepare('SELECT * FROM bookmarks WHERE id = ?').get(result.lastInsertRowid) as Bookmark }
  update(profileId: number, bookmarkId: number, values: Partial<Pick<Bookmark, 'title' | 'url' | 'folder_id' | 'favicon' | 'position'>>): void { const fields = Object.entries(values).filter(([, value]) => value !== undefined); if (!fields.length) return; const set = fields.map(([field]) => `${field} = ?`).join(', '); this.db.prepare(`UPDATE bookmarks SET ${set}, updated_at = CURRENT_TIMESTAMP WHERE profile_id = ? AND id = ?`).run(...fields.map(([, value]) => value), profileId, bookmarkId) }
  delete(profileId: number, bookmarkId: number): void { this.db.prepare('DELETE FROM bookmarks WHERE profile_id = ? AND id = ?').run(profileId, bookmarkId) }
}
