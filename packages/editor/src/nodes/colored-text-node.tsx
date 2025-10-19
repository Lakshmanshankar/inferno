import {
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedTextNode,
  type Spread,
  TextNode,
} from 'lexical'

const DEFAULT_HIGHLIGHT_COLOR_ID = 'bg-daffodil'

export type SerializedColoredTextNode = Spread<
  {
    highlightColor: string
    colorType: 'text' | 'bg'
  },
  SerializedTextNode
>

/**
 * ColoredTextNode is a custom TextNode that renders with a background color.
 * It stores a color ID from the application's color theme.
 */
export class ColoredTextNode extends TextNode {
  __highlightColor: string
  __colorType: 'text' | 'bg'

  static getType(): string {
    return 'colored-text'
  }

  static clone(node: ColoredTextNode): ColoredTextNode {
    return new ColoredTextNode(
      node.getTextContent(),
      node.__highlightColor,
      node.__colorType,
      node.getKey()
    )
  }

  constructor(
    text: string,
    highlightColorId = DEFAULT_HIGHLIGHT_COLOR_ID,
    colorType: 'text' | 'bg',
    key?: NodeKey
  ) {
    super(text, key)
    this.__highlightColor = highlightColorId
    this.__colorType = colorType
  }

  createDOM(config: EditorConfig): HTMLElement {
    const dom = super.createDOM(config)
    dom.classList.add(this.__highlightColor)
    dom.dataset.colorId = this.__highlightColor
    dom.dataset.colorType = this.__colorType
    return dom
  }

  updateDOM(prevNode: ColoredTextNode & this, dom: HTMLElement, config: EditorConfig): boolean {
    const isUpdated = super.updateDOM(prevNode, dom, config)

    if (prevNode.__highlightColor !== this.__highlightColor) {
      dom.classList.remove(prevNode.__highlightColor)
      dom.classList.add(this.__highlightColor)
      dom.dataset.colorId = this.__highlightColor
    }

    return isUpdated
  }

  static importJSON(serializedNode: SerializedColoredTextNode): ColoredTextNode {
    const node = $createColoredTextNode(
      serializedNode.text,
      serializedNode.highlightColor,
      serializedNode.colorType
    )
    // Set standard text node properties.
    node.setFormat(serializedNode.format)
    node.setDetail(serializedNode.detail)
    node.setMode(serializedNode.mode)
    node.setStyle(serializedNode.style)
    return node
  }

  exportJSON(): SerializedColoredTextNode {
    return {
      ...super.exportJSON(),
      highlightColor: this.getHighlightColor(),
      colorType: this.__colorType,
      version: 1,
    }
  }

  // --- Custom methods for our node ---
  setHighlightColor(colorId: string): this {
    const writable = this.getWritable()
    writable.__highlightColor = colorId
    return writable
  }

  /**
   * Gets the highlight color ID currently assigned to the node.
   * @returns The color ID string.
   */
  getHighlightColor(): string {
    return this.getLatest().__highlightColor
  }
}

/**
 * Factory function to create a new ColoredTextNode.
 * @param text - The text content of the node.
 * @param highlightColorId - The thematic ID for the background color.
 */
export function $createColoredTextNode(
  text: string,
  highlightColorId = DEFAULT_HIGHLIGHT_COLOR_ID,
  colorType: 'text' | 'bg'
): ColoredTextNode {
  return new ColoredTextNode(text, highlightColorId, colorType)
}

/**
 * Type guard to check if a LexicalNode is a ColoredTextNode.
 */
export function $isColoredTextNode(node: LexicalNode | null | undefined): node is ColoredTextNode {
  return node instanceof ColoredTextNode
}
