import { describe, expect, it } from 'vitest'
import { DatabaseConnection } from '../../database/connection'
import { ProfileRepository } from '../../database/repositories/profile-repository'
import { SearchEngineRepository } from '../../database/repositories/search-engine-repository'
import { SearchService } from './search-service'
describe('SearchService', () => {
  function setup() { const database = new DatabaseConnection(':memory:'); database.migrate(); const profile = new ProfileRepository(database.db).getDefault(); const engines = new SearchEngineRepository(database.db); engines.create(profile.id, 'Google', 'https://www.google.com/search?q=%s', 'google', true, true); return { database, profile, engines } }
  it('allows only safe protocols and valid URLs', () => { const value = setup(); const service = new SearchService(value.engines, value.profile.id); expect(service.resolve('https://example.com/a')).toBe('https://example.com/a'); expect(service.resolve('grehem://newtab')).toBe('grehem://newtab'); expect(() => service.resolve('file:///etc/passwd')).toThrow(); expect(() => service.resolve('javascript://alert(1)')).toThrow(); value.database.close() })
  it('keeps dotted sentences as searches and valid hostnames as URLs', () => { const value = setup(); const service = new SearchService(value.engines, value.profile.id); expect(service.resolve('example.com')).toBe('https://example.com'); expect(service.resolve('www.example.com')).toBe('https://www.example.com'); expect(service.resolve('localhost:3000')).toBe('https://localhost:3000'); expect(service.resolve('melhores notebooks. custo benefício')).toContain('https://www.google.com/search?q='); expect(service.resolve('qual é a versão 2.0 do produto')).toContain('https://www.google.com/search?q='); value.database.close() })
})
