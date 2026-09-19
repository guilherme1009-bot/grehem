import { describe, expect, it } from 'vitest'
import { DatabaseConnection } from './connection'
import { ProfileRepository } from './repositories/profile-repository'
import { SettingsRepository } from './repositories/settings-repository'
import { SearchEngineRepository } from './repositories/search-engine-repository'
import { HistoryRepository } from './repositories/history-repository'
import { BookmarkRepository } from './repositories/bookmark-repository'
function context() { const database = new DatabaseConnection(':memory:'); database.migrate(); const profiles = new ProfileRepository(database.db); const profile = profiles.getDefault(); const settings = new SettingsRepository(database.db); settings.seed(profile.id, { language: 'pt-BR', theme: 'light' }); return { database, profile, settings } }
describe('database foundation', () => {
  it('runs migration and creates the default local profile', () => { const value = context(); expect(value.profile.name).toBe('Perfil 1'); expect(value.database.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='history'").get()).toBeTruthy(); value.database.close() })
  it('persists initial settings', () => { const value = context(); expect(value.settings.get(value.profile.id, 'theme')).toBe('light'); expect(value.settings.get(value.profile.id, 'language')).toBe('pt-BR'); value.database.close() })
  it('isolates history and bookmarks by profile', () => { const value = context(); const other = new ProfileRepository(value.database.db).create('Outro'); const history = new HistoryRepository(value.database.db); history.add(value.profile.id, 'https://one.test', 'One'); history.add(other.id, 'https://two.test', 'Two'); expect(history.list(value.profile.id)).toHaveLength(1); const bookmarks = new BookmarkRepository(value.database.db); bookmarks.create(value.profile.id, 'One', 'https://one.test'); expect(bookmarks.list(other.id)).toHaveLength(0); value.database.close() })
  it('creates the default search engine with valid data', () => { const value = context(); const engines = new SearchEngineRepository(value.database.db); const engine = engines.create(value.profile.id, 'Google', 'https://google.test?q=%s', 'google', true, true); expect(engine.is_default).toBe(1); value.database.close() })
})
