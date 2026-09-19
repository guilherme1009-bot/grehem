import { describe, expect, it } from 'vitest'

function resolveInput(value: string) {
  const input = value.trim()
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(input)) return input
  if (input.includes('.')) return `https://${input}`
  return `https://www.google.com/search?q=${encodeURIComponent(input)}`
}

describe('address resolution', () => {
  it('keeps complete URLs', () => expect(resolveInput('https://example.com')).toBe('https://example.com'))
  it('adds HTTPS to domains', () => expect(resolveInput('example.com')).toBe('https://example.com'))
  it('creates a real search URL for terms', () => expect(resolveInput('notebooks baratos')).toBe('https://www.google.com/search?q=notebooks%20baratos'))
})
