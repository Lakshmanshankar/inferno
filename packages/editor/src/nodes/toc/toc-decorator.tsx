import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isHeadingNode } from "@lexical/rich-text";
import {
	$getRoot,
	DecoratorNode,
	type EditorConfig,
	type LexicalNode,
} from "lexical";
import { type JSX, useEffect, useState } from "react";

function TocComponent() {
	const [editor] = useLexicalComposerContext();
	const [headings, setHeadings] = useState<
		{ tag: string; text: string; key: string }[]
	>([]);

	useEffect(() => {
		return editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				const root = $getRoot();
				const allHeadings: {
					tag: string;
					text: string;
					key: string;
				}[] = [];

				// biome-ignore lint/complexity/noForEach: <explanation>
				root.getAllTextNodes().forEach((textNode) => {
					const parent = textNode.getParent();
					if ($isHeadingNode(parent)) {
						// add ID to heading DOM so we can scroll to it
						const dom = editor.getElementByKey(parent.getKey());
						if (dom && !dom.id) {
							dom.id = `heading-${parent.getKey()}`;
						}

						allHeadings.push({
							tag: parent.getTag(),
							text: parent.getTextContent(),
							key: parent.getKey(),
						});
					}
				});

				const filtered = allHeadings.filter((h) =>
					["h1", "h2", "h3"].includes(h.tag),
				);

				setHeadings(filtered);
			});
		});
	}, [editor]);

	const handleClick = (key: string) => {
		const el = document.getElementById(`heading-${key}`);
		if (el) {
			el.scrollIntoView({ behavior: "smooth", block: "start" });
		}
	};

	const getBullet = (tag: string) => {
		if (tag === "h1") {
			return (
				<span className="inline-block w-2 h-2 rounded-full bg-foreground mr-2" />
			);
		}
		if (tag === "h2") {
			return (
				<span className="inline-block w-2 h-2 rounded-full bg-muted-foreground mr-2" />
			);
		}
		if (tag === "h3") {
			return (
				<span className="inline-block w-2 h-2 rounded-full border border-muted-foreground mr-2" />
			);
		}
		return null;
	};

	return (
		<div className="p-5 rounded">
			<h3 className="mb-2 text-lg! font-bold">Table of Contents</h3>

			{headings.length === 0 ? (
				<p className="text-sm! text-muted-foreground">
					Start adding headings to your page and they will appear here
				</p>
			) : (
				<ul>
					{headings.map((heading) => {
						let indent = "";
						if (heading.tag === "h2") indent = "ml-4";
						if (heading.tag === "h3") indent = "ml-8";

						return (
							<li
								key={heading.key}
								onClick={() => handleClick(heading.key)}
								className={`${indent} flex text-blue-500 items-center cursor-pointer hover:opacity-80 hover:underline`}
							>
								{getBullet(heading.tag)}
								{heading.text || "(empty)"}
							</li>
						);
					})}
				</ul>
			)}
		</div>
	);
}

// --- Node Definition ---
export class TocNode extends DecoratorNode<JSX.Element> {
	static getType(): string {
		return "toc";
	}

	static clone(node: TocNode): TocNode {
		return new TocNode(node.__key);
	}

	createDOM(_config: EditorConfig): HTMLElement {
		const dom = document.createElement("div");
		dom.className = "toc-node";
		return dom;
	}

	updateDOM(): false {
		return false;
	}

	decorate(): JSX.Element {
		return <TocComponent />;
	}
}

export function $createTocNode(): TocNode {
	return new TocNode();
}

export function $isTocNode(
	node: LexicalNode | null | undefined,
): node is TocNode {
	return node instanceof TocNode;
}
