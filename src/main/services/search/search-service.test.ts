import { describe, expect, it } from 'vitest'
import { DatabaseConnection } from '../../database/connection'
import { ProfileRepository } from '../../database/repositories/profile-repository'
import { SearchEngineRepository } from '../../database/repositories/search-engine-repository'
import { SearchService } from './search-service'
describe('SearchService', () => {
  it('resolves URLs, domains, and search queries', () => { const database = new DatabaseConnection(':memory:'); database.migrate(); const profile = new ProfileRepository(database.db).getDefault(); const engines = new SearchEngineRepository(database.db); engines.create(profile.id, 'Google', 'https://www.google.com/search?q=%s', 'google', true, true); const service = new SearchService(engines, profile.id); expect(service.resolve('https://example.com')).toBe('https://example.com'); expect(service.resolve('example.com')).toBe('https://example.com'); expect(service.resolve('como criar um navegador')).toBe('https://www.google.com/search?q=como%20criar%20um%20navegador'); database.close() })
  it('rejects a default engine with an invalid template', () => { const database = new DatabaseConnection(':memory:'); database.migrate(); const profile = new ProfileRepository(database.db).getDefault(); const engines = new SearchEngineRepository(database.db); expect(() => engines.create(profile.id, 'Broken', 'https://example.com/search', 'broken', false, true)).toThrow(/placeholder/); database.close() })
})
