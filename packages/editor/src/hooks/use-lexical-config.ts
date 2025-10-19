import { create } from 'zustand'

type FontFamily = 'system' | 'geist' | 'monkey'

type AppConfig = {
  canUseRichText: boolean
  setCanUseRichText: (value: boolean) => void
  enableAutoSave: boolean
  setEnableAutoSave: (value: boolean) => void
  fontFamily: FontFamily
  setFontFamily: (value: FontFamily) => void
}

export const useAppConfig = create<AppConfig>((set) => ({
  canUseRichText: true,
  enableAutoSave: true,
  fontFamily: 'geist',

  setCanUseRichText: (value) => set({ canUseRichText: value }),
  setEnableAutoSave: (value) => set({ enableAutoSave: value }),
  setFontFamily: (value) => set({ fontFamily: value }),
}))
