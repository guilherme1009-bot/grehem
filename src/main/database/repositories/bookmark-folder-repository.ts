import type { SqliteDatabase } from '../connection'
export interface BookmarkFolder { id: number; profile_id: number; parent_id: number | null; name: string; created_at: string; updated_at: string }
export class BookmarkFolderRepository {
  constructor(private readonly db: SqliteDatabase) {}
  list(profileId: number): BookmarkFolder[] { return this.db.prepare('SELECT * FROM bookmark_folders WHERE profile_id = ? ORDER BY name').all(profileId) as BookmarkFolder[] }
  find(profileId: number, folderId: number): BookmarkFolder | undefined { return this.db.prepare('SELECT * FROM bookmark_folders WHERE profile_id = ? AND id = ?').get(profileId, folderId) as BookmarkFolder | undefined }
  belongsToProfile(profileId: number, folderId: number): boolean { return Boolean(this.find(profileId, folderId)) }
  create(profileId: number, name: string, parentId: number | null = null): BookmarkFolder { const value = name.trim(); if (!value) throw new Error('folder name must not be empty'); if (parentId !== null && !this.belongsToProfile(profileId, parentId)) throw new Error('folder does not belong to profile'); const result = this.db.prepare('INSERT INTO bookmark_folders (profile_id, name, parent_id) VALUES (?, ?, ?)').run(profileId, value, parentId); return this.db.prepare('SELECT * FROM bookmark_folders WHERE id = ?').get(result.lastInsertRowid) as BookmarkFolder }
}
