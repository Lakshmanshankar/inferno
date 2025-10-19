import { type LucideIcon, Palette, Settings2Icon, SwatchBook } from 'lucide-react'

export type SettingConfig<Name extends string> = {
  name: Name
  icon: LucideIcon
  loader: () => Promise<{ default: React.ComponentType<unknown> }>
}

export const SETTINGS_REGISTRY = [
  {
    name: 'Appearance',
    icon: Palette,
    loader: () => import('../features/appearance'),
  },
  {
    name: 'Editor',
    icon: SwatchBook,
    loader: () => import('../features/color-settings'),
  },
  {
    name: 'Settings',
    icon: Settings2Icon,
    loader: () => import('../features/appearance'),
  },
] as const satisfies readonly SettingConfig<string>[]

export type TabName = (typeof SETTINGS_REGISTRY)[number]['name']
