import { app, BrowserWindow, BrowserView, WebContentsView, ipcMain, session } from 'electron'
import { join } from 'node:path'
import { randomUUID } from 'node:crypto'
import type { BrowserTab } from '../shared/types'

const HOME_URL = 'grehem://newtab'
const SEARCH_URL = 'https://www.google.com/search?q='

interface ManagedTab extends BrowserTab { view?: WebContentsView }
let mainWindow: BrowserWindow | null = null
let activeTabId = ''
const tabs = new Map<string, ManagedTab>()
const closedTabs: Array<{ url: string; title: string }> = []

function getTab(id: string) { return tabs.get(id) }
function snapshot(tab: ManagedTab): BrowserTab { return { id: tab.id, title: tab.title, url: tab.url, favicon: tab.favicon, isLoading: tab.isLoading, canGoBack: tab.canGoBack, canGoForward: tab.canGoForward, isPinned: tab.isPinned, kind: tab.kind } }
function emit(channel: string, value: unknown) { mainWindow?.webContents.send(channel, value) }
function emitTab(tab: ManagedTab) { emit('tab:update', snapshot(tab)) }
function setBounds() {
  if (!mainWindow) return
  const [width, height] = mainWindow.getContentSize()
  for (const tab of tabs.values()) if (tab.view && tab.id === activeTabId) tab.view.setBounds({ x: 0, y: 112, width, height: Math.max(0, height - 112) })
}
function detach(tab: ManagedTab) { if (tab.view && mainWindow) mainWindow.contentView.removeChildView(tab.view) }
function attach(tab: ManagedTab) {
  if (!mainWindow || !tab.view) return
  mainWindow.contentView.addChildView(tab.view)
  setBounds()
}
function parseInput(input: string) {
  const value = input.trim()
  if (!value) return HOME_URL
  if (/^grehem:\/\//i.test(value)) return value
  if (/^[a-z][a-z\d+.-]*:\/\//i.test(value)) return value
  if (/^(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(value) || value.includes('.')) return `https://${value}`
  return `${SEARCH_URL}${encodeURIComponent(value)}`
}
function wireView(tab: ManagedTab) {
  const wc = tab.view!.webContents
  wc.on('did-start-loading', () => { tab.isLoading = true; emitTab(tab) })
  wc.on('did-stop-loading', () => { tab.isLoading = false; tab.canGoBack = wc.canGoBack(); tab.canGoForward = wc.canGoForward(); emitTab(tab) })
  wc.on('page-title-updated', (_event, title) => { tab.title = title || 'Nova aba'; emitTab(tab) })
  wc.on('page-favicon-updated', (_event, favicons) => { tab.favicon = favicons[0]; emitTab(tab) })
  wc.on('did-navigate', (_event, url) => { tab.url = url; tab.kind = 'web'; tab.canGoBack = wc.canGoBack(); tab.canGoForward = wc.canGoForward(); emitTab(tab) })
  wc.on('did-navigate-in-page', (_event, url) => { tab.url = url; emitTab(tab) })
  wc.on('render-process-gone', () => { tab.isLoading = false; tab.title = 'Página encerrada'; emitTab(tab) })
}
async function createTab(url = HOME_URL): Promise<BrowserTab> {
  const id = randomUUID()
  const isHome = url.startsWith('grehem://')
  const tab: ManagedTab = { id, title: isHome ? 'Nova aba' : 'Carregando…', url, isLoading: !isHome, canGoBack: false, canGoForward: false, isPinned: false, kind: isHome ? 'newtab' : 'web' }
  if (!isHome) { tab.view = new WebContentsView({ webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false, partition: `persist:profile-${app.getName()}` } }); wireView(tab); await tab.view.webContents.loadURL(url) }
  tabs.set(id, tab)
  await activateTab(id)
  return snapshot(tab)
}
async function activateTab(id: string) {
  const next = getTab(id); if (!next || !mainWindow) return
  const previous = getTab(activeTabId); if (previous && previous.id !== id) detach(previous)
  activeTabId = id
  if (next.view) attach(next)
  emit('tab:active', id)
  emitTab(next)
}
async function navigate(id: string, input: string) {
  const tab = getTab(id); if (!tab) return
  const url = parseInput(input)
  if (url.startsWith('grehem://')) { if (tab.view) { tab.view.webContents.close(); tab.view = undefined } tab.url = url; tab.title = 'Nova aba'; tab.kind = 'newtab'; tab.isLoading = false; emitTab(tab); return }
  if (!tab.view) { tab.view = new WebContentsView({ webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false } }); wireView(tab); if (tab.id === activeTabId) attach(tab) }
  tab.kind = 'web'; tab.url = url; tab.isLoading = true; emitTab(tab); await tab.view.webContents.loadURL(url)
}
async function closeTab(id: string) {
  const tab = getTab(id); if (!tab) return false
  closedTabs.push({ url: tab.url, title: tab.title }); if (closedTabs.length > 20) closedTabs.shift()
  detach(tab); tab.view?.webContents.close(); tabs.delete(id)
  if (tabs.size === 0) { await createTab(); return true }
  if (activeTabId === id) await activateTab(Array.from(tabs.keys())[Math.max(0, Array.from(tabs.keys()).indexOf(id) - 1)])
  else emit('tab:active', activeTabId)
  emit('tabs:list', Array.from(tabs.values()).map(snapshot)); return true
}
function registerIpc() {
  ipcMain.handle('tabs:list', () => Array.from(tabs.values()).map(snapshot))
  ipcMain.handle('tabs:create', (_e, url?: string) => createTab(url))
  ipcMain.handle('tabs:close', (_e, id: string) => closeTab(id))
  ipcMain.handle('tabs:activate', (_e, id: string) => activateTab(id))
  ipcMain.handle('tabs:navigate', (_e, id: string, input: string) => navigate(id, input))
  ipcMain.handle('tabs:back', (_e, id: string) => getTab(id)?.view?.webContents.goBack())
  ipcMain.handle('tabs:forward', (_e, id: string) => getTab(id)?.view?.webContents.goForward())
  ipcMain.handle('tabs:reload', (_e, id: string) => getTab(id)?.view?.webContents.reload())
  ipcMain.handle('tabs:stop', (_e, id: string) => getTab(id)?.view?.webContents.stop())
  ipcMain.handle('tabs:reopen', (_e) => { const item = closedTabs.pop(); return item ? createTab(item.url) : null })
}
async function createWindow() {
  mainWindow = new BrowserWindow({ width: 1366, height: 820, minWidth: 900, minHeight: 600, backgroundColor: '#f7f8fa', title: 'Grehem Browser', webPreferences: { preload: join(__dirname, '../preload/index.mjs'), contextIsolation: true, sandbox: true, nodeIntegration: false } })
  mainWindow.on('resize', setBounds)
  mainWindow.on('closed', () => { mainWindow = null })
  await mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL || `file://${join(__dirname, '../renderer/index.html')}`)
  await createTab()
}
app.whenReady().then(() => { registerIpc(); session.defaultSession.setPermissionRequestHandler((_webContents, permission, callback) => callback(['media', 'geolocation', 'notifications'].includes(permission) ? false : false)); createWindow(); app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() }) })
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
