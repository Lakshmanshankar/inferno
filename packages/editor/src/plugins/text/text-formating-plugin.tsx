import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_CRITICAL, FORMAT_TEXT_COMMAND } from "lexical";
import { Bold, Code2Icon, ItalicIcon, LinkIcon, StrikethroughIcon, TextIcon, UnderlineIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@inferno/ui/components/button";
import { Separator } from "@inferno/ui/components/separator";

import { LinkEditorPlugin } from "./link-editor-plugin";
import { TextAlignmentPlugin } from "./text-alignment-plugin";
import { ColorNodePlugin } from "./text-color-plugin";

const ICON_MAP = {
	B: Bold,
	I: ItalicIcon,
	U: UnderlineIcon,
	C: Code2Icon,
	S: StrikethroughIcon,
	L: LinkIcon,
	Color: TextIcon,
};

export const TextFormattingPlugin = () => {
	const [editor] = useLexicalComposerContext();
	const [bold, setBold] = useState(false);
	const [italic, setItalic] = useState(false);
	const [underline, setUnderline] = useState(false);
	const [code, setCode] = useState(false);
	const [strikethrough, setStrikethrough] = useState(false);

	const $updateFormat = () => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			setBold(selection.hasFormat("bold"));
			setItalic(selection.hasFormat("italic"));
			setUnderline(selection.hasFormat("underline"));
			setCode(selection.hasFormat("code"));
			setStrikethrough(selection.hasFormat("strikethrough"));
		}
	};

	useEffect(() => {
		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					$updateFormat();
				});
			}),
			editor.registerCommand(
				FORMAT_TEXT_COMMAND,
				() => {
					$updateFormat();
					return false;
				},
				COMMAND_PRIORITY_CRITICAL,
			),
		);
	}, [editor, $updateFormat]);

	const format = (type: "bold" | "italic" | "underline" | "code" | "strikethrough") => {
		editor.dispatchCommand(FORMAT_TEXT_COMMAND, type);
	};

	return (
		<div className="flex items-center">
			<ToggleText name="format-bold-btn" type="B" onClick={() => format("bold")} isActive={bold} />
			<ToggleText name="format-italic-btn" type="I" onClick={() => format("italic")} isActive={italic} />
			<ToggleText name="format-underline-btn" type="U" onClick={() => format("underline")} isActive={underline} />
			<ToggleText name="format-inline-code-btn" type="C" onClick={() => format("code")} isActive={code} />
			<ToggleText
				name="format-strikethrough-btn"
				type="S"
				onClick={() => format("strikethrough")}
				isActive={strikethrough}
			/>
			<Separator orientation="vertical" className="h-6 w-[2px] mx-1 rounded-md" />
			<LinkEditorPlugin />
			<ColorNodePlugin />
			<Separator orientation="vertical" className="h-6 w-[2px] mx-1 rounded-md" />
			<TextAlignmentPlugin />
		</div>
	);
};

export const ToggleText = ({
	type,
	onClick,
	isActive,
	name,
}: {
	type: string;
	onClick: () => void;
	isActive: boolean;
	name: string;
}) => {
	const ComponentIcon = ICON_MAP[type as keyof typeof ICON_MAP];
	if (!ComponentIcon) return null;
	return (
		<Button
			variant="icon"
			id={name}
			onClick={onClick}
			style={{
				margin: "0px 1.5px",
			}}
			className={`
      w-8 h-8 p-2.5! duration-300
      text-secondary-foreground
      hover:bg-accent/40  transition-all
      ${isActive ? "text-primary bg-accent/50 dark:bg-accent/50" : ""}
    `}
		>
			<ComponentIcon className="w-5 h-5" />
		</Button>
	);
};
