import {
	$isParagraphNode,
	type DOMConversion,
	type DOMConversionMap,
	type DOMConversionOutput,
	type DOMExportOutput,
	ElementNode,
	type LexicalNode,
	type NodeKey,
	type SerializedElementNode,
	type Spread,
} from "lexical";

export type CalloutVariant =
	| "info"
	| "warning"
	| "error"
	| "success"
	| "note"
	| "tip";

export type SerializedCalloutContainerNode = Spread<
	{
		variant: CalloutVariant;
		icon: string;
	},
	SerializedElementNode
>;

export class CalloutContainerNode extends ElementNode {
	__variant: CalloutVariant;
	__icon: string;

	constructor(variant: CalloutVariant = "info", icon = "💡", key?: NodeKey) {
		super(key);
		this.__variant = variant;
		this.__icon = icon;
	}

	static getType(): string {
		return "callout-container";
	}

	static clone(node: CalloutContainerNode): CalloutContainerNode {
		return new CalloutContainerNode(
			node.__variant,
			node.__icon,
			node.__key,
		);
	}

	createDOM(): HTMLElement {
		const container = document.createElement("aside");
		container.classList.add("editor-callout", `variant-${this.__variant}`);
		container.setAttribute("data-callout", "true");
		container.setAttribute("data-variant", this.__variant);

		const iconEl = document.createElement("span");
		iconEl.textContent = this.__icon;
		iconEl.classList.add("editor-callout-icon");
		iconEl.setAttribute("data-icon", "true");

		container.appendChild(iconEl);

		return container;
	}

	updateDOM(prevNode: CalloutContainerNode, dom: HTMLElement): boolean {
		if (
			this.__icon !== prevNode.__icon ||
			this.__variant !== prevNode.__variant
		) {
			const iconEl = dom.querySelector("[data-icon]");
			if (iconEl) iconEl.textContent = this.__icon;
			dom.setAttribute("data-variant", this.__variant);
			dom.className = `editor-callout variant-${this.__variant}`;
			return true;
		}
		return false;
	}

	exportJSON(): SerializedCalloutContainerNode {
		return {
			...super.exportJSON(),
			variant: this.__variant,
			icon: this.__icon,
		};
	}

	static importDOM(): DOMConversionMap {
		return {
			aside: (): DOMConversion<HTMLElement> | null => {
				return {
					conversion: (domNode: HTMLElement): DOMConversionOutput => {
						if (
							domNode.hasAttribute("data-callout") &&
							domNode.classList.contains("editor-callout")
						) {
							const variant =
								(domNode.getAttribute(
									"data-variant",
								) as CalloutVariant) || "info";
							const iconEl = domNode.querySelector("[data-icon]");
							const icon = iconEl?.textContent || "💡";
							return {
								node: $createCalloutContainerNode(
									variant,
									icon,
								),
							};
						}

						return { node: null };
					},
					priority: 1,
				};
			},
		};
	}

	static importJSON(
		json: SerializedCalloutContainerNode,
	): CalloutContainerNode {
		return new CalloutContainerNode(json.variant, json.icon);
	}

	exportDOM(): DOMExportOutput {
		const element = this.createDOM();
		return { element };
	}

	canBeEmpty(): boolean {
		return false;
	}

	isInline(): boolean {
		return false;
	}

	getVariant(): CalloutVariant {
		return this.__variant;
	}

	getIcon(): string {
		return this.__icon;
	}

	setVariant(variant: CalloutVariant): void {
		const writable = this.getWritable();
		writable.__variant = variant;
	}

	setIcon(icon: string): void {
		const writable = this.getWritable();
		writable.__icon = icon;
	}

	collapseAtStart(): boolean {
		const children = this.getChildren();
		if (
			children.length === 1 &&
			$isParagraphNode(children[0]) &&
			children[0].getTextContent() === ""
		) {
			this.remove();
			return true;
		}
		return false;
	}
}

export function $createCalloutContainerNode(
	variant: CalloutVariant = "info",
	icon = "💡",
): CalloutContainerNode {
	return new CalloutContainerNode(variant, icon);
}

export function $isCalloutContainerNode(
	node: LexicalNode,
): node is CalloutContainerNode {
	return node instanceof CalloutContainerNode;
}
