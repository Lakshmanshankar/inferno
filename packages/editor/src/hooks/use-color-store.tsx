import { create } from 'zustand'

export interface ColorItem {
  name: string
  type: 'text' | 'bg'
  color: string
  id: string
}

export interface ColorStore {
  colors: ColorItem[]
  darkColors: ColorItem[]
  init: () => void
  updateColor: (name: string, type: 'text' | 'bg', color: string) => void
  updateDarkColor: (name: string, type: 'text' | 'bg', color: string) => void
  getColor: (id: string, type: 'text' | 'bg', isDark?: boolean) => string | null
}

const defaultColors: ColorItem[] = [
  // Site colors - improved contrast and vibrancy
  { id: 'cl-primary', name: 'primary', type: 'text', color: '#2563eb' },
  { id: 'cl-primary', name: 'primary', type: 'bg', color: '#dbeafe' },
  { id: 'cl-secondary', name: 'secondary', type: 'text', color: '#475569' },
  { id: 'cl-secondary', name: 'secondary', type: 'bg', color: '#e2e8f0' },
  { id: 'cl-brand', name: 'brand', type: 'text', color: '#7c3aed' },
  { id: 'cl-brand', name: 'brand', type: 'bg', color: '#e7d3ff' },

  // Vibrant color palette with better contrast
  { id: 'cl-extra-1', name: 'color1', type: 'text', color: '#dc2626' },
  { id: 'cl-extra-1', name: 'color1', type: 'bg', color: '#fee2e2' },
  { id: 'cl-extra-2', name: 'color2', type: 'text', color: '#ea580c' },
  { id: 'cl-extra-2', name: 'color2', type: 'bg', color: '#fed7aa' },
  { id: 'cl-extra-3', name: 'color3', type: 'text', color: '#d97706' },
  { id: 'cl-extra-3', name: 'color3', type: 'bg', color: '#fef3c7' },
  { id: 'cl-extra-4', name: 'color4', type: 'text', color: '#ca8a04' },
  { id: 'cl-extra-4', name: 'color4', type: 'bg', color: '#fef9c3' },
  { id: 'cl-extra-5', name: 'color5', type: 'text', color: '#65a30d' },
  { id: 'cl-extra-5', name: 'color5', type: 'bg', color: '#ecfccb' },
  { id: 'cl-extra-6', name: 'color6', type: 'text', color: '#16a34a' },
  { id: 'cl-extra-6', name: 'color6', type: 'bg', color: '#dcfce7' },
  { id: 'cl-extra-7', name: 'color7', type: 'text', color: '#059669' },
  { id: 'cl-extra-7', name: 'color7', type: 'bg', color: '#d1fae5' },
]

// Dark mode colors - improved contrast and fixed opacity issues
const defaultDarkColors: ColorItem[] = [
  // Site colors - better dark mode contrast
  { id: 'cl-primary', name: 'primary', type: 'text', color: '#3b82f6' },
  { id: 'cl-primary', name: 'primary', type: 'bg', color: '#1e40af' },
  { id: 'cl-secondary', name: 'secondary', type: 'text', color: '#cbd5e1' },
  { id: 'cl-secondary', name: 'secondary', type: 'bg', color: '#475569' },
  { id: 'cl-brand', name: 'brand', type: 'text', color: '#a855f7' },
  { id: 'cl-brand', name: 'brand', type: 'bg', color: '#6b21a8' },

  // Dark mode colors with proper opacity and contrast
  { id: 'cl-extra-1', name: 'color1', type: 'text', color: '#f87171' },
  { id: 'cl-extra-1', name: 'color1', type: 'bg', color: '#7f1d1d' },
  { id: 'cl-extra-2', name: 'color2', type: 'text', color: '#fb923c' },
  { id: 'cl-extra-2', name: 'color2', type: 'bg', color: '#9a3412' },
  { id: 'cl-extra-3', name: 'color3', type: 'text', color: '#fbbf24' },
  { id: 'cl-extra-3', name: 'color3', type: 'bg', color: '#92400e' },
  { id: 'cl-extra-4', name: 'color4', type: 'text', color: '#facc15' },
  { id: 'cl-extra-4', name: 'color4', type: 'bg', color: '#854d0e' },
  { id: 'cl-extra-5', name: 'color5', type: 'text', color: '#a3e635' },
  { id: 'cl-extra-5', name: 'color5', type: 'bg', color: '#1a2e05' },
  { id: 'cl-extra-6', name: 'color6', type: 'text', color: '#4ade80' },
  { id: 'cl-extra-6', name: 'color6', type: 'bg', color: '#14532d' },
  { id: 'cl-extra-7', name: 'color7', type: 'text', color: '#34d399' },
  { id: 'cl-extra-7', name: 'color7', type: 'bg', color: '#064e3b' },
]
let styleElement: HTMLStyleElement | null = null

const injectCSS = (colors: ColorItem[], darkColors: ColorItem[]): void => {
  if (!styleElement) {
    styleElement = document.createElement('style')
    styleElement.setAttribute('data-color-styles', '')
    document.head.appendChild(styleElement)
  }

  let css = ''
  // Light mode styles
  colors.forEach(({ id, type, color }) => {
    if (type === 'text') {
      css += `
            .editor-block .text-${id},
            .editor-block .text-${id} > *,
            .editor-block .text-link .text-${id},
            .text-${id},
            .text-${id} > *,
            .text-link .text-${id} {
              color: ${color};
            }
        `
    } else if (type === 'bg') {
      css += `
              .bg-${id},
              .editor-block .bg-${id} {
                 background-color: ${color};
              }
        `
    }
  })

  // Dark mode styles
  css += `
  .dark {`
  darkColors.forEach(({ id, type, color }) => {
    if (type === 'text') {
      css += `
              .editor-block .text-${id},
              .editor-block .text-${id} > *,
              .editor-block .text-link .text-${id},
              .text-${id},
              .text-${id} > *,
              .text-link .text-${id} {
                  color: ${color};
              }
          `
    } else if (type === 'bg') {
      css += `
          .editor-block .bg-${id},
          .bg-${id} {
              background-color: ${color};
          }
        `
    }
  })
  css += `
  }
  `
  styleElement.textContent = css
}

export const useColorStore = create<ColorStore>((set, get) => ({
  colors: defaultColors,
  darkColors: defaultDarkColors,

  init: () => {
    const { colors, darkColors } = get()
    injectCSS(colors, darkColors)
  },

  updateColor: (id: string, type: 'text' | 'bg', color: string) => {
    const state = get()
    const newColors = state.colors.map((item) =>
      item.id === id && item.type === type ? { ...item, color } : item
    )

    set({ colors: newColors })
    injectCSS(newColors, state.darkColors)
  },

  updateDarkColor: (name: string, type: 'text' | 'bg', color: string) => {
    const state = get()
    const newDarkColors = state.darkColors.map((item) =>
      item.name === name && item.type === type ? { ...item, color } : item
    )

    set({ darkColors: newDarkColors })
    injectCSS(state.colors, newDarkColors)
  },

  getColor: (id: string, type: 'text' | 'bg', isDark: boolean = false) => {
    const { colors, darkColors } = get()
    const colorArray = isDark ? darkColors : colors
    const found = colorArray.find((item) => item.id === id && item.type === type)
    return found ? found.color : null
  },
}))

// Auto-initialize
useColorStore.getState().init()
