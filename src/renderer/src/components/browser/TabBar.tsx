import type { BrowserTab } from '../../../shared/types'
import { Globe, X } from 'lucide-react'

interface TabBarProps {
  tabs: BrowserTab[]
  activeId: string
  onActivate: (id: string) => void
  onClose: (id: string) => void
  onNewTab: () => void
}

export function TabBar({ tabs, activeId, onActivate, onClose, onNewTab }: TabBarProps) {
  return <div className="tab-bar" role="tablist" aria-label="Abas abertas">
    <div className="tab-brand" aria-label="Grehem"><span className="brand-symbol">G</span><span className="brand-name">Grehem</span></div>
    <div className="tab-list">{tabs.map((tab) => <button key={tab.id} className={`browser-tab ${tab.id === activeId ? 'is-active' : ''}`} role="tab" aria-selected={tab.id === activeId} onClick={() => onActivate(tab.id)}>
      <span className="tab-favicon">{tab.favicon ? <img src={tab.favicon} alt="" /> : <Globe size={14} />}</span><span className="tab-label">{tab.isLoading ? 'Carregando…' : tab.title || 'Nova aba'}</span><span className="tab-close" role="button" aria-label={`Fechar ${tab.title || 'aba'}`} onClick={(event) => { event.stopPropagation(); onClose(tab.id) }}><X size={14} /></span>
    </button>)}</div>
    <button className="chrome-button tab-add" onClick={onNewTab} aria-label="Nova aba"><span>+</span></button>
  </div>
}
