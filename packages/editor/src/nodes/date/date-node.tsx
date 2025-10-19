import {
  $applyNodeReplacement,
  DecoratorNode,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type EditorConfig,
  type LexicalNode,
  type LexicalUpdateJSON,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from 'lexical'
import type { JSX } from 'react'

import { DateDecorator } from './date-decorator'

export interface DatePayload {
  date: string // ISO string or custom format
  format?: string // optional display format
  key?: NodeKey
}

export type SerializedDateNode = Spread<
  {
    date: string
    format?: string
  },
  SerializedLexicalNode
>

export const DATE_NODE_TYPE = 'date'

function $convertDateElement(domNode: Node): null | DOMConversionOutput {
  const el = domNode as HTMLElement
  const date = el.getAttribute('data-date')
  if (!date) return null

  const format = el.getAttribute('data-format') || undefined
  const node = $createDateNode({ date, format })
  return { node }
}

export class DateNode extends DecoratorNode<JSX.Element> {
  __date: string
  __format: string | undefined

  static getType(): string {
    return DATE_NODE_TYPE
  }

  static clone(node: DateNode): DateNode {
    return new DateNode(node.__date, node.__format, node.__key)
  }

  static importJSON(serializedNode: SerializedDateNode): DateNode {
    const { date, format } = serializedNode
    return $createDateNode({ date, format }).updateFromJSON(serializedNode)
  }

  updateFromJSON(serializedNode: LexicalUpdateJSON<SerializedDateNode>): this {
    return super.updateFromJSON(serializedNode)
  }

  exportJSON(): SerializedDateNode {
    return {
      ...super.exportJSON(),
      type: DATE_NODE_TYPE,
      date: this.__date,
      format: this.__format,
    }
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('span')
    element.setAttribute('data-lexical-date', 'true')
    element.setAttribute('data-date', this.__date)
    if (this.__format) {
      element.setAttribute('data-format', this.__format)
    }
    return { element }
  }

  static importDOM(): DOMConversionMap | null {
    return {
      span: () => ({
        conversion: $convertDateElement,
        priority: 0,
      }),
    }
  }

  constructor(date: string, format?: string, key?: NodeKey) {
    super(key)
    this.__date = date
    this.__format = format
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span')
    span.setAttribute('data-lexical-date-wrapper', 'true')
    span.setAttribute('data-lexical-decorator', 'true')
    span.setAttribute('contenteditable', 'false')
    span.classList.add('editor-date')
    const theme = config.theme
    if (theme.date) {
      span.className = theme.date
    }
    return span
  }

  updateDOM(): false {
    return false
  }

  isKeyboardSelectable(): boolean {
    return true
  }

  getDate(): string {
    return this.__date
  }

  getFormat(): string | undefined {
    return this.__format
  }

  updateDateProperties(updates: { date?: string; format?: string }): void {
    const writable = this.getWritable()
    if (updates.date !== undefined) writable.__date = updates.date
    if (updates.format !== undefined) writable.__format = updates.format
  }

  decorate(): JSX.Element {
    return <DateDecorator date={this.__date} nodeKey={this.getKey()} />
  }
}

export function $createDateNode({ date, format, key }: DatePayload): DateNode {
  return $applyNodeReplacement(new DateNode(date, format, key))
}

export function $isDateNode(node: LexicalNode | null | undefined): node is DateNode {
  if (!node) return false
  return (
    node instanceof DateNode ||
    node.getType() === DATE_NODE_TYPE ||
    node.constructor.name === 'DateNode'
  )
}
