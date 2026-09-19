import { useEffect, useMemo, useRef, useState } from 'react'
import type { BrowserTab, Bookmark, BookmarkFolder, HistoryEntry, SearchEngine, Setting } from '../../../shared/types'
import { Menu } from 'lucide-react'
import { TabBar } from './TabBar'
import { NavigationBar } from './NavigationBar'
import { BrowserMenu } from './BrowserMenu'
import { NewTabPage } from './NewTabPage'
import './browser-window.css'

type Panel = 'none' | 'history' | 'bookmarks' | 'settings'

export function BrowserWindow() {
  const [tabs, setTabs] = useState<BrowserTab[]>([])
  const [activeId, setActiveId] = useState('')
  const [address, setAddress] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [panel, setPanel] = useState<Panel>('none')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [folders, setFolders] = useState<BookmarkFolder[]>([])
  const [engines, setEngines] = useState<SearchEngine[]>([])
  const [settings, setSettings] = useState<Setting[]>([])
  const [historyQuery, setHistoryQuery] = useState('')
  const [folderId, setFolderId] = useState<number | null>(null)
  const addressRef = useRef<HTMLInputElement>(null)
  const active = useMemo(() => tabs.find((tab) => tab.id === activeId), [tabs, activeId])
  const currentBookmark = bookmarks.find((item) => item.url === active?.url)
  const defaultEngine = engines.find((engine) => engine.is_default)

  useEffect(() => {
    void Promise.all([window.grehem.tabs.list(), window.grehem.searchEngines.list(), window.grehem.settings.list(), window.grehem.bookmarks.list()]).then(([tabItems, engineItems, settingItems, bookmarkItems]) => { setTabs(tabItems); setEngines(engineItems); setSettings(settingItems); setBookmarks(bookmarkItems) })
    const offUpdate = window.grehem.onTabUpdate((tab) => setTabs((items) => items.some((item) => item.id === tab.id) ? items.map((item) => item.id === tab.id ? tab : item) : [...items, tab]))
    const offActive = window.grehem.onActiveTab(setActiveId)
    return () => { offUpdate(); offActive() }
  }, [])
  useEffect(() => { setAddress(active?.kind === 'newtab' ? '' : active?.url ?? '') }, [active?.id, active?.url, active?.kind])
  useEffect(() => {
    if (panel === 'history') void window.grehem.history.list(historyQuery).then(setHistory)
    if (panel === 'bookmarks') void Promise.all([window.grehem.bookmarks.list(), window.grehem.bookmarkFolders.list()]).then(([items, folderItems]) => { setBookmarks(items); setFolders(folderItems) })
  }, [panel, historyQuery])

  const refreshBookmarks = async () => setBookmarks(await window.grehem.bookmarks.list())
  const navigate = (value: string) => { if (active && value.trim()) void window.grehem.tabs.navigate(active.id, value).catch(() => undefined) }
  const createTab = () => void window.grehem.tabs.create()
  const openPanel = (next: Exclude<Panel, 'none'>) => { setMenuOpen(false); setPanel(panel === next ? 'none' : next) }
  const setting = (key: string) => settings.find((item) => item.key === key)?.value ?? ''
  const saveSetting = async (key: string, value: string) => { await window.grehem.settings.set(key, value); setSettings(await window.grehem.settings.list()) }
  const toggleBookmark = async () => {
    if (!active || active.kind === 'newtab') return
    if (currentBookmark) await window.grehem.bookmarks.delete(currentBookmark.id)
    else await window.grehem.bookmarks.create(active.title === 'Carregando…' ? '' : active.title, active.url, folderId)
    await refreshBookmarks()
  }
  const createFolder = async () => { const name = window.prompt('Nome da pasta'); if (name?.trim()) { const folder = await window.grehem.bookmarkFolders.create(name); setFolders(await window.grehem.bookmarkFolders.list()); setFolderId(folder.id) } }
  const onKeyDown = (event: React.KeyboardEvent) => {
    const key = event.key.toLowerCase()
    if (event.ctrlKey && key === 'l') { event.preventDefault(); addressRef.current?.focus(); addressRef.current?.select() }
    if (event.ctrlKey && key === 't') { event.preventDefault(); createTab() }
    if (event.ctrlKey && key === 'w' && active) { event.preventDefault(); void window.grehem.tabs.close(active.id) }
    if (event.ctrlKey && key === 'd') { event.preventDefault(); void toggleBookmark() }
    if (event.ctrlKey && key === 'h') { event.preventDefault(); openPanel('history') }
    if ((event.ctrlKey && key === 'r') || event.key === 'F5') { event.preventDefault(); if (active) void window.grehem.tabs.reload(active.id) }
    if (event.altKey && event.key === 'ArrowLeft' && active) { event.preventDefault(); void window.grehem.tabs.back(active.id) }
    if (event.altKey && event.key === 'ArrowRight' && active) { event.preventDefault(); void window.grehem.tabs.forward(active.id) }
  }

  return <div className="browser-window" onKeyDown={onKeyDown}>
    <header className="browser-header"><TabBar tabs={tabs} activeId={activeId} onActivate={(id) => void window.grehem.tabs.activate(id)} onClose={(id) => void window.grehem.tabs.close(id)} onNewTab={createTab} /><div className="toolbar-row"><NavigationBar active={active} address={address} isBookmarked={Boolean(currentBookmark)} addressRef={addressRef} onAddressChange={setAddress} onNavigate={() => navigate(address)} onBack={() => active && void window.grehem.tabs.back(active.id)} onForward={() => active && void window.grehem.tabs.forward(active.id)} onReload={() => active && void (active.isLoading ? window.grehem.tabs.stop(active.id) : window.grehem.tabs.reload(active.id))} onToggleBookmark={() => void toggleBookmark()} onFocusAddress={() => addressRef.current?.select()} /><button className="chrome-button toolbar-menu" onClick={() => setMenuOpen((value) => !value)} aria-label="Menu principal"><Menu size={18} /></button></div></header>
    {active?.kind === 'newtab' && <NewTabPage onSearch={navigate} onPanel={openPanel} searchEngineName={defaultEngine?.name ?? 'Google'} />}
    {menuOpen && <BrowserMenu onClose={() => setMenuOpen(false)} onNewTab={createTab} onPanel={openPanel} />}
    {panel !== 'none' && <aside className="window-panel"><div className="panel-heading"><strong>{panel === 'history' ? 'Histórico' : panel === 'bookmarks' ? 'Favoritos' : 'Configurações'}</strong><button className="panel-close" onClick={() => setPanel('none')} aria-label="Fechar painel">×</button></div>
      {panel === 'history' && <><input className="panel-input" placeholder="Pesquisar histórico" value={historyQuery} onChange={(event) => setHistoryQuery(event.target.value)} /><button className="panel-danger" onClick={async () => { await window.grehem.history.clear(); setHistory([]) }}>Limpar histórico</button>{history.length === 0 ? <p className="empty-state">Você ainda não possui histórico.</p> : history.map((item) => <div className="panel-row" key={item.id}><button onClick={() => { navigate(item.url); setPanel('none') }}><strong>{item.title || item.url}</strong><small>{item.url}</small></button><button onClick={() => void window.grehem.history.delete(item.id).then(() => window.grehem.history.list(historyQuery).then(setHistory))} aria-label="Excluir histórico">×</button></div>)}</>}
      {panel === 'bookmarks' && <><button className="panel-action" onClick={() => void createFolder()}>+ Nova pasta</button><label className="panel-label">Pasta ao salvar<select value={folderId ?? ''} onChange={(event) => setFolderId(event.target.value ? Number(event.target.value) : null)}><option value="">Sem pasta</option>{folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}</select></label>{bookmarks.length === 0 ? <p className="empty-state">Nenhum favorito salvo.</p> : bookmarks.map((item) => <div className="panel-row" key={item.id}><button onClick={() => { navigate(item.url); setPanel('none') }}><strong>{item.title || item.url}</strong><small>{item.url}</small></button><button onClick={() => void window.grehem.bookmarks.delete(item.id).then(refreshBookmarks)} aria-label="Excluir favorito">×</button></div>)}</>}
      {panel === 'settings' && <div className="settings-form"><label>Idioma<select value={setting('language')} onChange={(event) => void saveSetting('language', event.target.value)}><option value="pt-BR">Português (Brasil)</option><option value="en-US">English</option><option value="es-ES">Español</option></select></label><label>Tema<select value={setting('theme')} onChange={(event) => void saveSetting('theme', event.target.value)}><option value="light">Claro</option></select></label><label>Zoom<input type="number" min="25" max="200" value={setting('zoom')} onChange={(event) => void saveSetting('zoom', event.target.value)} /></label><label>Mecanismo<select value={defaultEngine?.id ?? ''} onChange={async (event) => { await window.grehem.searchEngines.setDefault(Number(event.target.value)); setEngines(await window.grehem.searchEngines.list()) }}>{engines.map((engine) => <option key={engine.id} value={engine.id}>{engine.name}</option>)}</select></label><label>Página inicial<input value={setting('homePage')} onChange={(event) => void saveSetting('homePage', event.target.value)} /></label></div>}
    </aside>}
    {active?.isLoading && <div className="window-loading" aria-label="Página carregando" />}
  </div>
}
