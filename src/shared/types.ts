import type { BrowserTab } from './browser-types'
import type { Bookmark, BookmarkFolder, HistoryEntry, SearchEngine, Setting } from './data-types'
export type { BrowserTab } from './browser-types'
export interface BrowserAPI {
  tabs: { list: () => Promise<BrowserTab[]>; create: (url?: string) => Promise<BrowserTab>; close: (id: string) => Promise<boolean>; activate: (id: string) => Promise<void>; navigate: (id: string, input: string) => Promise<void>; back: (id: string) => Promise<void>; forward: (id: string) => Promise<void>; reload: (id: string) => Promise<void>; stop: (id: string) => Promise<void>; reopen: () => Promise<BrowserTab | null> }
  settings: { list: () => Promise<Setting[]>; set: (key: string, value: string) => Promise<void> }
  history: { list: (query?: string) => Promise<HistoryEntry[]>; delete: (id: number) => Promise<void>; clear: () => Promise<void> }
  bookmarks: { list: (query?: string) => Promise<Bookmark[]>; findByUrl: (url: string) => Promise<Bookmark | null>; create: (title: string, url: string, folderId?: number | null) => Promise<Bookmark>; delete: (id: number) => Promise<void> }
  bookmarkFolders: { list: () => Promise<BookmarkFolder[]>; create: (name: string, parentId?: number | null) => Promise<BookmarkFolder> }
  searchEngines: { list: () => Promise<SearchEngine[]>; setDefault: (id: number) => Promise<void>; create: (name: string, keyword: string, searchUrl: string) => Promise<SearchEngine> }
  onTabUpdate: (callback: (tab: BrowserTab) => void) => () => void
  onActiveTab: (callback: (id: string) => void) => () => void
  onNewTab: (callback: () => void) => () => void
}
declare global { interface Window { grehem: BrowserAPI } }
