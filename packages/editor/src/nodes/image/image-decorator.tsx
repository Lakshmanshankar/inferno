import { Button } from "@inferno/ui/components/button";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@inferno/ui/components/popover";
import { Separator } from "@inferno/ui/components/separator";
import { Small } from "@inferno/ui/components/typography";
import { cn } from "@inferno/ui/lib/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey } from "lexical";
import {
	AlignCenter,
	AlignLeft,
	AlignRight,
	Captions,
	ChevronDown,
	RefreshCwIcon,
	Square,
	TrashIcon,
	TypeIcon,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

import { SHOW_IMAGE_MODAL } from "../../plugins/image-node-plugin";
import { $isImageNode, type Alignment, type Variant } from "./image-node";

/* -------------------------------------------------------------------------- */
/*                                Types & Utils                               */
/* -------------------------------------------------------------------------- */

type Props = {
	src: string;
	altText: string;
	maxWidth: number;
	width?: "inherit" | number;
	height?: "inherit" | number;
	caption?: string;
	showCaption?: boolean;
	showBorder?: boolean;
	captionsEnabled?: boolean;
	nodeKey: string;
	variant?: Variant;
	alignment?: Alignment;
};

export type ImagePropertiesUpdate = Partial<{
	src: string;
	altText: string;
	caption: string;
	showCaption: boolean;
	width: "inherit" | number;
	height: "inherit" | number;
	showBorder: boolean;
	variant: Variant;
	alignment: Alignment;
}>;

const getBorderColor = (variant?: Variant): string =>
	variant?.includes("white")
		? "img-border-white"
		: variant?.includes("gray")
			? "img-border-gray"
			: variant?.includes("black")
				? "img-border-black"
				: "";

const getBorderWidth = (variant?: Variant): string | undefined =>
	variant?.includes("thin")
		? "border"
		: variant?.includes("medium")
			? "border-2"
			: variant?.includes("thick")
				? "border-4"
				: undefined;

const getAlignment = (alignment?: Alignment): string | undefined => {
	if (alignment === "left") return "justify-start";
	if (alignment === "center") return "justify-center";
	if (alignment === "right") return "justify-end";
};

/* -------------------------------------------------------------------------- */
/*                               Main Component                               */
/* -------------------------------------------------------------------------- */

export const ImageDecorator = (props: Props) => {
	const [editor] = useLexicalComposerContext();
	const imgRef = useRef<HTMLImageElement | null>(null);
	const aspectRatio = useRef(
		typeof props.width === "number" && typeof props.height === "number"
			? props.width / props.height
			: 1,
	);

	const [caption, setCaption] = useState(props.caption);
	const [altText, setAltText] = useState("");
	const [open, setOpen] = useState(false);

	const [borderColor, setBorderColor] = useState<string>();
	const [borderWidth, setBorderWidth] = useState<string>();

	const [size, setSize] = useState({
		width: props.width === "inherit" ? undefined : props.width,
		height: props.height === "inherit" ? undefined : props.height,
	});

	const [draftSize, setDraftSize] = useState({
		width: size.width?.toString() ?? "",
		height: size.height?.toString() ?? "",
	});

	/* --------------------------- Initial Image Load -------------------------- */
	useEffect(() => {
		if (props.width === "inherit" || props.height === "inherit") {
			const img = new Image();
			img.onload = () => {
				const width = img.naturalWidth;
				const height = img.naturalHeight;

				aspectRatio.current = width / height;
				updateImageProperties({ width, height });
				setSize({ width, height });
				setDraftSize({
					width: width.toString(),
					height: height.toString(),
				});
			};
			img.onerror = () => {
				console.error("Failed to load image:", props.src);
				const fallback = { width: 300, height: 200 };
				updateImageProperties(fallback);
				setSize(fallback);
				setDraftSize({ width: "300", height: "200" });
			};
			img.src = props.src;
		} else {
			setDraftSize({
				width: size.width?.toString() ?? "",
				height: size.height?.toString() ?? "",
			});
		}
	}, [props.src]);

	/* ----------------------------- Helper Methods ---------------------------- */

	const updateImageProperties = (updates: ImagePropertiesUpdate) => {
		editor.update(() => {
			const node = $getNodeByKey(props.nodeKey);
			if ($isImageNode(node)) node.updateImageProperties(updates);
		});
	};

	const deleteImage = () => {
		editor.update(() => {
			const node = $getNodeByKey(props.nodeKey);
			if ($isImageNode(node)) node.remove();
		});
		setOpen(false);
	};

	const startResizing = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		const startX = e.clientX;
		const startWidth = size.width as number;

		const onMouseMove = (ev: MouseEvent) => {
			let newWidth = startWidth - (ev.clientX - startX); // deltaX
			if (newWidth < 50) newWidth = 50;
			const newHeight = Math.round(newWidth / aspectRatio.current);

			setSize({ width: newWidth, height: newHeight });
			updateImageProperties({ width: newWidth, height: newHeight });
			setDraftSize({ width: `${newWidth}`, height: `${newHeight}` });
		};

		const stop = () => {
			document.removeEventListener("mousemove", onMouseMove);
			document.removeEventListener("mouseup", stop);
		};

		document.addEventListener("mousemove", onMouseMove);
		document.addEventListener("mouseup", stop);
	};

	const commitSize = (dimension: "width" | "height") => {
		let newWidth = Number.parseInt(draftSize.width) || size.width || 0;
		let newHeight = Number.parseInt(draftSize.height) || size.height || 0;

		if (dimension === "width")
			newHeight = Math.round(newWidth / aspectRatio.current);
		else newWidth = Math.round(newHeight * aspectRatio.current);

		setSize({ width: newWidth, height: newHeight });
		setDraftSize({ width: `${newWidth}`, height: `${newHeight}` });
		updateImageProperties({ width: newWidth, height: newHeight });
	};

	const handleReplace = () => {
		setOpen(false);
		editor.dispatchCommand(SHOW_IMAGE_MODAL, {
			show: true,
			nodeKey: props.nodeKey,
		});
	};

	/* --------------------------- Rendered Component -------------------------- */

	const alignmentOptions = [
		{ value: "left", icon: AlignLeft },
		{ value: "center", icon: AlignCenter },
		{ value: "right", icon: AlignRight },
	] as const;

	const borderColors = [
		{ key: "white", className: "img-bg-white" },
		{ key: "grey", className: "img-bg-gray" },
		{ key: "black", className: "img-bg-black" },
	] as const;

	const borderSizes = [
		{ key: "thin", width: "1px" },
		{ key: "medium", width: "3px" },
		{ key: "thick", width: "5px" },
	] as const;

	return (
		<div
			className={cn(
				"flex items-center justify-start my-5 relative group",
				getAlignment(props.alignment),
			)}
		>
			<div className="relative inline-block">
				<div
					className="absolute top-[45%] -left-1 w-1.5 h-9 rounded-2xl cursor-ew-resize opacity-0 bg-sidebar-accent-foreground group-hover:opacity-100"
					onMouseDown={startResizing}
				/>

				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<div>
							<img
								ref={imgRef}
								src={props.src}
								alt={props.altText}
								width={size.width}
								height={size.height}
								data-dark-mode-src={props.src}
								style={{
									maxWidth: props.maxWidth,
									minWidth: "150px",
								}}
								className={cn(
									getBorderWidth(props.variant),
									getBorderColor(props.variant),
									!props.showBorder && "border-none",
								)}
							/>
							<Small className="block text-center text-xs text-muted-foreground mt-2 align-center">
								{props.caption}
							</Small>
						</div>
					</PopoverTrigger>

					<PopoverContent
						side="bottom"
						align="center"
						className="flex w-full items-center gap-2 p-2 py-0 mt-3 rounded-md border bg-background shadow-md"
					>
						{/* Alignment */}
						{alignmentOptions.map(({ value, icon: Icon }) => (
							<Button
								key={value}
								onClick={() =>
									updateImageProperties({ alignment: value })
								}
								size="icon"
								variant="ghost"
								className={cn(
									"h-7 w-7",
									props.alignment === value &&
										"bg-accent text-accent-foreground",
								)}
							>
								<Icon className="h-4 w-4" />
							</Button>
						))}

						<Separator orientation="vertical" className="h-5" />

						{/* Border + Dropdown */}
						<div className="flex items-center gap-0">
							<Button
								onClick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									updateImageProperties({
										showBorder: !props.showBorder,
									});
								}}
								size="icon"
								variant="ghost"
								className={cn(
									"h-7 w-7 rounded-r-none",
									props.showBorder &&
										"bg-accent text-accent-foreground",
								)}
							>
								<Square className="h-4 w-4" />
							</Button>

							<Popover>
								<PopoverTrigger asChild>
									<Button
										size="icon"
										variant="ghost"
										className="h-7 w-4 rounded-l-none"
									>
										<ChevronDown className="h-3 w-1" />
									</Button>
								</PopoverTrigger>

								<PopoverContent className="w-37 p-3 flex flex-col gap-2 bg-accent rounded-lg">
									{/* Color Pickers */}
									<div className="flex flex-col gap-2">
										<span className="text-xs">Color</span>
										<div className="p-1 w-full ml-2 flex gap-3 bg-accent/50 rounded-lg">
											{borderColors.map((color) => (
												<div
													key={color.key}
													className={cn(
														"w-7 h-7 rounded-full cursor-pointer flex items-center justify-center hover:scale-105 transition",
														color.className,
														borderColor ===
															color.key &&
															"ring-2 ring-zinc-400",
													)}
													onClick={() => {
														setBorderColor(
															color.key,
														);
														const variant =
															`img-${borderWidth || "medium"}-${color.key}` as Variant;
														updateImageProperties({
															variant,
														});
													}}
												/>
											))}
										</div>
									</div>

									<Separator />

									{/* Size Pickers */}
									<div className="flex flex-col gap-2">
										<span className="text-xs">Size</span>
										<div className="p-1 ml-2 w-full flex gap-4 bg-accent/50 rounded-lg">
											{borderSizes.map((s) => (
												<div
													key={s.key}
													className={cn(
														"w-6 h-6 flex items-center justify-center cursor-pointer rounded hover:scale-105 transition",
														s.key === borderWidth
															? "opacity-100"
															: "opacity-30",
													)}
													onClick={() => {
														setBorderWidth(s.key);
														const variant =
															`img-${s.key}-${borderColor || "black"}` as Variant;
														updateImageProperties({
															variant,
														});
													}}
												>
													<div
														className="w-full border-b"
														style={{
															borderBottomWidth:
																s.width,
														}}
													/>
												</div>
											))}
										</div>
									</div>
								</PopoverContent>
							</Popover>
						</div>

						<Separator orientation="vertical" className="h-5" />

						{/* Size Input */}
						<SizeInput
							draftSize={draftSize}
							setDraftSize={setDraftSize}
							commitSize={commitSize}
						/>

						<Separator orientation="vertical" className="h-5" />

						{/* Caption / Alt */}
						<CaptionAltToggle
							caption={caption}
							setCaption={setCaption}
							altText={altText}
							setAltText={setAltText}
							updateImageProperties={updateImageProperties}
						/>

						<Separator orientation="vertical" className="h-5" />

						{/* Replace */}
						<Button
							size="icon"
							variant="ghost"
							onClick={handleReplace}
						>
							<RefreshCwIcon className="h-3 w-3" />
						</Button>

						<Separator orientation="vertical" className="h-5" />

						{/* Delete */}
						<Button
							size="icon"
							variant="ghost"
							onClick={deleteImage}
						>
							<TrashIcon className="h-3 w-3 bg-destructive-secondary" />
						</Button>
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
};

/* -------------------------------------------------------------------------- */
/*                          Sub Components (Extracted)                         */
/* -------------------------------------------------------------------------- */

function SizeInput({
	draftSize,
	setDraftSize,
	commitSize,
}: {
	draftSize: { width: string; height: string };
	setDraftSize: React.Dispatch<
		React.SetStateAction<{ width: string; height: string }>
	>;
	commitSize: (dimension: "width" | "height") => void;
}) {
	const handleClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleKey = (e: React.KeyboardEvent) => e.stopPropagation();

	return (
		<div className="flex items-center gap-1">
			<input
				type="text"
				inputMode="numeric"
				value={draftSize.width}
				onChange={(e) =>
					setDraftSize((prev) => ({
						...prev,
						width: e.target.value.replace(/\D/g, ""),
					}))
				}
				onBlur={() => commitSize("width")}
				onKeyDown={(e) => {
					if (e.key === "Enter") commitSize("width");
					handleKey(e);
				}}
				onClick={handleClick}
				className="w-12 h-7 text-xs text-center focus:outline-none"
				placeholder="W"
			/>
			<span className="text-muted-foreground text-xs">×</span>
			<input
				type="text"
				inputMode="numeric"
				value={draftSize.height}
				onChange={(e) =>
					setDraftSize((prev) => ({
						...prev,
						height: e.target.value.replace(/\D/g, ""),
					}))
				}
				onBlur={() => commitSize("height")}
				onKeyDown={(e) => {
					if (e.key === "Enter") commitSize("height");
					handleKey(e);
				}}
				onClick={handleClick}
				className="w-12 h-7 text-xs text-center focus:outline-none"
				placeholder="H"
			/>
		</div>
	);
}

function CaptionAltToggle({
	caption,
	setCaption,
	altText,
	setAltText,
	updateImageProperties,
}: {
	caption: string | undefined;
	setCaption: React.Dispatch<React.SetStateAction<string | undefined>>;
	altText: string | undefined;
	setAltText: React.Dispatch<React.SetStateAction<string>>;
	updateImageProperties: (updates: ImagePropertiesUpdate) => void;
}) {
	const [mode, setMode] = useState<"caption" | "alt">("caption");

	return (
		<div className="flex items-center justify-center w-[180px]">
			<div className="relative flex border-2 border-accent rounded-md p-0 h-9 my-0.5">
				<div
					className={`absolute top-0 bottom-1 w-8 h-8 mb-0.5 bg-accent rounded-sm transition-transform duration-200 ease-in-out ${
						mode === "caption" ? "translate-x-0" : "translate-x-8"
					}`}
				/>

				<button
					type="button"
					onClick={() => setMode("caption")}
					className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-sm transition-colors ${
						mode === "caption"
							? "text-accent-foreground"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					<Captions className="h-5 w-5" />
				</button>
				<button
					type="button"
					onClick={() => setMode("alt")}
					className={`relative z-10 flex items-center justify-center w-8 h-7 rounded-sm transition-colors ${
						mode === "alt"
							? "text-accent-foreground"
							: "text-muted-foreground hover:text-foreground"
					}`}
				>
					<TypeIcon className="h-4 w-4" />
				</button>
			</div>

			<div className="relative">
				<input
					value={mode === "caption" ? caption || "" : altText}
					onChange={(e) =>
						mode === "caption"
							? setCaption(e.target.value)
							: setAltText(e.target.value)
					}
					onKeyDown={(ev) => {
						if (ev.key === "Enter") {
							updateImageProperties(
								mode === "caption" ? { caption } : { altText },
							);
						}
					}}
					placeholder={
						mode === "caption" ? "Enter caption" : "Enter alt text"
					}
					className="w-full h-8 text-sm resize-none border-none bg-transparent focus:outline-none p-2 placeholder:text-muted-foreground transition-opacity"
					style={{ lineHeight: "1.4" }}
				/>
			</div>
		</div>
	);
}
