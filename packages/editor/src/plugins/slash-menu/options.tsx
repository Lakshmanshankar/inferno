import {
	INSERT_CHECK_LIST_COMMAND,
	INSERT_ORDERED_LIST_COMMAND,
	INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import type { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createHorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { $createHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import {
	$createTextNode,
	$getSelection,
	$isElementNode,
	$isRangeSelection,
	INSERT_PARAGRAPH_COMMAND,
} from "lexical";
import {
	CheckSquare,
	Columns3,
	DivideSquare,
	Heading1,
	Heading2,
	Heading3,
	ImagesIcon,
	Info,
	List,
	ListOrdered,
	ListTree,
	PanelTopOpen,
	Quote,
	Type,
} from "lucide-react";
import type React from "react";
import type { CalloutVariant } from "../../nodes/callout/callout.tsx";
import { INSERT_LAYOUT_COMMAND } from "./../column-layout";
import { SHOW_IMAGE_MODAL } from "./../image-node-plugin";
import { INSERT_TOC_COMMAND } from "./../toc-plugin.tsx";
import { INSERT_CALLOUT_COMMAND } from "../callout-plugin.tsx";
import { INSERT_COLLAPSIBLE_COMMAND } from "../collapsible-plugin.tsx";

export type SlashMenuItem = {
	value: string;
	label: string;
	shortcut: string;
	id: string;
	icon: React.ComponentType<{ className?: string }>;
	command: (editor: ReturnType<typeof useLexicalComposerContext>[0]) => void;
	group: string;
};

type HelperOpts = {
	headingLevel: 1 | 2 | 3;
	template?: string;
	calloutVariant?: CalloutVariant;
};

type Nodetype = "hr" | "quote" | "heading" | "image" | "column";

export const create = (
	editor: ReturnType<typeof useLexicalComposerContext>[0],
	type: Nodetype,
	options: HelperOpts = {
		headingLevel: 1,
		template: "1fr 1fr",
		calloutVariant: "info",
	},
) => {
	editor.update(() => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			const node = selection.anchor.getNode();
			const element = $isElementNode(node) ? node : node.getParent();
			if (!element) return;
			switch (type) {
				case "hr": {
					const line = $createHorizontalRuleNode();
					if (element.getNextSibling() != null) {
						element.replace(line);
					} else {
						element.insertBefore(line);
					}
					line.selectNext();
					return;
				}
				case "quote": {
					const newQuote = $createQuoteNode();
					const textContent = element.getTextContent();
					if (textContent) {
						newQuote.append($createTextNode(textContent));
					}
					element.replace(newQuote);
					newQuote.selectEnd();
					return;
				}
				case "image": {
					editor.dispatchCommand(SHOW_IMAGE_MODAL, { show: true });
					return;
				}
				case "column": {
					editor.dispatchCommand(
						INSERT_LAYOUT_COMMAND,
						options.template || "1fr 1fr",
					);
					return;
				}

				case "heading": {
					const newHeading = $createHeadingNode(
						`h${options.headingLevel}`,
					);
					const textContent = element.getTextContent();
					if (textContent) {
						newHeading.append($createTextNode(textContent));
					}
					element.replace(newHeading);
					newHeading.selectEnd();
					return;
				}
				default:
					break;
			}
		}
	});
};

export const menuItems: SlashMenuItem[] = [
	{
		value: "paragraph",
		label: "Text",
		shortcut: "",
		icon: Type,
		id: "slash-item-paragaph",
		group: "Basic",
		command: (editor) => {
			editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
		},
	},
	{
		value: "h1",
		label: "Heading 1",
		shortcut: "#",
		icon: Heading1,
		id: "slash-item-heading-1",
		group: "Headings",
		command: (editor) => {
			create(editor, "heading", { headingLevel: 1 });
		},
	},

	{
		value: "h2",
		label: "Heading 2",
		shortcut: "##",
		icon: Heading2,
		group: "Headings",
		id: "slash-item-heading-2",
		command: (editor) => {
			create(editor, "heading", { headingLevel: 2 });
		},
	},
	{
		value: "h3",
		label: "Heading 3",
		shortcut: "###",
		icon: Heading3,
		group: "Headings",
		id: "slash-item-heading-3",
		command: (editor) => {
			create(editor, "heading", { headingLevel: 3 });
		},
	},
	{
		value: "image",
		label: "Image",
		shortcut: "",
		icon: ImagesIcon,
		id: "slash-item-image-node",
		group: "Advanced",
		command: (editor) => {
			create(editor, "image");
		},
	},
	{
		label: "2 columns (equal width)",
		value: "1fr 1fr",
		shortcut: "",
		id: "slash-item-column-2",
		icon: Columns3,
		command: (editor) => {
			editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr");
		},
		group: "Layout",
	},
	{
		label: "2 columns 25% - 75%",
		value: "1fr 3fr",
		shortcut: "",
		id: "slash-item-column-2.1",
		icon: Columns3,
		command: (editor) => {
			editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 3fr");
		},
		group: "Layout",
	},
	{
		label: "3 columns (equal width)",
		value: "1fr 1fr 1fr",
		shortcut: "",
		id: "slash-item-column-3",
		icon: Columns3,
		command: (editor) => {
			editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr 1fr");
		},
		group: "Layout",
	},
	{
		label: "3 columns 25% - 50% - 25%",
		value: "1fr 2fr 1fr",
		shortcut: "",
		id: "slash-item-column-3.1",
		icon: Columns3,
		command: (editor) => {
			editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 2fr 1fr");
		},
		group: "Layout",
	},
	{
		label: "4 columns (equal width)",
		value: "1fr 1fr 1fr 1fr",
		shortcut: "",
		id: "slash-item-column-4",
		icon: Columns3,
		command: (editor) => {
			editor.dispatchCommand(INSERT_LAYOUT_COMMAND, "1fr 1fr 1fr 1fr");
		},
		group: "Layout",
	},
	{
		value: "ul",
		label: "Bullet List",
		shortcut: "-",
		icon: List,
		group: "Lists",
		id: "slash-item-bullet-list",
		command: (editor) => {
			editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
		},
	},
	{
		value: "ol",
		label: "Numbered List",
		shortcut: "1.",
		icon: ListOrdered,
		group: "Lists",
		id: "slash-item-number-list",
		command: (editor) => {
			editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
		},
	},
	{
		value: "checklist",
		label: "To-do List",
		shortcut: "[]",
		icon: CheckSquare,
		group: "Lists",
		id: "slash-item-check-list",
		command: (editor) => {
			editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
		},
	},
	{
		value: "callout",
		label: "Callout",
		shortcut: "",
		icon: Info,
		group: "Advanced",
		id: "slash-item-callout",
		command: (editor) => {
			editor.dispatchCommand(INSERT_CALLOUT_COMMAND, {
				variant: "info",
			});
		},
	},
	{
		value: "quote",
		label: "Quote",
		shortcut: ">",
		icon: Quote,
		group: "Advanced",
		id: "slash-item-quote",
		command: (editor) => {
			create(editor, "quote");
		},
	},
	{
		value: "divider",
		label: "Divider",
		shortcut: "---",
		icon: DivideSquare,
		group: "Advanced",
		id: "slash-item-divider",
		command: (editor) => {
			create(editor, "hr");
		},
	},
	{
		value: "Expand",
		label: "Expand",
		shortcut: "",
		icon: PanelTopOpen,
		group: "Advanced",
		id: "slash-item-accordion",
		command: (editor) => {
			editor.dispatchCommand(INSERT_COLLAPSIBLE_COMMAND, undefined);
		},
	},
	{
		value: "toc",
		label: "Table of Contents",
		shortcut: "",
		icon: ListTree, // lucide tree/list icon
		group: "Advanced",
		id: "slash-item-toc",
		command: (editor) => {
			editor.dispatchCommand(INSERT_TOC_COMMAND, undefined);
		},
	},
];
