import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck, Globe, History, Plus, RotateCw, Search, Settings, ShieldCheck, X } from 'lucide-react'
import type { BrowserTab } from '../../shared/types'
import './styles.css'

function App() {
  const [tabs, setTabs] = useState<BrowserTab[]>([])
  const [activeId, setActiveId] = useState('')
  const [address, setAddress] = useState('')
  const addressRef = useRef<HTMLInputElement>(null)
  const active = useMemo(() => tabs.find((tab) => tab.id === activeId), [tabs, activeId])

  useEffect(() => {
    void window.grehem.tabs.list().then(setTabs)
    const offUpdate = window.grehem.onTabUpdate((tab) => setTabs((items) => items.some((item) => item.id === tab.id) ? items.map((item) => item.id === tab.id ? tab : item) : [...items, tab]))
    const offActive = window.grehem.onActiveTab(setActiveId)
    return () => { offUpdate(); offActive() }
  }, [])
  useEffect(() => { setAddress(active?.kind === 'newtab' ? '' : active?.url ?? '') }, [active?.id, active?.url, active?.kind])

  const navigate = (input: string) => { if (active && input.trim()) void window.grehem.tabs.navigate(active.id, input).catch(() => undefined) }
  const createTab = () => void window.grehem.tabs.create()
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.ctrlKey && event.key.toLowerCase() === 'l') { event.preventDefault(); addressRef.current?.focus(); addressRef.current?.select() }
    if (event.ctrlKey && event.key.toLowerCase() === 't') { event.preventDefault(); createTab() }
    if (event.key === 'F5' && active) { event.preventDefault(); void window.grehem.tabs.reload(active.id) }
    if (event.altKey && event.key === 'ArrowLeft' && active) { event.preventDefault(); void window.grehem.tabs.back(active.id) }
    if (event.altKey && event.key === 'ArrowRight' && active) { event.preventDefault(); void window.grehem.tabs.forward(active.id) }
  }
  const isLoading = Boolean(active?.isLoading)
  return <div className="app-shell" onKeyDown={onKeyDown}>
    <header className="browser-chrome">
      <div className="tab-strip"><div className="brand-mark" aria-label="Grehem"><span className="brand-symbol">G</span></div><div className="tabs" role="tablist">{tabs.map((tab) => <button className={`tab ${tab.id === activeId ? 'active' : ''}`} role="tab" aria-selected={tab.id === activeId} key={tab.id} onClick={() => void window.grehem.tabs.activate(tab.id)}><span className="tab-icon">{tab.favicon ? <img src={tab.favicon} alt="" /> : <Globe size={14} />}</span><span className="tab-title">{tab.title}</span><X aria-label="Fechar aba" size={14} onClick={(event) => { event.stopPropagation(); void window.grehem.tabs.close(tab.id) }} /></button>)}</div><button className="icon-button" onClick={createTab} aria-label="Nova aba"><Plus size={18} /></button></div>
      <div className="toolbar"><div className="navigation-actions"><button className="icon-button" disabled={!active?.canGoBack} onClick={() => active && void window.grehem.tabs.back(active.id)} aria-label="Voltar"><ArrowLeft size={18} /></button><button className="icon-button" disabled={!active?.canGoForward} onClick={() => active && void window.grehem.tabs.forward(active.id)} aria-label="Avançar"><ArrowRight size={18} /></button><button className="icon-button" onClick={() => active && void (isLoading ? window.grehem.tabs.stop(active.id) : window.grehem.tabs.reload(active.id))} aria-label={isLoading ? 'Parar' : 'Recarregar'}>{isLoading ? <X size={17} /> : <RotateCw size={17} />}</button></div><div className="address-wrap"><ShieldCheck size={16} className="security-icon" /><input ref={addressRef} value={address} onChange={(event) => setAddress(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && navigate(address)} placeholder="Pesquisar ou inserir endereço" aria-label="Barra de endereço" /><button className="address-action" aria-label="Favoritar página"><Bookmark size={17} /></button></div><button className="icon-button" aria-label="Histórico"><History size={19} /></button><button className="icon-button" aria-label="Configurações"><Settings size={19} /></button></div>
    </header>
    {active?.kind === 'newtab' && <main className="new-tab-page"><section className="welcome"><div className="hero-logo"><span className="hero-symbol">G</span><span>grehem</span></div><p className="tagline">Navegue com clareza.</p><div className="home-search"><Search size={19} /><input placeholder="Pesquisar na Web" aria-label="Pesquisar na Web" onKeyDown={(event) => event.key === 'Enter' && navigate(event.currentTarget.value)} /><button onClick={() => { const field = document.querySelector<HTMLInputElement>('.home-search input'); if (field) navigate(field.value) }}>Pesquisar</button></div><div className="quick-links"><button><BookmarkCheck size={16} /> Favoritos</button><button><History size={16} /> Histórico</button><button><Settings size={16} /> Configurações</button></div></section><footer><span>Grehem Browser</span><a href="https://sazamtecnologia.site" target="_blank" rel="noreferrer">from Sazam Tecnologia</a></footer></main>}
    <div className="status-badge" aria-live="polite">{isLoading && <><span className="loading-dot" /> Carregando</>}</div>
  </div>
}
export default App
