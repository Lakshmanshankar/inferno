import { $createLinkNode, $isLinkNode } from '@lexical/link'
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  type ElementNode,
  type LexicalNode,
  type TextNode,
} from 'lexical'

import { $createColoredTextNode, $isColoredTextNode } from './nodes/colored-text-node'

type Node = LexicalNode

type NodeGroups = {
  beforeNodes: Node[]
  selectedNodes: Node[]
  afterNodes: Node[]
}

/**
 * Helper function to add a node to the target array with optional decoration.
 * Simplifies the repeated pattern of conditionally decorating selected nodes.
 */
function addToSelectedNodes(
  node: Node,
  parent: Node | null,
  targetArray: Node[],
  includeDecorations: boolean
): void {
  if (includeDecorations) {
    decorateText(node, parent, targetArray)
  } else {
    targetArray.push(node)
  }
}

/**
 * Splits text nodes into three groups based on the current selection range.
 *
 * Uses a parent-first approach to maintain Lexical's tree structure integrity:
 * - beforeNodes: Content before the selection start
 * - selectedNodes: Content within the selection range
 * - afterNodes: Content after the selection end
 *
 * The function handles three main scenarios:
 * 1. Single node selection (start and end in same node)
 * 2. Same parent selection (start and end nodes share a parent)
 * 3. Cross-parent selection (start and end nodes have different parents)
 *
 * This approach avoids complex tree traversal and works within Lexical's
 * constraint that selection boundaries typically exist at the same container level.
 * ### Returns
 * -  beforeNodes: Content before the selection start include all decorations
 * -  selectedNodes: Content within the selection range without parent decorations
 * - afterNodes: Content after the selection end include all decorations
 * @returns NodeGroups containing the categorized text nodes
 */
export const splitNodesOnRange = ({ includeSelectedDecorations = false } = {}) => {
  const selection = $getSelection()
  const beforeNodes: Node[] = []
  const selectedNodes: Node[] = []
  const afterNodes: Node[] = []

  const nodeGroups: NodeGroups = {
    beforeNodes,
    selectedNodes,
    afterNodes,
  }

  // Early return if no valid range selection exists
  if (!$isRangeSelection(selection)) {
    return nodeGroups
  }

  // Determine selection direction and establish start/end points
  const anchorNode = selection.anchor.getNode()
  const focusNode = selection.focus.getNode()
  const isBefore = selection.anchor.isBefore(selection.focus)

  const startNode = isBefore ? anchorNode : focusNode
  const endNode = isBefore ? focusNode : anchorNode
  const startParent = startNode.getParent()
  const endParent = endNode.getParent()
  const startOffset = isBefore ? selection.anchor.offset : selection.focus.offset
  const endOffset = isBefore ? selection.focus.offset : selection.anchor.offset

  if (startParent === endParent) {
    handleSameParentSelection(startNode, endNode, startParent, startOffset, endOffset, nodeGroups, {
      includeSelectedDecorations,
    })
  } else {
    handleCrossParentSelection(
      startNode,
      endNode,
      startParent,
      endParent,
      startOffset,
      endOffset,
      nodeGroups,
      {
        includeSelectedDecorations,
      }
    )
  }
  return nodeGroups
}

/**
 * Handles selection within the same parent node.
 * Covers both single node selection and multi-node selection within one container.
 */
function handleSameParentSelection(
  startNode: Node,
  endNode: Node,
  parent: Node | null,
  startOffset: number,
  endOffset: number,
  nodeGroups: NodeGroups,
  { includeSelectedDecorations = false }: { includeSelectedDecorations?: boolean }
): void {
  const { beforeNodes, selectedNodes, afterNodes } = nodeGroups

  if (startNode.getKey() === endNode.getKey()) {
    // Single node selection - split the node into before/selected/after parts
    collectSiblings(startNode, beforeNodes, 'before', parent)

    const splitResult = splitTextNode(startNode, startOffset, endOffset)
    if (splitResult.before) decorateText(splitResult.before, parent, beforeNodes)
    if (splitResult.select) {
      addToSelectedNodes(splitResult.select, parent, selectedNodes, includeSelectedDecorations)
    }
    if (splitResult.after) decorateText(splitResult.after, parent, afterNodes)

    collectSiblings(endNode, afterNodes, 'after', parent)
  } else {
    // Multi-node selection within same parent
    collectSiblings(startNode, beforeNodes, 'before', parent)

    // Split start node (keep from startOffset to end)
    const startSplit = splitTextNode(startNode, startOffset)
    if (startSplit.before) decorateText(startSplit.before, parent, beforeNodes)
    if (startSplit.select) {
      addToSelectedNodes(startSplit.select, parent, selectedNodes, includeSelectedDecorations)
    }

    // Collect all nodes between start and end
    let currentNode = startNode.getNextSibling()
    while (currentNode && currentNode.getKey() !== endNode.getKey()) {
      if ($isTextNode(currentNode)) {
        addToSelectedNodes(
          currentNode as TextNode,
          parent,
          selectedNodes,
          includeSelectedDecorations
        )
      } else {
        decorateText(currentNode, currentNode.getParent(), selectedNodes)
      }
      currentNode = currentNode.getNextSibling()
    }

    // Split end node (keep from start to endOffset)
    const endSplit = splitTextNode(endNode, 0, endOffset)
    if (endSplit.select) {
      addToSelectedNodes(endSplit.select, parent, selectedNodes, includeSelectedDecorations)
    }
    if (endSplit.after) decorateText(endSplit.after, parent, afterNodes)

    collectSiblings(endNode, afterNodes, 'after', parent)
  }
}

/**
 * Handles selection that spans across different parent nodes.
 * Uses parent-first traversal to collect nodes between start and end boundaries.
 */
function handleCrossParentSelection(
  startNode: Node,
  endNode: Node,
  startParent: Node | null,
  endParent: Node | null,
  startOffset: number,
  endOffset: number,
  nodeGroups: NodeGroups,
  { includeSelectedDecorations = false }: { includeSelectedDecorations?: boolean }
): void {
  const { beforeNodes, selectedNodes, afterNodes } = nodeGroups
  // 1. Collect all nodes before the start node within its parent
  collectSiblings(startNode, beforeNodes, 'before', startParent)

  // 2. Split the start node and keep the selected portion
  const startSplit = splitTextNode(startNode, startOffset)
  if (startSplit.before) decorateText(startSplit.before, startParent, beforeNodes)
  if (startSplit.select) {
    addToSelectedNodes(startSplit.select, startParent, selectedNodes, includeSelectedDecorations)
  }

  // 3. Traverse from start node to end node, collecting intermediate content
  let currentNode: TextNode | ElementNode | null = startNode.getNextSibling()
  let shouldTraverseParent = false

  // If start node has no next sibling, we need to traverse up to parent level
  if (!currentNode) {
    shouldTraverseParent = true
    currentNode = startNode.getParent()?.getNextSibling() || null
  }

  // Collect all nodes between start and end boundaries
  while (currentNode) {
    // Stop when we reach the end node or its parent
    if (
      currentNode.getKey() === endNode.getParent()?.getKey() ||
      currentNode.getKey() === endNode.getKey()
    ) {
      break
    }

    if (shouldTraverseParent && $isLinkNode(currentNode)) {
      // biome-ignore lint/complexity/noForEach: <explanation>
      currentNode.getChildren().forEach((child) => {
        addToSelectedNodes(child, currentNode, selectedNodes, includeSelectedDecorations)
      })
    } else {
      selectedNodes.push(currentNode)
    }

    currentNode = currentNode.getNextSibling()
  }

  // 4. Split the end node and keep the selected portion
  const endSplit = splitTextNode(endNode, 0, endOffset)
  if (endSplit.select) {
    addToSelectedNodes(endSplit.select, endParent, selectedNodes, includeSelectedDecorations)
  }
  if (endSplit.after) decorateText(endSplit.after, endParent, afterNodes)

  // 5. Collect all nodes after the end node within its parent
  collectSiblings(endNode, afterNodes, 'after', endParent)
}

type SplitNodeResult = {
  before?: Node
  select?: Node
  after?: Node
}
type KeyOfSplitNodeResult = keyof SplitNodeResult

/**
 * Splits a text node into up to three parts based on selection offsets.
 *
 * @param node - The text node to split
 * @param startOffset - Start position for selection (defaults to 0)
 * @param endOffset - End position for  = 0, selection (defaults to node length)
 * @returns Object containing the split parts: before, select, after
 */

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const  splitTextNode = (node: any, startOffset = 0, endOffset?: number): SplitNodeResult => {
  const nodeText = node.getTextContent()
  const actualEndOffset = endOffset ?? nodeText.length
  const result: SplitNodeResult = {}

  // Create before portion if selection doesn't start at beginning
  if (startOffset > 0) {
    const beforeText = nodeText.slice(0, startOffset)
    result.before = $createTextNode(beforeText).setFormat(node.getFormat())
  }

  // Create selected portion
  const selectedText = nodeText.slice(startOffset, actualEndOffset)
  if (selectedText) {
    result.select = $createTextNode(selectedText).setFormat(node.getFormat())
  }

  // Create after portion if selection doesn't end at node boundary
  if (actualEndOffset < nodeText.length) {
    const afterText = nodeText.slice(actualEndOffset)
    result.after = $createTextNode(afterText).setFormat(node.getFormat())
  }

  // Handle colored text nodes by preserving color information
  for (const key of Object.keys(result) as KeyOfSplitNodeResult[]) {
    if ($isColoredTextNode(node)) {
      const txtNode = result[key] as TextNode
      const newNode = $createColoredTextNode(
        txtNode.getTextContent(),
        node.__highlightColor,
        node.__colorType
      ).setFormat(node.getFormat())
      result[key] = newNode
    }
  }

  return result
}

/**
 * Wraps a text node with appropriate decoration (link, color) based on its parent context.
 * Preserves the original node's formatting and adds it to the target array.
 *
 * @param node - The node to decorate
 * @param parentNode - The parent context for decoration decisions
 * @param targetArray - Array to add the decorated node to
 */
function decorateText(node: Node, parentNode: Node | null, targetArray: Node[]): void {
  let decoratedNode = node

  // Preserve colored text node properties
  if ($isColoredTextNode(node)) {
    decoratedNode = $createColoredTextNode(
      node.getTextContent(),
      node.__highlightColor,
      node.__colorType
    ).setFormat(node.getFormat())
  }

  // Wrap in link node if parent is a link
  if (parentNode && $isLinkNode(parentNode)) {
    const newLinkNode = $createLinkNode(parentNode.__url, {
      target: parentNode.__target,
      rel: parentNode.__rel,
      title: parentNode.__title,
    })
    newLinkNode.append(decoratedNode)
    targetArray.push(newLinkNode)
  } else {
    targetArray.push(decoratedNode)
  }
}

/**
 * Collects sibling nodes in the specified direction from a starting node.
 * Handles special cases where the parent is a link node by also collecting
 * the parent's siblings to maintain proper text flow.
 *
 * @param fromNode - Starting node for sibling collection
 * @param targetArray - Array to collect siblings into
 * @param direction - Direction to traverse ("before" or "after")
 * @param nodeParent - Parent context for special handling
 * @param options - Additional options for collection behavior
 */
const collectSiblings = (
  fromNode: Node,
  targetArray: Node[],
  direction: 'before' | 'after',
  nodeParent: Node | null,
  options = { eatParentAlone: false }
): void => {
  // Handle link parent's siblings first (for proper text flow)
  if (direction === 'before' && nodeParent && $isLinkNode(nodeParent)) {
    // biome-ignore lint/complexity/noForEach: <explanation>
    nodeParent.getPreviousSiblings().forEach((node) => {
      targetArray.push(node as TextNode | ElementNode)
    })
    if (options.eatParentAlone) return
  }

  // Collect direct siblings of the node
  if (!options.eatParentAlone) {
    if (direction === 'before') {
      // biome-ignore lint/complexity/noForEach: <explanation>
      fromNode.getPreviousSiblings().forEach((node) => {
        decorateText(node as Node, nodeParent, targetArray)
      })
    } else {
      // biome-ignore lint/complexity/noForEach: <explanation>
      fromNode.getNextSiblings().forEach((node) => {
        decorateText(node as Node, nodeParent, targetArray)
      })
    }
  }

  // Handle link parent's siblings after (for proper text flow)
  if (direction === 'after' && nodeParent && $isLinkNode(nodeParent)) {
    // biome-ignore lint/complexity/noForEach: <explanation>
    nodeParent.getNextSiblings().forEach((node) => {
      targetArray.push(node as TextNode | ElementNode)
    })
  }
}
