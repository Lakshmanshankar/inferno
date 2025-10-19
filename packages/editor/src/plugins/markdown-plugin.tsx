import {
	CHECK_LIST,
	//   type ElementTransformer,
	HEADING,
	ORDERED_LIST,
	QUOTE,
	TEXT_FORMAT_TRANSFORMERS,
	type Transformer,
	UNORDERED_LIST,
} from "@lexical/markdown";
// import {
//   $createHorizontalRuleNode,
//   $isHorizontalRuleNode,
//   HorizontalRuleNode,
// } from '@lexical/react/LexicalHorizontalRuleNode'
// import type { LexicalNode } from 'lexical'

// export const HR: ElementTransformer = {
//   dependencies: [HorizontalRuleNode],
//   export: (node: LexicalNode) => {
//     return $isHorizontalRuleNode(node) ? '---' : null
//   },
//   regExp: /^(\*\*\*|---|___)\s*?$/,
//   replace: (parentNode, _1, _2, isImport) => {
//     const line = $createHorizontalRuleNode()
//     if (isImport || parentNode.getNextSibling() != null) {
//       parentNode.replace(line)
//     } else {
//       parentNode.insertBefore(line)
//     }
//     line.selectNext()
//   },
//   type: 'element',
// }
/**
 * Markdown shortcut tranformers, custom for horizontal node.
 */
export const MD_TRANSFORMERS = [
	ORDERED_LIST,
	UNORDERED_LIST,
	HEADING,
	TEXT_FORMAT_TRANSFORMERS,
	QUOTE,
	//   HR,
	CHECK_LIST,
] as Transformer[];
