import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $createParagraphNode, $isParagraphNode, RootNode } from 'lexical'
import { useEffect } from 'react'

/**
 * Node transform function that ensures exactly one paragraph node at the end
 */
function ensureLastParagraphTransform(node: RootNode) {
  if (!node) {
    return
  }

  const children = node.getChildren()

  if (children.length === 0) {
    const paragraph = $createParagraphNode()
    node.append(paragraph)
    return
  }

  const lastChild = children[children.length - 1]

  // If the last child is not a paragraph, add one
  if (!$isParagraphNode(lastChild)) {
    const paragraph = $createParagraphNode()
    node.append(paragraph)
  }
}

export function EnsureLastParagraphPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerNodeTransform(RootNode, ensureLastParagraphTransform)
  }, [editor])

  return null
}

export default EnsureLastParagraphPlugin
