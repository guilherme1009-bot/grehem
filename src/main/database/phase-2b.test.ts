import { describe, expect, it } from 'vitest'
import { DatabaseConnection } from './connection'
import { ProfileRepository } from './repositories/profile-repository'
import { HistoryRepository } from './repositories/history-repository'
import { BookmarkRepository } from './repositories/bookmark-repository'
import { BookmarkFolderRepository } from './repositories/bookmark-folder-repository'
describe('Phase 2B repositories', () => {
  it('lists and clears history by profile', () => { const db = new DatabaseConnection(':memory:'); db.migrate(); const profiles = new ProfileRepository(db.db); const one = profiles.getDefault(); const two = profiles.create('Other'); const history = new HistoryRepository(db.db); history.add(one.id, 'https://one.test', 'One'); history.add(two.id, 'https://two.test', 'Two'); expect(history.list(one.id)).toHaveLength(1); history.clear(one.id); expect(history.list(one.id)).toHaveLength(0); expect(history.list(two.id)).toHaveLength(1); db.close() })
  it('creates folders and associates bookmarks', () => { const db = new DatabaseConnection(':memory:'); db.migrate(); const profile = new ProfileRepository(db.db).getDefault(); const folders = new BookmarkFolderRepository(db.db); const folder = folders.create(profile.id, 'Reading'); const bookmarks = new BookmarkRepository(db.db); bookmarks.create(profile.id, 'Example', 'https://example.test', folder.id); expect(bookmarks.list(profile.id)[0].folder_id).toBe(folder.id); db.close() })
})
