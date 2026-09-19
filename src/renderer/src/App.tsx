import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Bookmark, Globe, Menu, MoreHorizontal, Plus, RotateCw, Search, ShieldCheck, X } from 'lucide-react'
import type { BrowserTab } from '../shared/types'
import './styles.css'

function App() {
  const [tabs, setTabs] = useState<BrowserTab[]>([])
  const [activeId, setActiveId] = useState('')
  const active = useMemo(() => tabs.find((tab) => tab.id === activeId), [tabs, activeId])
  const [address, setAddress] = useState('')

  useEffect(() => {
    window.grehem.tabs.list().then((items) => setTabs(items))
    const offUpdate = window.grehem.onTabUpdate((tab) => setTabs((items) => { const exists = items.some((item) => item.id === tab.id); return exists ? items.map((item) => item.id === tab.id ? tab : item) : [...items, tab] }))
    const offActive = window.grehem.onActiveTab((id) => setActiveId(id))
    const offNew = window.grehem.onNewTab(() => createNewTab())
    return () => { offUpdate(); offActive(); offNew() }
  }, [])
  useEffect(() => { setAddress(active?.url?.startsWith('grehem://') ? '' : active?.url || '') }, [active?.id, active?.url])
  async function createNewTab() { await window.grehem.tabs.create() }
  async function submitAddress() { if (active) await window.grehem.tabs.navigate(active.id, address) }
  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) { if (event.key === 'Enter') submitAddress() }
  async function close(id: string, event: React.MouseEvent) { event.stopPropagation(); await window.grehem.tabs.close(id) }
  const isLoading = Boolean(active?.isLoading)
  return <div className="app-shell">
    <header className="browser-chrome">
      <div className="tab-strip">
        <div className="brand-mark" aria-label="Grehem"><span className="brand-symbol">G</span></div>
        <div className="tabs" role="tablist">{tabs.map((tab) => <button className={`tab ${tab.id === activeId ? 'active' : ''}`} role="tab" aria-selected={tab.id === activeId} key={tab.id} onClick={() => window.grehem.tabs.activate(tab.id)}><span className="tab-icon">{tab.favicon ? <img src={tab.favicon} /> : <Globe size={14} />}</span><span className="tab-title">{tab.title}</span><X size={14} className="tab-close" onClick={(event) => close(tab.id, event)} /></button>)}</div>
        <button className="icon-button new-tab" onClick={createNewTab} aria-label="Nova aba"><Plus size={18} /></button><button className="icon-button" aria-label="Menu"><MoreHorizontal size={20} /></button>
      </div>
      <div className="toolbar">
        <div className="navigation-actions"><button className="icon-button" disabled={!active?.canGoBack} onClick={() => active && window.grehem.tabs.back(active.id)} aria-label="Voltar"><ArrowLeft size={18} /></button><button className="icon-button" disabled={!active?.canGoForward} onClick={() => active && window.grehem.tabs.forward(active.id)} aria-label="Avançar"><ArrowRight size={18} /></button><button className="icon-button" onClick={() => active && (isLoading ? window.grehem.tabs.stop(active.id) : window.grehem.tabs.reload(active.id))} aria-label={isLoading ? 'Parar' : 'Recarregar'}>{isLoading ? <X size={17} /> : <RotateCw size={17} />}</button></div>
        <div className="address-wrap"><ShieldCheck size={16} className="security-icon" /><input value={address} onChange={(event) => setAddress(event.target.value)} onKeyDown={handleKeyDown} placeholder="Pesquisar ou inserir endereço" aria-label="Barra de endereço" /><button className="address-action" aria-label="Adicionar aos favoritos"><Bookmark size={17} /></button></div>
        <button className="icon-button" aria-label="Menu principal"><Menu size={20} /></button>
      </div>
    </header>
    {active?.kind === 'newtab' && <main className="new-tab-page"><section className="welcome"><div className="hero-logo"><span className="hero-symbol">G</span><span>grehem</span></div><p className="tagline">Uma nova forma de navegar.</p><div className="home-search"><Search size={19} /><input placeholder="Pesquisar na Web" onKeyDown={(event) => { if (event.key === 'Enter') { setAddress(event.currentTarget.value); window.grehem.tabs.navigate(active.id, event.currentTarget.value) } }} /><button onClick={() => { const input = document.querySelector<HTMLInputElement>('.home-search input'); if (input?.value) window.grehem.tabs.navigate(active.id, input.value) }}>Pesquisar</button></div><div className="quick-links"><button><span className="quick-icon">+</span><span>Adicionar atalho</span></button><button><span className="quick-icon muted"><Bookmark size={16} /></span><span>Favoritos</span></button><button><span className="quick-icon muted"><RotateCw size={16} /></span><span>Histórico recente</span></button></div></section><footer> <span>Grehem Browser</span><a href="https://sazamtecnologia.site" target="_blank" rel="noreferrer">from Sazam Tecnologia</a></footer></main>}
    <div className="status-badge" aria-live="polite">{isLoading && <><span className="loading-dot" /> Carregando</>}</div>
  </div>
}
export default App
