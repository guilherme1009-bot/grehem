export interface BrowserTab { id: string; title: string; url: string; favicon?: string; isLoading: boolean; canGoBack: boolean; canGoForward: boolean; isPinned: boolean; kind: 'newtab' | 'web' }
