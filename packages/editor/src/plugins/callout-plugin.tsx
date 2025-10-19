import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import {
  $createParagraphNode,
  $createTextNode,
  $getNearestNodeFromDOMNode,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type LexicalCommand,
} from 'lexical'
import { useEffect, useState } from 'react'
import {
  $createCalloutContainerNode,
  $isCalloutContainerNode,
  type CalloutVariant,
} from './../nodes/callout/callout'

import { EditCalloutDialog } from '../components/callout-dialog'

type CalloutProps = {
  variant: CalloutVariant
  icon?: string
}

export const INSERT_CALLOUT_COMMAND: LexicalCommand<CalloutProps> = createCommand('INSERT_CALLOUT')

export function CalloutPlugin() {
  const [editor] = useLexicalComposerContext()
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    // biome-ignore lint/suspicious/noExplicitAny: To be fixed later
    calloutNode: any
    variant: CalloutVariant
    icon: string
  }>({
    isOpen: false,
    calloutNode: null,
    variant: 'info',
    icon: '💡',
  })

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        INSERT_CALLOUT_COMMAND,
        (payload = { variant: 'info' as CalloutVariant }) => {
          editor.update(() => {
            const selection = $getSelection()

            if ($isRangeSelection(selection)) {
              const container = $createCalloutContainerNode(payload.variant, payload.icon || '💡')
              const paragraph = $createParagraphNode().append($createTextNode(''))

              container.append(paragraph)
              $insertNodes([container])

              paragraph.selectEnd()
            }
          })
          return true
        },
        COMMAND_PRIORITY_EDITOR
      ),

      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          const target = event.target as HTMLElement
          if (target?.hasAttribute('data-icon') && target.closest('[data-callout="true"]')) {
            event.preventDefault()
            event.stopPropagation()

            const calloutContainer = target.closest('[data-callout="true"]') as HTMLElement
            if (!calloutContainer) return false
            editor.update(() => {
              const lexicalNode = $getNearestNodeFromDOMNode(calloutContainer)
              if (lexicalNode && $isCalloutContainerNode(lexicalNode)) {
                setDialogState({
                  isOpen: true,
                  calloutNode: lexicalNode,
                  variant: lexicalNode.getVariant(),
                  icon: lexicalNode.getIcon(),
                })
              }
            })
            return true
          }

          return false
        },
        COMMAND_PRIORITY_EDITOR
      )
    )
  }, [editor])

  const handleSaveCallout = (variant: CalloutVariant, icon: string) => {
    if (dialogState.calloutNode) {
      editor.update(() => {
        const calloutNode = dialogState.calloutNode
        if ($isCalloutContainerNode(calloutNode)) {
          calloutNode.setVariant(variant)
          calloutNode.setIcon(icon)
        }
      })
    }
  }

  const handleCloseDialog = () => {
    setDialogState((prev) => ({
      ...prev,
      isOpen: false,
      calloutNode: null,
    }))
  }

  return (
    <EditCalloutDialog
      isOpen={dialogState.isOpen}
      onClose={handleCloseDialog}
      currentVariant={dialogState.variant}
      currentIcon={dialogState.icon}
      onSave={handleSaveCallout}
    />
  )
}
