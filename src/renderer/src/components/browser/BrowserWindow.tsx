import { useEffect, useMemo, useRef, useState } from 'react'
import { Menu, MoreHorizontal } from 'lucide-react'
import type { BrowserTab } from '../../../shared/types'
import { TabBar } from './TabBar'
import { NavigationBar } from './NavigationBar'
import { BrowserMenu } from './BrowserMenu'
import { NewTabPage } from './NewTabPage'
import './browser-window.css'

type Panel = 'none' | 'history' | 'bookmarks' | 'settings'
export function BrowserWindow() {
  const [tabs, setTabs] = useState<BrowserTab[]>([]); const [activeId, setActiveId] = useState(''); const [address, setAddress] = useState(''); const [menuOpen, setMenuOpen] = useState(false); const [panel, setPanel] = useState<Panel>('none'); const addressRef = useRef<HTMLInputElement>(null)
  const active = useMemo(() => tabs.find((tab) => tab.id === activeId), [tabs, activeId])
  useEffect(() => { void window.grehem.tabs.list().then(setTabs); const offUpdate = window.grehem.onTabUpdate((tab) => setTabs((items) => items.some((item) => item.id === tab.id) ? items.map((item) => item.id === tab.id ? tab : item) : [...items, tab])); const offActive = window.grehem.onActiveTab(setActiveId); return () => { offUpdate(); offActive() } }, [])
  useEffect(() => { setAddress(active?.kind === 'newtab' ? '' : active?.url ?? '') }, [active?.id, active?.url, active?.kind])
  const navigate = (value: string) => { if (active && value.trim()) void window.grehem.tabs.navigate(active.id, value).catch(() => undefined) }
  const createTab = () => void window.grehem.tabs.create(); const closeTab = (id: string) => void window.grehem.tabs.close(id); const togglePanel = (value: Exclude<Panel, 'none'>) => setPanel(panel === value ? 'none' : value)
  const onKeyDown = (event: React.KeyboardEvent) => { if (event.ctrlKey && event.key.toLowerCase() === 'l') { event.preventDefault(); addressRef.current?.focus(); addressRef.current?.select() } if (event.ctrlKey && event.key.toLowerCase() === 't') { event.preventDefault(); createTab() } if (event.key === 'F5' && active) { event.preventDefault(); void window.grehem.tabs.reload(active.id) } if (event.altKey && event.key === 'ArrowLeft' && active) { event.preventDefault(); void window.grehem.tabs.back(active.id) } if (event.altKey && event.key === 'ArrowRight' && active) { event.preventDefault(); void window.grehem.tabs.forward(active.id) } if (event.ctrlKey && event.key.toLowerCase() === 'h') { event.preventDefault(); setPanel('history') } }
  const searchEngineName = 'Google'
  return <div className="browser-window" onKeyDown={onKeyDown}><header className="browser-header"><TabBar tabs={tabs} activeId={activeId} onActivate={(id) => void window.grehem.tabs.activate(id)} onClose={closeTab} onNewTab={createTab} /><div className="toolbar-row"><NavigationBar active={active} address={address} isBookmarked={false} addressRef={addressRef} onAddressChange={setAddress} onNavigate={() => navigate(address)} onBack={() => active && void window.grehem.tabs.back(active.id)} onForward={() => active && void window.grehem.tabs.forward(active.id)} onReload={() => active && void (active.isLoading ? window.grehem.tabs.stop(active.id) : window.grehem.tabs.reload(active.id))} onToggleBookmark={() => setPanel('bookmarks')} onFocusAddress={() => addressRef.current?.select()} /><button className="chrome-button toolbar-menu" onClick={() => setMenuOpen((open) => !open)} aria-label="Menu principal"><Menu size={18} /></button></div></header>{active?.kind === 'newtab' && <NewTabPage onSearch={navigate} onPanel={togglePanel} searchEngineName={searchEngineName} />}{menuOpen && <BrowserMenu onClose={() => setMenuOpen(false)} onNewTab={createTab} onPanel={togglePanel} />}{panel !== 'none' && <aside className="window-panel"><div className="window-panel-title"><strong>{panel === 'history' ? 'Histórico' : panel === 'bookmarks' ? 'Favoritos' : 'Configurações'}</strong><button className="chrome-button" onClick={() => setPanel('none')} aria-label="Fechar painel"><MoreHorizontal size={17} /></button></div><p className="panel-placeholder">Abra este recurso pelo painel existente do Grehem.</p></aside>}{active?.isLoading && <div className="window-loading" aria-label="Página carregando" />}</div>
}
