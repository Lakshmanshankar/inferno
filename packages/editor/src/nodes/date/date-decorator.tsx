import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey, type NodeKey } from "lexical";
import { type JSX, useEffect, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@inferno/ui/components/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@inferno/ui/components/popover";
import { Small } from "@inferno/ui/components/typography";
import { DateNode } from "./date-node";

export function DateDecorator({
	date,
	nodeKey,
}: { date: string; nodeKey: NodeKey }): JSX.Element {
	const [editor] = useLexicalComposerContext();

	// Support single date or range
	const parseDateValue = (): Date | DateRange | undefined => {
		try {
			if (!date) return undefined;
			const parsed = JSON.parse(date);
			if (parsed?.from && parsed?.to) {
				return {
					from: new Date(parsed.from),
					to: parsed.to ? new Date(parsed.to) : undefined,
				};
			}
			return new Date(date);
		} catch {
			return new Date(date);
		}
	};

	const [selectedDate, setSelectedDate] = useState<
		Date | DateRange | undefined
	>(parseDateValue);
	const dateRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		editor.update(() => {
			const node = $getNodeByKey(nodeKey);
			if (node && node instanceof DateNode) {
				if (!selectedDate) {
					node.updateDateProperties({ date: "" });
				} else if (selectedDate instanceof Date) {
					node.updateDateProperties({
						date: selectedDate.toISOString(),
					});
				} else {
					node.updateDateProperties({
						date: JSON.stringify({
							from: selectedDate.from?.toISOString(),
							to: selectedDate.to?.toISOString(),
						}),
					});
				}
			}
		});
	}, [selectedDate, editor, nodeKey]);

	const formatDateDisplay = () => {
		if (!selectedDate) return "No date selected";

		if (selectedDate instanceof Date) {
			return selectedDate.toLocaleDateString();
		}

		if (selectedDate.from && selectedDate.to) {
			// ✅ if both dates are the same, show only one
			if (
				selectedDate.from.toDateString() ===
				selectedDate.to.toDateString()
			) {
				return selectedDate.from.toLocaleDateString();
			}
			return `${selectedDate.from.toLocaleDateString()} - ${selectedDate.to.toLocaleDateString()}`;
		}

		if (selectedDate.from) {
			return selectedDate.from.toLocaleDateString();
		}

		return "No date selected";
	};

	return (
		<div ref={dateRef} className="inline-flex items-center gap-2">
			<Popover>
				<PopoverTrigger>
					<Small className="hover:cursor-pointer text-muted-foreground bg-accent p-1 rounded-sm">
						{formatDateDisplay()}
					</Small>
				</PopoverTrigger>
				<PopoverContent className="p-2">
					<Calendar
						mode="range"
						selected={selectedDate as DateRange}
						onSelect={setSelectedDate}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
}
