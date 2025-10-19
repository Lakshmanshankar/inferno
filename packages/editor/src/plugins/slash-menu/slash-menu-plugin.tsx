import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import { $getSelection, $isElementNode, $isRangeSelection } from "lexical";
import { Search } from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Input } from "@inferno/ui/components/input";
import { ScrollArea } from "@inferno/ui/components/scroll-area";
import { menuItems, type SlashMenuItem } from "./options";
import { cn } from "@inferno/ui/lib/utils";

const MENU_HEIGHT_IN_PX = 300;

export function SlashMenuPlugin() {
	const [editor] = useLexicalComposerContext();
	const ref = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const [show, setShow] = useState(false);
	const [isVisible, setIsVisible] = useState(false);
	const [searchValue, setSearchValue] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [position, setPosition] = useState<"below" | "top">("below");
	const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

	const filteredItems = menuItems.filter((item) =>
		item.label.toLowerCase().includes(searchValue.toLowerCase()),
	);

	const removeFirstSlashChar = () => {
		editor.update(() => {
			const selection = $getSelection();
			if ($isRangeSelection(selection)) {
				const node = selection.anchor.getNode();
				if (!$isElementNode(node)) {
					const content = node.getTextContent();
					if (content.startsWith("/")) {
						node.setTextContent(content.slice(1));
						node.select(0, 0);
					}
				}
			}
		});
	};

	const handleSelect = useCallback(
		(item: SlashMenuItem) => {
			removeFirstSlashChar();
			item.command(editor);
			setIsVisible(false);
			setTimeout(() => {
				setShow(false);
				setSearchValue("");
				setSelectedIndex(0);
			}, 100);
		},
		[editor],
	);

	const updateMenu = useCallback(() => {
		const selection = $getSelection();
		if ($isRangeSelection(selection) && selection.isCollapsed()) {
			const node = selection.anchor.getNode();
			if ($isElementNode(node)) return;

			const textContent = node.getTextContent();
			const cursorOffset = selection.anchor.offset;
			const textBeforeCursor = textContent.slice(0, cursorOffset);
			const slashMatch = textBeforeCursor.match(/^\/(.*)$/);

			if (slashMatch) {
				const searchTerm = slashMatch[1] || "";
				setShow(true);
				setSearchValue(searchTerm);
				setSelectedIndex(0);

				setTimeout(() => {
					const domSelection = window.getSelection();
					if (
						domSelection &&
						domSelection.rangeCount > 0 &&
						ref.current
					) {
						try {
							const domRange = domSelection.getRangeAt(0);
							const rect = domRange.getBoundingClientRect();

							const isAbove =
								window.innerHeight - rect.bottom <
								MENU_HEIGHT_IN_PX;
							const top = isAbove
								? `${rect.bottom + window.scrollY - MENU_HEIGHT_IN_PX - 60}px`
								: `${rect.bottom + window.scrollY + 8}px`;
							setPosition(isAbove ? "top" : "below");

							ref.current.style.top = top;
							ref.current.style.left = `${rect.left + window.scrollX - 30}px`;
						} catch (error) {
							console.warn(
								"Failed to get cursor position:",
								error,
							);
						}
					}
					setIsVisible(true);
					if (inputRef.current) {
						inputRef.current.focus();
					}
				}, 0);
			} else {
				setIsVisible(false);
				setTimeout(() => {
					setShow(false);
					setSearchValue("");
					setSelectedIndex(0);
				}, 100);
			}
		} else {
			setIsVisible(false);
			setTimeout(() => {
				setShow(false);
				setSearchValue("");
				setSelectedIndex(0);
			}, 100);
		}
	}, [editor]);

	useEffect(() => {
		const ref = itemRefs.current[selectedIndex];
		if (ref) {
			ref.scrollIntoView({
				block: "nearest",
				behavior: "smooth",
			});
		}
	}, [selectedIndex]);

	useEffect(() => {
		return mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					updateMenu();
				});
			}),
		);
	}, [editor, updateMenu]);

	useEffect(() => {
		if (show) {
			const scrollbarWidth =
				window.innerWidth - document.documentElement.clientWidth;
			document.body.style.overflow = "hidden";
			document.body.style.paddingRight = `${scrollbarWidth}px`;
		} else {
			document.body.style.overflow = "";
			document.body.style.paddingRight = "";
		}
		return () => {
			document.body.style.overflow = "";
			document.body.style.paddingRight = "";
		};
	}, [show]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (!show) return;
			if (event.key === "ArrowDown") {
				event.preventDefault();
				setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
			} else if (event.key === "ArrowUp") {
				event.preventDefault();
				setSelectedIndex(
					(prev) =>
						(prev - 1 + filteredItems.length) %
						filteredItems.length,
				);
			} else if (event.key === "Enter") {
				event.preventDefault();
				if (filteredItems[selectedIndex]) {
					handleSelect(filteredItems[selectedIndex]);
				}
			} else if (
				event.key === "Escape" ||
				(event.key === "Backspace" && searchValue.length === 0)
			) {
				event.preventDefault();
				removeFirstSlashChar();
				setIsVisible(false);
				setTimeout(() => {
					setShow(false);
					setSearchValue("");
					setSelectedIndex(0);
				}, 100);
			}
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [show, filteredItems, selectedIndex, handleSelect, searchValue]);

	return show
		? createPortal(
				<div
					ref={ref}
					className={cn(
						"absolute z-50 w-72 rounded-md bg-background text-popover-foreground shadow-lg transition-all duration-150 ease-out",
						isVisible
							? "opacity-100 scale-100 translate-y-0"
							: "opacity-0 scale-95 -translate-y-1",
					)}
				>
					<div
						className={cn(
							"flex",
							position === "top"
								? "flex-col-reverse"
								: "flex-col",
						)}
					>
						<div className="flex items-center gap-2 px-2 py-1.5 border-b border-border/50">
							<Search className="h-3 w-3 text-muted-foreground" />
							<Input
								ref={inputRef}
								type="text"
								placeholder="Search..."
								value={searchValue}
								onChange={(e) => setSearchValue(e.target.value)}
								className="h-8 border-0 bg-transparent px-0 py-0 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
								style={{ paddingLeft: "10px" }}
							/>
						</div>

						<ScrollArea
							className={`h-[300px] overscroll-contain px-3 flex flex-col justify-end`}
						>
							<div
								className={cn(
									"py-1 min-h-[300px] h-full flex flex-col",
									position === "top" && "justify-end",
								)}
							>
								{filteredItems.length === 0 ? (
									<div className="px-2 py-4 text-center text-xs text-muted-foreground">
										No commands found
									</div>
								) : (
									filteredItems.map((item, index) => (
										<div
											key={item.value}
											onClick={() => handleSelect(item)}
											id={item.id}
											ref={(el) => {
												itemRefs.current[index] = el;
											}}
											className={cn(
												"flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer transition-colors rounded-sm mb-1",
												"hover:bg-accent/50",
												index === selectedIndex &&
													"bg-accent text-accent-foreground",
											)}
										>
											<item.icon className="h-4 w-4 flex-shrink-0" />
											<span className="flex-1 truncate font-medium">
												{item.label}
											</span>
											{item.shortcut && (
												<kbd className="text-[10px] text-muted-foreground font-mono">
													{item.shortcut}
												</kbd>
											)}
										</div>
									))
								)}
							</div>
						</ScrollArea>
					</div>
				</div>,
				document.body,
			)
		: null;
}
