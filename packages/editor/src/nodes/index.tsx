import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";

export const LexicalNodes = [
	HeadingNode,
	QuoteNode,
	ListItemNode,
	ListNode,
	CodeHighlightNode,
	CodeNode,
	LinkNode,
	AutoLinkNode,
];
