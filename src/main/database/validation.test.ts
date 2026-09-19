import { describe, expect, it } from 'vitest'
import { DatabaseConnection } from './connection'
import { ProfileRepository } from './repositories/profile-repository'
import { SearchEngineRepository } from './repositories/search-engine-repository'
describe('search engine validation', () => {
  it.each([
    ['', 'https://example.test?q=%s', 'example', /name/],
    ['Example', 'https://example.test?q=%s', '', /keyword/],
    ['Example', '', 'example', /search_url/],
    ['Example', 'https://example.test/search', 'example', /placeholder/]
  ])('rejects invalid engine input', (name, url, keyword, error) => { const database = new DatabaseConnection(':memory:'); database.migrate(); const profile = new ProfileRepository(database.db).getDefault(); const engines = new SearchEngineRepository(database.db); expect(() => engines.create(profile.id, name, url, keyword)).toThrow(error); database.close() })
  it('rejects whitespace-only values', () => { const database = new DatabaseConnection(':memory:'); database.migrate(); const profile = new ProfileRepository(database.db).getDefault(); const engines = new SearchEngineRepository(database.db); expect(() => engines.create(profile.id, '  ', 'https://example.test?q=%s', 'example')).toThrow(/name/); expect(() => engines.create(profile.id, 'Example', '  ', 'example')).toThrow(/search_url/); expect(() => engines.create(profile.id, 'Example', 'https://example.test?q=%s', '  ')).toThrow(/keyword/); database.close() })
})
