// import { SHOW_DATE_PICKER_POPOVER } from '@/editor/plugins/mention-menu-plugin';

import type { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createTextNode, $getSelection, $isRangeSelection } from 'lexical'
import { Calendar } from 'lucide-react'
import type React from 'react'
import { INSERT_DATE_COMMAND } from './../date-node-plugin.tsx'

export type MentionMenuItem = {
  value: string
  label: string
  shortcut: string
  id: string
  icon: React.ComponentType<{ className?: string }>
  command: (editor: ReturnType<typeof useLexicalComposerContext>[0]) => void
  group: string
}

type MentionType = 'hr' | 'quote' | 'heading' | 'image' | 'date' | 'link'

export const createMention = (
  editor: ReturnType<typeof useLexicalComposerContext>[0],
  type: MentionType
) => {
  editor.update(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      switch (type) {
        case 'date': {
          // inline mention placeholder
          selection.insertNodes([$createTextNode('@date ')])
          // here you can open a date picker modal instead
          return
        }
        default:
          break
      }
    }
  })
}

export const mentionItems: MentionMenuItem[] = [
  {
    value: 'date',
    label: 'Date',
    shortcut: '',
    icon: Calendar,
    id: 'mention-item-date',
    group: 'Basic',
    command: (editor) => {
      editor.dispatchCommand(INSERT_DATE_COMMAND, { date: new Date().toISOString() })
    },
  },
]
