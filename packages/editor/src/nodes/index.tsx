import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { CalloutContainerNode } from "./callout/callout";
import { CollapsibleContainerNode } from "./collapsible/CollapsibleContainerNode.tsx";
import { CollapsibleContentNode } from "./collapsible/CollapsibleContentNode.tsx";
import { CollapsibleTitleNode } from "./collapsible/CollapsibleTitleNode.tsx";
import { ColoredTextNode } from "./colored-text-node";
import { LayoutContainerNode } from "./column-layout/layout-container";
import { LayoutItemNode } from "./column-layout/layout-item";
import { DateNode } from "./date/date-node.tsx";
import { ImageNode } from "./image/image-node";
import { TocNode } from "./toc/toc-decorator.tsx";

export const LexicalNodes = [
	HeadingNode,
	QuoteNode,
	ListItemNode,
	ListNode,
	CodeHighlightNode,
	CodeNode,
	HorizontalRuleNode,
	LinkNode,
	AutoLinkNode,
	ColoredTextNode,
	ImageNode,
	DateNode,
	LayoutContainerNode,
	LayoutItemNode,
	CollapsibleContentNode,
	CollapsibleTitleNode,
	CollapsibleContainerNode,
	TocNode,
	CalloutContainerNode,
];
