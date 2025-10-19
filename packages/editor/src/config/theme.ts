// https://lexical.dev/docs/getting-started/theming
// Contain class names for lexical nodes
export const theme = {
  ltr: 'ltr',
  rtl: 'rtl',
  paragraph: 'text-paragraph',
  quote: 'block-quote',
  heading: {
    h1: 'block-h1',
    h2: 'block-h2',
    h3: 'block-h3',
  },
  link: 'text-link',
  list: {
    ul: 'list-ul',
    ol: 'list-ol',
    listitem: 'list-item',
    nested: {
      listitem: 'nested-list-item',
    },
  },
  hr: 'horizontal-rule',
  code: 'inline-code',
  text: {
    link: 'text-link',
    underline: 'underline',
    code: 'inline-code',
    codeHighlight: 'code-highlight',
    bold: 'font-bold',
    italic: 'italic',
    strikethrough: 'line-through',
    subscript: 'subscript',
    superscript: 'superscript',
    highlight: 'highlight',
  },
}
