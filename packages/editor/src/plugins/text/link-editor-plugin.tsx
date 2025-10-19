import {
	$createLinkNode,
	$isLinkNode,
	$toggleLink,
	LinkNode,
} from "@lexical/link";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent } from "@lexical/utils";
import { $getSelection, $isElementNode, $isRangeSelection } from "lexical";
import { Link2Icon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	CheckboxInput,
	TextInput,
} from "@inferno/ui/components/core/input-component";
import { Button } from "@inferno/ui/components/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@inferno/ui/components/popover";
import { splitNodesOnRange } from "./../../utils";
import { useSelectNodeUtil } from "./../../hooks/use-select-util";
import { cn } from "@inferno/ui/lib/utils";

export function LinkEditorPlugin() {
	const [editor] = useLexicalComposerContext();
	const { isLinkNode, hasSameParentBlockNode } = useSelectNodeUtil();
	const [linkState, setLinkState] = useState({
		url: "",
		title: "",
		openInNewTab: false,
	});
	const [isEditing, setIsEditing] = useState(false);
	const resetLinkState = useCallback(() => {
		setLinkState({
			url: "",
			title: "",
			openInNewTab: false,
		});
	}, []);

	const handleButtonClick = useCallback(() => {
		editor.getEditorState().read(() => {
			const selection = $getSelection();
			if (!$isRangeSelection(selection) || selection.isCollapsed()) {
				resetLinkState();
				setIsEditing(false);
				return;
			}

			const nodes = selection.getNodes();
			let linkNode = nodes.find((node): node is LinkNode =>
				$isLinkNode(node),
			);
			if (!linkNode) {
				const nodeWithLinkParent = nodes.find((node) => {
					const parent = node.getParent();
					return parent && $isLinkNode(parent);
				});
				if (nodeWithLinkParent) {
					const parent = nodeWithLinkParent.getParent();
					if (parent && $isLinkNode(parent)) {
						linkNode = parent;
					}
				}
			}
			if (linkNode) {
				setLinkState({
					url: linkNode.getURL(),
					title: linkNode.getTitle() || linkNode.getTextContent(),
					openInNewTab: linkNode.getTarget() === "_blank",
				});
			} else {
				resetLinkState();
			}
			setIsEditing(true);
		});
	}, [editor]);

	const $customToggleLink = (state: "link" | "unlink") => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			const { beforeNodes, selectedNodes, afterNodes } =
				splitNodesOnRange();
			if (selectedNodes.length === 0) return;

			const anchorNode = selection.anchor.getNode();
			const parentBlockNode = $findMatchingParent(
				anchorNode,
				(node) => $isElementNode(node) && !node.isInline(),
			);

			if (parentBlockNode && $isElementNode(parentBlockNode)) {
				parentBlockNode.clear();

				parentBlockNode.append(...beforeNodes);

				if (state === "link") {
					const newLink = $createLinkNode(linkState.url, {
						target: linkState.openInNewTab ? "_blank" : "_self",
						title: linkState.title || undefined,
					});
					newLink.append(...selectedNodes);
					parentBlockNode.append(newLink);
				} else {
					parentBlockNode.append(...selectedNodes);
				}

				parentBlockNode.append(...afterNodes);
				parentBlockNode.selectEnd();
			}
		}
	};

	const handleLinkCreate = useCallback(() => {
		editor.update(() => {
			if (hasSameParentBlockNode) {
				$customToggleLink("link");
			} else {
				$toggleLink(linkState.url, {
					target: linkState.openInNewTab ? "_blank" : "_self",
					title: linkState.title || undefined,
				});
			}
		});
		setIsEditing(false);
		resetLinkState();
	}, [editor, linkState]);

	const deleteLink = useCallback(() => {
		editor.update(() => {
			$toggleLink(null);
		});
		setIsEditing(false);
		resetLinkState();
	}, [editor, resetLinkState]);

	useEffect(() => {
		if (!editor) return;

		const unregisterLinkMerge = editor.registerNodeTransform(
			LinkNode,
			(linkNode: LinkNode) => {
				let current = linkNode;

				// 1. Merge into previous link if same URL
				const previous = current.getPreviousSibling();
				if (
					$isLinkNode(previous) &&
					previous.getURL() === current.getURL()
				) {
					previous.append(...current.getChildren());
					current.remove();
					current = previous;
				}

				// 2. Merge next siblings with same URL
				let next = current.getNextSibling();
				while (
					$isLinkNode(next) &&
					next.getURL() === current.getURL()
				) {
					current.append(...next.getChildren());
					const toRemove = next;
					next = next.getNextSibling();
					toRemove.remove();
				}
			},
		);

		return () => {
			unregisterLinkMerge();
		};
	}, [editor]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			handleLinkCreate();
		}
		if (e.key === "Escape") {
			e.preventDefault();
			setIsEditing(false);
			resetLinkState();
		}
	};

	const isValidUrl = (url: string): boolean => {
		if (!url) return false;
		try {
			new URL(url);
			return true;
		} catch {
			return url.startsWith("/") || url.startsWith("#");
		}
	};

	return (
		<Popover open={isEditing} onOpenChange={setIsEditing} modal>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className={`
            h-8 w-8
            mx-0.5 p-2.5! duration-300
            text-secondary-foreground
            hover:bg-accent/40 transition-all
            ${isLinkNode ? "text-primary bg-accent/50 dark:bg-accent/50" : ""}
          `}
					onClick={handleButtonClick}
					id="link-editor-popover-trigger"
				>
					<Link2Icon className="h-4 w-4" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="center"
				className={cn(
					"w-auto p-2 border border-accent rounded-lg mt-1 mb-1 px-4 ",
					!isEditing && "hidden",
				)}
				id="link-editor-popover-content"
			>
				<div className="flex flex-col gap-4">
					<TextInput
						labelProps={{
							children: (
								<span className="flex items-center gap-1 mb-1">
									URL
									{isValidUrl(linkState.url) && (
										<a
											href={linkState.url}
											target="_blank"
											rel="noreferrer"
											className="text-primary underline flex items-center justify-center"
										>
											Visit url
										</a>
									)}
								</span>
							),
							className: "text-sm",
						}}
						inputProps={{
							className: "h-8",
							value: linkState.url,
							onChange: (e) =>
								setLinkState((prev) => ({
									...prev,
									url: e.target.value,
								})),
							onKeyDown: handleKeyDown,
							placeholder: "https://lakshmanshankar.github.io",
							autoFocus: true,
						}}
						id="link-editor-url-input"
						clearBtnProps={{ title: "Clear" }}
						value={linkState.url}
						onChange={(url) =>
							setLinkState((prev) => ({ ...prev, url }))
						}
					/>

					<TextInput
						labelProps={{
							children: "Title (Optional)",
							className: "text-sm",
						}}
						inputProps={{
							className: "h-8",
							value: linkState.title,
							onChange: (e) =>
								setLinkState((prev) => ({
									...prev,
									title: e.target.value,
								})),
							onKeyDown: handleKeyDown,
							placeholder: "My Website",
						}}
						id="link-editor-title-input"
						clearBtnProps={{ title: "Clear" }}
						value={linkState.title}
						onChange={(title) =>
							setLinkState((prev) => ({ ...prev, title }))
						}
					/>
					<CheckboxInput
						labelProps={{
							children: "Open in new tab",
							className: "text-sm",
						}}
						value={linkState.openInNewTab}
						onChange={(openInNewTab) =>
							setLinkState((prev) => ({ ...prev, openInNewTab }))
						}
						defaultChecked={linkState.openInNewTab}
					/>

					<div className="flex gap-2 justify-end">
						<Button
							id="link-editor-reset-btn"
							variant={"outline"}
							onClick={deleteLink}
							size="sm"
							className="h-8"
						>
							Reset
						</Button>
						<Button
							id="link-editor-save-btn"
							onClick={handleLinkCreate}
							size="sm"
							className="h-8"
						>
							Save
						</Button>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}
