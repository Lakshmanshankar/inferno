import { create } from 'zustand'
import type { TabName } from './registry'

type SettingsStore = {
  open: boolean
  activeTab: TabName
  openTab: (tab: TabName) => void
  setTab: (tab: TabName) => void
  close: () => void
  syncFromParams: (searchParams: URLSearchParams) => void
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  open: false,
  activeTab: 'Appearance', // default

  openTab: (tab) => {
    const newParams = new URLSearchParams(window.location.search)
    newParams.set('settingsTab', tab)
    window.history.replaceState(null, '', `?${newParams.toString()}`)
    set({ open: true, activeTab: tab })
  },

  setTab: (tab) => {
    const newParams = new URLSearchParams(window.location.search)
    newParams.set('settingsTab', tab)
    window.history.replaceState(null, '', `?${newParams.toString()}`)
    set({ activeTab: tab })
  },

  close: () => {
    const newParams = new URLSearchParams(window.location.search)
    newParams.delete('settingsTab')
    window.history.replaceState(null, '', `?${newParams.toString()}`)
    set({ open: false })
  },

  syncFromParams: (searchParams) => {
    const tab = searchParams.get('settingsTab')
    if (tab) {
      set({ open: true, activeTab: tab as TabName })
    }
  },
}))
