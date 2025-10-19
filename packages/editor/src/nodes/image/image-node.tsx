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
} from "lexical";
import type { JSX } from "react";

import { ImageDecorator } from "./image-decorator";

export interface ImagePayload {
	src: string;
	darkModeSrc: string;
	altText: string;
	maxWidth?: number;
	width?: number;
	height?: number;
	caption?: string;
	showCaption?: boolean;
	captionsEnabled?: boolean;
	showBorder?: boolean;
	variant?: Variant;
	alignment?: Alignment;
	key?: NodeKey;
}

export type Variant =
	| "img-thin-white"
	| "img-thin-black"
	| "img-thin-grey"
	| "img-thick-white"
	| "img-thick-black"
	| "img-thick-grey"
	| "img-medium-white"
	| "img-medium-black"
	| "img-medium-grey";
export type Alignment = "left" | "center" | "right";

export type SerializedImageNode = Spread<
	{
		src: string;
		darkModeSrc?: string;
		altText: string;
		maxWidth: number;
		width?: number;
		height?: number;
		caption: string;
		showCaption: boolean;
		showBorder: boolean;
		variant: Variant | undefined;
		alignment: Alignment;
	},
	SerializedLexicalNode
>;

export const IMAGE_NODE_TYPE = "image";

function $convertImageElement(domNode: Node): null | DOMConversionOutput {
	const img = domNode as HTMLImageElement;
	if (img.src.startsWith("file:///")) {
		return null;
	}
	const { alt: altText, src, width, height } = img;
	const node = $createImageNode({
		altText,
		height,
		src,
		width,
		darkModeSrc: src,
	});
	return { node };
}

export class ImageNode extends DecoratorNode<JSX.Element> {
	__src: string;
	__darkModeSrc: string;
	__altText: string;
	__width: "inherit" | number;
	__maxWidth: number;
	__height: "inherit" | number;
	__showCaption: boolean;
	__caption: string;
	__captionsEnabled: boolean;
	__showBorder: boolean;
	__variant: Variant | undefined;
	__alignment: Alignment;

	static getType(): string {
		return IMAGE_NODE_TYPE; // Use the constant for consistency
	}

	static clone(node: ImageNode): ImageNode {
		return new ImageNode(
			node.__src,
			node.__darkModeSrc,
			node.__altText,
			node.__maxWidth,
			node.__width,
			node.__height,
			node.__caption,
			node.__showCaption,
			node.__captionsEnabled,
			node.__showBorder,
			node.__variant,
			node.__alignment,
			node.__key,
		);
	}

	static importJSON(serializedNode: SerializedImageNode): ImageNode {
		const {
			altText,
			height,
			width,
			maxWidth,
			src,
			showCaption,
			darkModeSrc,
			caption,
			showBorder,
			variant,
			alignment,
		} = serializedNode;

		const darkSrc = darkModeSrc || src;
		return $createImageNode({
			src,
			darkModeSrc: darkSrc,
			altText,
			width,
			maxWidth,
			height,
			caption,
			showCaption,
			showBorder,
			variant,
			alignment,
		}).updateFromJSON(serializedNode);
	}

	updateFromJSON(
		serializedNode: LexicalUpdateJSON<SerializedImageNode>,
	): this {
		return super.updateFromJSON(serializedNode);
	}

	exportDOM(): DOMExportOutput {
		const element = document.createElement("img");
		element.setAttribute("src", this.__src);
		element.setAttribute("dark-mode-src", this.__darkModeSrc);
		element.setAttribute("data-caption", this.__caption);
		element.setAttribute(
			"data-show-caption",
			this.__showCaption ? "true" : "false",
		);
		element.setAttribute(
			"data-show-border",
			this.__showBorder ? "true" : "false",
		);
		element.setAttribute("alt", this.__altText);
		element.setAttribute("width", this.__width.toString());
		element.setAttribute("height", this.__height.toString());
		element.setAttribute("data-variant", this.__variant || "");
		element.setAttribute("data-alignment", this.__alignment);
		element.setAttribute("data-lexical-image", "true");
		return { element };
	}

	static importDOM(): DOMConversionMap | null {
		return {
			img: () => ({
				conversion: $convertImageElement,
				priority: 0,
			}),
		};
	}

	constructor(
		src: string,
		darkModeSrc: string,
		altText: string,
		maxWidth: number,
		width?: "inherit" | number,
		height?: "inherit" | number,
		caption?: string,
		showCaption?: boolean,
		captionsEnabled?: boolean,
		showBorder?: boolean,
		variant?: Variant,
		alignment?: Alignment,
		key?: NodeKey,
	) {
		super(key);
		this.__src = src;
		this.__altText = altText;
		this.__maxWidth = maxWidth;
		this.__width = width || "inherit";
		this.__height = height || "inherit";
		this.__showCaption = showCaption || false;
		this.__caption = caption || "";
		this.__darkModeSrc = darkModeSrc || src;
		this.__captionsEnabled =
			captionsEnabled || captionsEnabled === undefined;
		this.__showBorder = showBorder !== undefined ? showBorder : true;
		this.__alignment = alignment || "center";
		this.__variant = variant;
	}

	exportJSON(): SerializedImageNode {
		return {
			...super.exportJSON(),
			type: IMAGE_NODE_TYPE,
			altText: this.__altText.toString(),
			caption: this.__caption.toString(),
			height: this.__height === "inherit" ? 0 : this.__height,
			maxWidth: this.__maxWidth,
			showCaption: this.__showCaption,
			showBorder: this.__showBorder,
			src: this.getSrc(),
			darkModeSrc: this.getDarkModeSrc(),
			width: this.__width === "inherit" ? 0 : this.__width,
			variant: this.__variant,
			alignment: this.__alignment,
		};
	}

	createDOM(config: EditorConfig): HTMLElement {
		const span = document.createElement("span");
		const theme = config.theme;
		const className = theme.image;
		span.setAttribute("data-lexical-image-wrapper", "true");
		span.setAttribute("data-lexical-decorator", "true");
		span.setAttribute("contenteditable", "false");
		span.setAttribute("draggable", "false");
		if (className !== undefined) {
			span.className = className;
		}
		span.classList.add("editor-image");
		return span;
	}

	updateDOM(): false {
		return false;
	}

	isFocusable(): boolean {
		return false;
	}

	isKeyboardSelectable(): boolean {
		return true;
	}

	getSrc(): string {
		return this.__src;
	}

	getDarkModeSrc(): string {
		return this.__darkModeSrc;
	}

	updateImageProperties(updates: {
		src?: string;
		altText?: string;
		caption?: string;
		showCaption?: boolean;
		showBorder?: boolean;
		width?: "inherit" | number;
		height?: "inherit" | number;
		variant?: Variant;
		alignment?: Alignment;
	}): void {
		const writable = this.getWritable();
		if (updates.src !== undefined) writable.__src = updates.src;
		if (updates.altText !== undefined) writable.__altText = updates.altText;
		if (updates.caption !== undefined) writable.__caption = updates.caption;
		if (updates.showCaption !== undefined)
			writable.__showCaption = updates.showCaption;
		if (updates.showBorder !== undefined)
			writable.__showBorder = updates.showBorder;
		if (updates.width !== undefined) writable.__width = updates.width;
		if (updates.height !== undefined) writable.__height = updates.height;
		if (updates.variant !== undefined) writable.__variant = updates.variant;
		if (updates.alignment !== undefined)
			writable.__alignment = updates.alignment;
	}

	decorate(): JSX.Element {
		return (
			<ImageDecorator
				src={this.__src}
				altText={this.__altText}
				maxWidth={this.__maxWidth}
				width={this.__width}
				height={this.__height}
				caption={this.__caption}
				showCaption={this.__showCaption}
				showBorder={this.__showBorder}
				captionsEnabled={this.__captionsEnabled}
				nodeKey={this.getKey()}
				variant={this.__variant}
				alignment={this.__alignment}
			/>
		);
	}
}

export function $createImageNode({
	altText,
	darkModeSrc,
	height,
	maxWidth = 1024,
	captionsEnabled,
	src,
	width,
	showCaption,
	caption,
	showBorder,
	variant,
	alignment,
	key,
}: ImagePayload): ImageNode {
	return $applyNodeReplacement(
		new ImageNode(
			src,
			darkModeSrc || src,
			altText,
			maxWidth,
			width,
			height,
			caption,
			showCaption,
			captionsEnabled,
			showBorder,
			variant,
			alignment,
			key,
		),
	);
}

export function $isImageNode(
	node: LexicalNode | null | undefined,
): node is ImageNode {
	if (!node) return false;
	return (
		node instanceof ImageNode ||
		node.getType() === IMAGE_NODE_TYPE ||
		node.constructor.name === "ImageNode"
	);
}
