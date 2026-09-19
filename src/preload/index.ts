import { contextBridge, ipcRenderer } from 'electron'
import type { BrowserAPI } from '../shared/types'
const api: BrowserAPI = {
  tabs: { list: () => ipcRenderer.invoke('tabs:list'), create: (url) => ipcRenderer.invoke('tabs:create', url), close: (id) => ipcRenderer.invoke('tabs:close', id), activate: (id) => ipcRenderer.invoke('tabs:activate', id), navigate: (id, input) => ipcRenderer.invoke('tabs:navigate', id, input), back: (id) => ipcRenderer.invoke('tabs:back', id), forward: (id) => ipcRenderer.invoke('tabs:forward', id), reload: (id) => ipcRenderer.invoke('tabs:reload', id), stop: (id) => ipcRenderer.invoke('tabs:stop', id), reopen: () => ipcRenderer.invoke('tabs:reopen') },
  settings: { list: () => ipcRenderer.invoke('settings:list'), set: (key, value) => ipcRenderer.invoke('settings:set', key, value) },
  history: { list: (query) => ipcRenderer.invoke('history:list', query), delete: (id) => ipcRenderer.invoke('history:delete', id), clear: () => ipcRenderer.invoke('history:clear') },
  bookmarks: { list: (query) => ipcRenderer.invoke('bookmarks:list', query), findByUrl: (url) => ipcRenderer.invoke('bookmarks:find-by-url', url), create: (title, url, folderId) => ipcRenderer.invoke('bookmarks:create', title, url, folderId), delete: (id) => ipcRenderer.invoke('bookmarks:delete', id) },
  bookmarkFolders: { list: () => ipcRenderer.invoke('bookmark-folders:list'), create: (name, parentId) => ipcRenderer.invoke('bookmark-folders:create', name, parentId) },
  searchEngines: { list: () => ipcRenderer.invoke('search-engines:list'), setDefault: (id) => ipcRenderer.invoke('search-engines:set-default', id), create: (name, keyword, searchUrl) => ipcRenderer.invoke('search-engines:create', name, keyword, searchUrl), delete: (id) => ipcRenderer.invoke('search-engines:delete', id) },
  onTabUpdate: (callback) => { const listener = (_event: Electron.IpcRendererEvent, tab: Parameters<NonNullable<BrowserAPI['onTabUpdate']>>[0]) => callback(tab); ipcRenderer.on('tab:update', listener); return () => ipcRenderer.removeListener('tab:update', listener) },
  onActiveTab: (callback) => { const listener = (_event: Electron.IpcRendererEvent, id: string) => callback(id); ipcRenderer.on('tab:active', listener); return () => ipcRenderer.removeListener('tab:active', listener) },
  onNewTab: (callback) => { const listener = () => callback(); ipcRenderer.on('tab:new', listener); return () => ipcRenderer.removeListener('tab:new', listener) }
}
contextBridge.exposeInMainWorld('grehem', api)
