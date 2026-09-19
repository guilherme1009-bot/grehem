import type { SearchEngineRepository } from '../../database/repositories/search-engine-repository'
export class SearchService {
  constructor(private readonly engines: SearchEngineRepository, private readonly profileId: number) {}
  resolve(query: string): string { const value = query.trim(); if (!value) return 'grehem://newtab'; if (/^grehem:\/\//i.test(value) || /^[a-z][a-z\d+.-]*:\/\//i.test(value)) return value; if (/^(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(value) || value.includes('.')) return `https://${value}`; const engine = this.engines.getDefault(this.profileId); if (!engine || !engine.search_url.includes('%s')) throw new Error('Mecanismo de pesquisa inválido'); return engine.search_url.replaceAll('%s', encodeURIComponent(value)) }
}
