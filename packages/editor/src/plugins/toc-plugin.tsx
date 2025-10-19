// /editor/nodes/toc/toc-plugin.tsx

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
import { $createTocNode, TocNode } from '../nodes/toc/toc-decorator.tsx'

export const INSERT_TOC_COMMAND: LexicalCommand<void> = createCommand('INSERT_TOC_COMMAND')

export function TocPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([TocNode])) {
      throw new Error('TocPlugin: TocNode not registered on editor')
    }

    return mergeRegister(
      editor.registerCommand<void>(
        INSERT_TOC_COMMAND,
        () => {
          const tocNode = $createTocNode()
          $insertNodes([tocNode])
          if ($isRootOrShadowRoot(tocNode.getParentOrThrow())) {
            $wrapNodeInElement(tocNode, $createParagraphNode).selectEnd()
          }
          return true
        },
        COMMAND_PRIORITY_EDITOR
      )
    )
  }, [editor])

  return null
}
