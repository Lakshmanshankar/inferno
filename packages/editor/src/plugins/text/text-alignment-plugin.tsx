import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_CRITICAL,
	FORMAT_ELEMENT_COMMAND,
	FORMAT_TEXT_COMMAND,
} from "lexical";
import {
	AlignCenter,
	AlignJustifyIcon,
	AlignLeftIcon,
	AlignRightIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@inferno/ui/components/select";
import { cn } from "@inferno/ui/lib/utils";

const valueMap = [
	{ value: "left", label: "Left", icon: AlignLeftIcon },
	{ value: "right", label: "Right", icon: AlignRightIcon },
	{ value: "center", label: "Center", icon: AlignCenter },
	{ value: "justify", label: "Justify", icon: AlignJustifyIcon },
	{ value: "start", label: "Start", icon: AlignLeftIcon },
	{ value: "end", label: "End", icon: AlignRightIcon },
];

const ALIGNMENT_ENUM = {
	0: "start",
	1: "left",
	2: "center",
	3: "right",
	4: "justify",
	5: "start",
	6: "end",
} as const;

export const TextAlignmentPlugin = () => {
	const [editor] = useLexicalComposerContext();
	const [value, setValue] = useState<string>("left");
	const $updateAlignment = () => {
		const selection = $getSelection();
		if ($isRangeSelection(selection)) {
			const parentNode = selection.anchor.getNode().getParent();
			if (parentNode) {
				const format =
					parentNode.getFormat() as keyof typeof ALIGNMENT_ENUM;
				if (ALIGNMENT_ENUM[format]) {
					setValue(ALIGNMENT_ENUM[format]);
				}
			}
		}
	};

	useEffect(() => {
		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					$updateAlignment();
				});
			}),
			editor.registerCommand(
				FORMAT_TEXT_COMMAND,
				() => {
					$updateAlignment();
					return false;
				},
				COMMAND_PRIORITY_CRITICAL,
			),
		);
	}, [editor, $updateAlignment]);
	const formatEle = (
		type: "left" | "right" | "center" | "justify" | "start",
	) => {
		editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, type);
	};
	return (
		<>
			<Select
				value={value}
				onValueChange={(value) => {
					formatEle(
						value as
							| "left"
							| "right"
							| "center"
							| "justify"
							| "start",
					);
				}}
				defaultValue="left"
			>
				<SelectTrigger className="w-[120px] py-0 h-8! bg-accent/30 mb-0.5 mx-1 text-xs border-none">
					<SelectValue
						className={cn(
							"text-xs",
							value === "left" && "text-primary",
						)}
						placeholder="Align"
					/>
				</SelectTrigger>
				<SelectContent className="border-border text-xs">
					<SelectGroup>
						<SelectLabel className="text-xs">Alignment</SelectLabel>
						{valueMap.map((item, idx) => (
							<SelectItem
								key={idx}
								className={cn(
									"text-xs",
									item.value === value && "text-primary",
								)}
								value={item.value}
							>
								<item.icon
									className={cn(
										"inline-block w-4 h-4",
										item.value === value && "text-primary",
									)}
								/>
								<span
									className={cn(
										"ml-1",
										item.value === value && "text-primary",
									)}
								>
									{item.label}
								</span>
							</SelectItem>
						))}
					</SelectGroup>
				</SelectContent>
			</Select>
		</>
	);
};
