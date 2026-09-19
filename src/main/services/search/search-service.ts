import type { SqliteDatabase } from '../connection'

const allowedProtocols = new Set(['http:', 'https:', 'grehem:'])
const explicitScheme = /^[a-z][a-z\d+.-]*:/i
const hostnamePattern = /^(localhost|127\.0\.0\.1|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,})(?::\d{1,5})?(?:\/[^\s]*)?$/i
export function isNavigableUrl(value: string): boolean {
  if (/\s/.test(value)) return false
  try {
    const parsed = new URL(value)
    return allowedProtocols.has(parsed.protocol) && (parsed.protocol === 'grehem:' ? value.startsWith('grehem://') : Boolean(parsed.hostname))
  } catch { return false }
}
export function looksLikeHostname(value: string): boolean { return !/\s/.test(value) && hostnamePattern.test(value) }
export class SearchService {
  constructor(private readonly engines: SearchEngineRepository, private readonly profileId: number) {}
  resolve(input: string): string {
    const value = input.trim()
    if (!value) return 'grehem://newtab'
    if (explicitScheme.test(value)) {
      if (!isNavigableUrl(value)) throw new Error('Protocolo não permitido')
      return value
    }
    if (looksLikeHostname(value)) return `https://${value}`
    const engine = this.engines.getDefault(this.profileId)
    if (!engine || !engine.search_url.includes('%s')) throw new Error('Mecanismo de pesquisa inválido')
    return engine.search_url.replaceAll('%s', encodeURIComponent(value))
  }
}
