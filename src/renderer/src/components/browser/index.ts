import { useEffect, useMemo, useRef, useState } from 'react'
import type { BrowserTab } from '../../../shared/types'
import { TabBar } from './TabBar'
import { NavigationBar } from './NavigationBar'
import { BrowserMenu } from './BrowserMenu'
import { NewTabPage } from './NewTabPage'
import './browser-window.css'

export type BrowserWindowModel = { tabs: BrowserTab[]; activeId: string; address: string; menuOpen: boolean; panel: 'none' | 'history' | 'bookmarks' | 'settings' }
export function useBrowserWindowModel(): BrowserWindowModel {
  const [tabs, setTabs] = useState<BrowserTab[]>([]); const [activeId, setActiveId] = useState(''); const [address, setAddress] = useState(''); const [menuOpen, setMenuOpen] = useState(false); const [panel, setPanel] = useState<BrowserWindowModel['panel']>('none'); const addressRef = useRef<HTMLInputElement>(null)
  const active = useMemo(() => tabs.find((tab) => tab.id === activeId), [tabs, activeId])
  useEffect(() => { void window.grehem.tabs.list().then(setTabs); const offUpdate = window.grehem.onTabUpdate((tab) => setTabs((items) => items.some((item) => item.id === tab.id) ? items.map((item) => item.id === tab.id ? tab : item) : [...items, tab])); const offActive = window.grehem.onActiveTab(setActiveId); return () => { offUpdate(); offActive() } }, [])
  useEffect(() => { setAddress(active?.kind === 'newtab' ? '' : active?.url ?? '') }, [active?.id, active?.url, active?.kind])
  return { tabs, activeId, address, menuOpen, panel }
}
