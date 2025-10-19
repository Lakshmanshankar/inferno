import { create } from 'zustand'

type MentionMenuStore = {
  showDateDialog: boolean
  showLinkDialog: boolean
  setShowDateDialog: (value: boolean) => void
  setShowLinkDialog: (value: boolean) => void
}

export const useMentionMenuSettings = create<MentionMenuStore>((set) => ({
  showDateDialog: false,
  showLinkDialog: false,
  setShowDateDialog: (value) => set({ showDateDialog: value }),
  setShowLinkDialog: (value) => set({ showLinkDialog: value }),
}))
