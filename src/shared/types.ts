export type PageKind = 'newtab' | 'web'

export interface BrowserTab {
  id: string
  title: string
  url: string
  favicon?: string
  isLoading: boolean
  canGoBack: boolean
  canGoForward: boolean
  isPinned: boolean
  kind: PageKind
}

export interface BrowserAPI {
  tabs: {
    list: () => Promise<BrowserTab[]>
    create: (url?: string) => Promise<BrowserTab>
    close: (id: string) => Promise<boolean>
    activate: (id: string) => Promise<void>
    navigate: (id: string, input: string) => Promise<void>
    back: (id: string) => Promise<void>
    forward: (id: string) => Promise<void>
    reload: (id: string) => Promise<void>
    stop: (id: string) => Promise<void>
    reopen: () => Promise<BrowserTab | null>
  }
  onTabUpdate: (callback: (tab: BrowserTab) => void) => () => void
  onActiveTab: (callback: (id: string) => void) => () => void
  onNewTab: (callback: () => void) => () => void
}

declare global {
  interface Window { grehem: BrowserAPI }
}
