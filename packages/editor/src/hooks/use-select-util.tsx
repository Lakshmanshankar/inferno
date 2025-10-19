import { $isLinkNode } from '@lexical/link'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $findMatchingParent } from '@lexical/utils'
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  SELECTION_CHANGE_COMMAND,
} from 'lexical'
import { useEffect, useState } from 'react'

/**
 * @returns `hasSameParentBlocknode` is true if both anchor and focus have a same element node parent,
 *          `isLinkNode` is true if the current anchor is part of link parent.
 */
export function useSelectNodeUtil() {
  const [editor] = useLexicalComposerContext()
  const [hasSameParentBlockNode, sethasMatchedparentBlocknode] = useState(true)
  const [isLinkNode, setIsLinkNode] = useState(false)

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
          const anchorNode = selection.anchor.getNode()
          const focusNode = selection.focus.getNode()

          // console.log(anchorNode, focusNode);
          // Existing block node detection logic
          const parentBlockNode = $findMatchingParent(
            anchorNode,
            (node) => $isElementNode(node) && !node.isInline()
          )

          const parentBlockNode2 = $findMatchingParent(
            focusNode,
            (node) => $isElementNode(node) && !node.isInline()
          )

          if (parentBlockNode && parentBlockNode2) {
            const isSame = parentBlockNode.getKey() === parentBlockNode2.getKey()
            sethasMatchedparentBlocknode(isSame)
          } else {
            sethasMatchedparentBlocknode(false)
          }

          const node = selection.anchor.getNode()
          const parentNode = node.getParent()
          setIsLinkNode($isLinkNode(parentNode))
          return false
        }

        sethasMatchedparentBlocknode(false)
        setIsLinkNode(false)
        return false
      },
      COMMAND_PRIORITY_LOW
    )
  }, [editor])

  return { hasSameParentBlockNode, isLinkNode }
}
