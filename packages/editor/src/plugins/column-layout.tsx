import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $findMatchingParent, mergeRegister } from '@lexical/utils'
import type { LexicalCommand, LexicalNode, NodeKey } from 'lexical'
import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $insertNodes,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  createCommand,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_LEFT_COMMAND,
  KEY_ARROW_RIGHT_COMMAND,
  KEY_ARROW_UP_COMMAND,
} from 'lexical'
import { useEffect } from 'react'
import {
  $createLayoutContainerNode,
  $isLayoutContainerNode,
  LayoutContainerNode,
} from './../nodes/column-layout/layout-container'
import {
  $createLayoutItemNode,
  $isLayoutItemNode,
  LayoutItemNode,
} from './../nodes/column-layout/layout-item'

export const INSERT_LAYOUT_COMMAND: LexicalCommand<string> =
  createCommand<string>('INSERT_LAYOUT_COMMAND')

export const UPDATE_LAYOUT_COMMAND: LexicalCommand<{
  template: string
  nodeKey: NodeKey
}> = createCommand()

export function LayoutPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([LayoutContainerNode, LayoutItemNode])) {
      throw new Error('LayoutPlugin: Layout nodes not registered')
    }

    const $insertEscapeParagraph = (before: boolean) => {
      const selection = $getSelection()
      if (
        $isRangeSelection(selection) &&
        selection.isCollapsed() &&
        selection.anchor.offset === 0
      ) {
        const container = $findMatchingParent(selection.anchor.getNode(), $isLayoutContainerNode)

        if ($isLayoutContainerNode(container)) {
          // const parent = container.getParent<ElementNode>();
          const sibling = before ? container.getPreviousSibling() : container.getNextSibling()

          if (!sibling) {
            const paragraph = $createParagraphNode()
            if (before) {
              container.insertBefore(paragraph)
            } else {
              container.insertAfter(paragraph)
            }
            paragraph.selectStart()
            return true
          }
        }
      }
      return false
    }

    const $fillEmptyLayoutItem = (node: LayoutItemNode) => {
      if (node.isEmpty()) {
        node.append($createParagraphNode())
      }
    }

    const $unwrapIsolatedLayoutItem = (node: LayoutItemNode): boolean => {
      const parent = node.getParent()
      if (!$isLayoutContainerNode(parent)) {
        const children = node.getChildren()
        for (const child of children) {
          node.insertBefore(child)
        }
        node.remove()
        return true
      }
      return false
    }

    return mergeRegister(
      editor.registerCommand(
        KEY_ARROW_UP_COMMAND,
        () => $insertEscapeParagraph(true),
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ARROW_LEFT_COMMAND,
        () => $insertEscapeParagraph(true),
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ARROW_DOWN_COMMAND,
        () => $insertEscapeParagraph(false),
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_ARROW_RIGHT_COMMAND,
        () => $insertEscapeParagraph(false),
        COMMAND_PRIORITY_LOW
      ),

      editor.registerCommand(
        INSERT_LAYOUT_COMMAND,
        (template) => {
          editor.update(() => {
            const selection = $getSelection()
            if (!$isRangeSelection(selection)) return

            const container = $createLayoutContainerNode(template)
            const itemsCount = getItemsCountFromTemplate(template)

            for (let i = 0; i < itemsCount; i++) {
              container.append($createLayoutItemNode().append($createParagraphNode()))
            }

            $insertNodes([container])

            const firstItem = container.getFirstChild()
            if ($isLayoutItemNode(firstItem)) {
              const firstChild = firstItem.getFirstChild()
              if (firstChild != null) {
                firstChild.selectStart()
              }
            }
          })

          return true
        },
        COMMAND_PRIORITY_EDITOR
      ),

      editor.registerCommand(
        UPDATE_LAYOUT_COMMAND,
        ({ template, nodeKey }) => {
          editor.update(() => {
            const container = $getNodeByKey<LexicalNode>(nodeKey)
            if (!$isLayoutContainerNode(container)) return

            const newCount = getItemsCountFromTemplate(template)
            const oldCount = getItemsCountFromTemplate(container.getTemplateColumns())

            if (newCount > oldCount) {
              for (let i = oldCount; i < newCount; i++) {
                container.append($createLayoutItemNode().append($createParagraphNode()))
              }
            } else if (newCount < oldCount) {
              for (let i = oldCount - 1; i >= newCount; i--) {
                const child = container.getChildAtIndex(i)
                if ($isLayoutItemNode(child)) {
                  child.remove()
                }
              }
            }

            container.setTemplateColumns(template)
          })

          return true
        },
        COMMAND_PRIORITY_EDITOR
      ),

      editor.registerNodeTransform(LayoutItemNode, (node) => {
        if (!$unwrapIsolatedLayoutItem(node)) {
          $fillEmptyLayoutItem(node)
        }
      }),

      editor.registerNodeTransform(LayoutContainerNode, (node) => {
        const children = node.getChildren()
        if (!children.every($isLayoutItemNode)) {
          for (const child of children) {
            node.insertBefore(child)
          }
          node.remove()
        }
      })
    )
  }, [editor])

  return null
}

function getItemsCountFromTemplate(template: string): number {
  return template.trim().split(/\s+/).length
}
