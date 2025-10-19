import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
	COMMAND_PRIORITY_EDITOR,
	createCommand,
	type LexicalCommand,
	type LexicalEditor,
} from "lexical";
import { Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { useSettingsStore } from "./../../components/core/settings/settings-store";
import { Button } from "@inferno/ui/components/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@inferno/ui/components/popover";
import { Separator } from "@inferno/ui/components/separator";
import { useSelectNodeUtil } from "./../../hooks/use-select-util";
import { useColorStore } from "./../../hooks/use-color-store";
import { cn } from "@inferno/ui/lib/utils";

export type ColorNodeCommandPayload = {
	colorId: string;
	type: "text" | "bg";
};

export const INSERT_COLOR_NODE_COMMAND: LexicalCommand<ColorNodeCommandPayload> =
	createCommand("INSERT_COLOR_NODE_COMMAND");

export function ColorNodePlugin() {
	const [editor] = useLexicalComposerContext();
	const { hasSameParentBlockNode } = useSelectNodeUtil();
	const { colors } = useColorStore();
	const { openTab } = useSettingsStore();
	const [open, setOpen] = useState(false);
	const currentColor = useCurrentColor(editor);

	useEffect(() => {
		return editor.registerCommand(
			INSERT_COLOR_NODE_COMMAND,
			(payload) => handleColorCommand(payload),
			COMMAND_PRIORITY_EDITOR,
		);
	}, [editor]);

	if (!hasSameParentBlockNode) return null;

	const currentColorInfo = getCurrentColorInfo(currentColor, colors);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="ghost"
					size="sm"
					className={cn(
						"w-8 h-8 p-2 duration-300 text-secondary-foreground hover:bg-accent/50 transition-all relative",
						currentColor?.colorId || "",
					)}
				>
					<Type className="w-4 h-4" />
					{currentColorInfo && (
						<ColorIndicator colorInfo={currentColorInfo} />
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent
				className={cn(
					"w-fit p-0 mt-1 mb-2 border border-accent shadow-lg",
					!open && "hidden",
				)}
				align="start"
			>
				<ColorPalette
					colors={colors}
					currentColor={currentColor}
					onColorSelect={(payload) => {
						editor.dispatchCommand(
							INSERT_COLOR_NODE_COMMAND,
							payload,
						);
					}}
					onCustomize={() => {
						openTab("Editor");
						setOpen(false);
					}}
				/>
			</PopoverContent>
		</Popover>
	);
}

function getCurrentColorInfo(
	currentColor: ReturnType<typeof useCurrentColor>,
	colors: any[],
) {
	if (!currentColor) return null;
	const colorName = currentColor.colorId.replace(/^(text-|bg-)/, "");
	const color = colors.find((c) => c.name === colorName);
	return color
		? { ...color, type: currentColor.type, colorId: currentColor.colorId }
		: null;
}

type ColorIndicatorProps = {
	colorInfo: {
		id: string;
		type: "text" | "bg";
	};
};

export function ColorIndicator({ colorInfo }: ColorIndicatorProps) {
	return (
		<div
			className={cn(
				"absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background",
				`bg-${colorInfo.id}`,
			)}
		/>
	);
}

type ColorPaletteProps = {
	colors: Array<{ id: string; name: string; type: "text" | "bg" }>;
	currentColor: { colorId: string; type: "text" | "bg" } | null;
	onColorSelect: (payload: ColorNodeCommandPayload) => void;
	onCustomize: () => void;
};

export function ColorPalette({
	colors,
	currentColor,
	onColorSelect,
	onCustomize,
}: ColorPaletteProps) {
	const textColors = colors.filter((c) => c.type !== "bg");
	const bgColors = colors.filter((c) => c.type !== "text");

	return (
		<div className="p-4">
			<ColorSection
				title="Text Color"
				type="text"
				colors={textColors}
				currentColor={currentColor}
				onColorSelect={onColorSelect}
			/>

			<ColorSection
				title="Background Color"
				type="bg"
				colors={bgColors}
				currentColor={currentColor}
				onColorSelect={onColorSelect}
			/>

			<Separator className="mb-4" />

			<Button
				className="w-full gap-2 font-medium"
				variant="default"
				size="sm"
				onClick={onCustomize}
			>
				<Settings className="w-4 h-4" />
				Customize Colors
			</Button>
		</div>
	);
}

import { Type } from "lucide-react";

type ColorSectionProps = {
	title: string;
	type: "text" | "bg";
	colors: Array<{ id: string; name: string }>;
	currentColor: { colorId: string; type: "text" | "bg" } | null;
	onColorSelect: (payload: ColorNodeCommandPayload) => void;
};

export function ColorSection({
	title,
	type,
	colors,
	currentColor,
	onColorSelect,
}: ColorSectionProps) {
	return (
		<div className="mb-5">
			<div className="flex items-center gap-2 mb-3">
				{type === "text" ? (
					<Type className="w-3.5 h-3.5 text-muted-foreground" />
				) : (
					<div className="w-3.5 h-3.5 rounded border bg-muted" />
				)}
				<span className="text-tiny font-medium text-muted-foreground">
					{title}
				</span>
			</div>
			<div className="grid grid-cols-5 gap-1.5">
				{colors.map((color) => {
					const isSelected =
						currentColor &&
						currentColor.colorId === `${type}-${color.id}` &&
						currentColor.type === type;

					return (
						<ColorButton
							key={color.id}
							color={color}
							type={type}
							isSelected={isSelected as boolean}
							onSelect={() =>
								onColorSelect({
									colorId: `${type}-${color.id}`,
									type,
								})
							}
						/>
					);
				})}
			</div>
		</div>
	);
}

type ColorButtonProps = {
	color: { id: string; name: string };
	type: "text" | "bg";
	isSelected: boolean;
	onSelect: () => void;
};

export function ColorButton({
	color,
	type,
	isSelected,
	onSelect,
}: ColorButtonProps) {
	const baseClasses = cn(
		"w-8 h-8 rounded-md border-2 flex items-center justify-center transition-all hover:scale-110 hover:shadow-md",
		type === "text" ? `text-${color.id}` : `bg-${color.id}`,
		isSelected
			? "border-primary ring-2 ring-primary/20 shadow-md"
			: type === "text"
				? "border-accent border hover:border-primary/50"
				: "border-none hover:border-primary/50",
	);

	const button = (
		<button
			type="button"
			className={baseClasses}
			onClick={onSelect}
			title={color.name}
			aria-label={color.name}
		>
			{type === "text" && (
				<span className="font-normal text-base">A</span>
			)}
		</button>
	);

	return button;
}

export function useCurrentColor(editor: LexicalEditor) {
	const [currentColor, setCurrentColor] = useState<{
		colorId: string;
		type: "text" | "bg";
	} | null>(null);

	useEffect(() => {
		return editor.registerUpdateListener(({ editorState }) => {
			editorState.read(() => {
				const selection = $getSelection();
				if (!$isRangeSelection(selection)) {
					setCurrentColor(null);
					return;
				}

				const coloredNode = selection
					.getNodes()
					.find((node) => $isColoredTextNode(node));

				if (coloredNode && $isColoredTextNode(coloredNode)) {
					setCurrentColor({
						colorId: coloredNode.__highlightColor,
						type: coloredNode.__colorType,
					});
				} else {
					setCurrentColor(null);
				}
			});
		});
	}, [editor]);

	return currentColor;
}

// ==================== Color Command Handler ====================
// color-command-handler.ts
import { $createLinkNode, $isLinkNode } from "@lexical/link";
import { $findMatchingParent } from "@lexical/utils";
import {
	$createTextNode,
	$getSelection,
	$isElementNode,
	$isRangeSelection,
	$isTextNode,
	type LexicalNode,
} from "lexical";
import {
	$createColoredTextNode,
	$isColoredTextNode,
} from "./../../nodes/colored-text-node";
import { splitNodesOnRange } from "./../../utils";

export function handleColorCommand({
	colorId,
	type,
}: ColorNodeCommandPayload): boolean {
	const selection = $getSelection();
	if (!$isRangeSelection(selection)) return false;

	const nodes = selection.getNodes();
	const shouldUnwrap = checkShouldUnwrap(nodes, colorId, type);

	if (shouldUnwrap) {
		unwrapColoredNodes(nodes);
	} else {
		applyColorToNodes(selection, colorId, type);
	}

	return true;
}

function checkShouldUnwrap(
	nodes: LexicalNode[],
	colorId: string,
	type: "text" | "bg",
): boolean {
	return (
		nodes.length > 0 &&
		nodes.every(
			(node) =>
				$isColoredTextNode(node) &&
				node.__highlightColor === colorId &&
				node.__colorType === type,
		)
	);
}

function unwrapColoredNodes(nodes: LexicalNode[]) {
	nodes.forEach((node) => {
		if ($isColoredTextNode(node)) {
			node.replace(
				$createTextNode(node.getTextContent()).setFormat(
					node.getFormat(),
				),
			);
		}
	});
}

function applyColorToNodes(
	selection: ReturnType<typeof $getSelection>,
	colorId: string,
	type: "text" | "bg",
) {
	if (!$isRangeSelection(selection)) return;

	const { beforeNodes, selectedNodes, afterNodes } = splitNodesOnRange({
		includeSelectedDecorations: true,
	});

	const anchorNode = selection.anchor.getNode();
	const parentBlockNode = $findMatchingParent(
		anchorNode,
		(node) => $isElementNode(node) && !node.isInline(),
	);

	if (!parentBlockNode || !$isElementNode(parentBlockNode)) return;

	parentBlockNode.clear();
	const newSelected = transformNodes(selectedNodes, colorId, type);

	parentBlockNode.append(...beforeNodes);
	parentBlockNode.append(...newSelected);
	parentBlockNode.append(...afterNodes);
	parentBlockNode.selectEnd();
}

function transformNodes(
	nodes: LexicalNode[],
	colorId: string,
	type: "text" | "bg",
): LexicalNode[] {
	return nodes.map((node) => {
		if ($isColoredTextNode(node)) {
			return node.getHighlightColor() === colorId
				? node
				: node.setHighlightColor(colorId);
		}

		if ($isTextNode(node)) {
			return $createColoredTextNode(
				node.getTextContent(),
				colorId,
				type,
			).setFormat(node.getFormat());
		}

		if ($isLinkNode(node)) {
			const coloredNode = $createColoredTextNode(
				node.getTextContent(),
				colorId,
				type,
			).setFormat(node.getFormat());
			const linkNode = $createLinkNode(node.getURL());
			linkNode.append(coloredNode);
			return linkNode;
		}

		return node;
	});
}
