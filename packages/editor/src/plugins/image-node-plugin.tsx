import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import {
	$createParagraphNode,
	$getNodeByKey,
	$insertNodes,
	$isRootOrShadowRoot,
	COMMAND_PRIORITY_EDITOR,
	createCommand,
	type LexicalCommand,
} from "lexical";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@inferno/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@inferno/ui/components/dialog";
import { ImageSourceSelector } from "./../components/image-selector";
import { $createImageNode, $isImageNode, ImageNode, type ImagePayload } from "./../nodes/image/image-node";

export type InsertImagePayload = Readonly<ImagePayload>;

export type Dimensions = {
	width: number;
	height: number;
};

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> = createCommand("INSERT_IMAGE_COMMAND");

export const SHOW_IMAGE_MODAL: LexicalCommand<{ show: boolean; nodeKey?: string }> = createCommand("SHOW_IMAGE_MODAL");

export function ImagesPlugin() {
	const [editor] = useLexicalComposerContext();
	const [open, setOpen] = useState<boolean>(false);
	const [selectedImageSource, setSelectedImageSource] = useState<string | null>(null);
	const [imageDimensions, setImageDimensions] = useState<Dimensions>({
		width: 400,
		height: 400,
	});
	const [editNodeKey, setEditNodeKey] = useState<string | null>(null);

	useEffect(() => {
		if (!editor.hasNodes([ImageNode])) {
			throw new Error("ImagesPlugin: ImageNode not registered on editor");
		}

		mergeRegister(
			editor.registerCommand<{ show: boolean; nodeKey?: string }>(
				SHOW_IMAGE_MODAL,
				(payload) => {
					setOpen(payload.show);
					setEditNodeKey(payload.nodeKey ?? null);
					return true;
				},
				COMMAND_PRIORITY_EDITOR,
			),
			editor.registerCommand<InsertImagePayload>(
				INSERT_IMAGE_COMMAND,
				(payload) => {
					const imageNode = $createImageNode(payload);
					$insertNodes([imageNode]);
					if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
						$wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
					}
					return true;
				},
				COMMAND_PRIORITY_EDITOR,
			),
		);
	}, [editor]);

	const handleImageSelect = (imageSource: string) => {
		setSelectedImageSource(imageSource);
		const img = new Image();
		img.src = imageSource;
		img.onload = () => {
			setImageDimensions({
				width: img.width,
				height: img.height,
			});
		};
	};

	const handleInsert = () => {
		if (!selectedImageSource) {
			toast.error("Please select an image.");
			return;
		}

		if (editNodeKey) {
			// Replace existing image
			editor.update(() => {
				const node = $getNodeByKey(editNodeKey);
				if ($isImageNode(node)) {
					node.updateImageProperties({
						src: selectedImageSource,
						width: imageDimensions.width,
						height: imageDimensions.height,
						altText: "",
					});
				}
			});
		} else {
			// Insert new image
			editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
				src: selectedImageSource,
				darkModeSrc: "",
				width: imageDimensions.width,
				height: imageDimensions.height,
				altText: "",
			});
		}

		setOpen(false);
		setSelectedImageSource(null);
		setEditNodeKey(null);
	};

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (!newOpen) {
			setSelectedImageSource(null);
			setEditNodeKey(null);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle className="sr-only">{editNodeKey ? "Replace Image" : "Insert Image"}</DialogTitle>
					<DialogDescription className="sr-only">
						{editNodeKey ? "Replace the selected image" : "Insert a new image"}
					</DialogDescription>
				</DialogHeader>

				<ImageSourceSelector onImageSelect={handleImageSelect} />

				<DialogFooter>
					<Button onClick={handleInsert} disabled={!selectedImageSource}>
						{editNodeKey ? "Replace" : "Insert"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
