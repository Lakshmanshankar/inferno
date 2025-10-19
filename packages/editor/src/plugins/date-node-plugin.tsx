import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $wrapNodeInElement, mergeRegister } from '@lexical/utils'
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type LexicalCommand,
} from 'lexical'
import { useEffect } from 'react'
import { $createDateNode, DateNode, type DatePayload } from './../nodes/date/date-node'

export type InsertDatePayload = Readonly<DatePayload>

export const INSERT_DATE_COMMAND: LexicalCommand<InsertDatePayload> =
  createCommand('INSERT_DATE_COMMAND')

export function DatesPlugin() {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    if (!editor.hasNodes([DateNode])) {
      throw new Error('DatesPlugin: DateNode not registered on editor')
    }

    mergeRegister(
      editor.registerCommand<InsertDatePayload>(
        INSERT_DATE_COMMAND,
        (payload) => {
          const dateNode = $createDateNode(payload)
          $insertNodes([dateNode])
          if ($isRootOrShadowRoot(dateNode.getParentOrThrow())) {
            $wrapNodeInElement(dateNode, $createParagraphNode).selectEnd()
          }
          return true
        },
        COMMAND_PRIORITY_EDITOR
      )
    )
  }, [editor])

  return null
}
