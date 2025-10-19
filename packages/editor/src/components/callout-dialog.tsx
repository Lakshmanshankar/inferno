import { useEffect, useState } from "react";
import { Button } from "@inferno/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@inferno/ui/components/dialog";
import { Input } from "@inferno/ui/components/input";
import { Label } from "@inferno/ui/components/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@inferno/ui/components/select";

import type { CalloutVariant } from "../nodes/callout/callout";

type EditCalloutDialogProps = {
	isOpen: boolean;
	onClose: () => void;
	currentVariant: CalloutVariant;
	currentIcon: string;
	onSave: (variant: CalloutVariant, icon: string) => void;
};

const VARIANT_OPTIONS: { value: CalloutVariant; label: string }[] = [
	{ value: "info", label: "Info" },
	{ value: "warning", label: "Warning" },
	{ value: "error", label: "Error" },
	{ value: "success", label: "Success" },
	{ value: "note", label: "Note" },
	{ value: "tip", label: "Tip" },
];

const COMMON_ICONS = [
	{ value: "💡", label: "💡 Light bulb" },
	{ value: "i", label: "i Info" },
	{ value: "!", label: "! Warning" },
	{ value: "❌", label: "❌ Error" },
	{ value: "❗", label: "❗ Exclamation" },
	{ value: "📝", label: "📝 Note" },
	{ value: "💭", label: "💭 Thought" },
	{ value: "🚨", label: "🚨 Alert" },
	{ value: "none", label: "🚫 None" },
];

export function EditCalloutDialog({
	isOpen,
	onClose,
	currentVariant,
	currentIcon,
	onSave,
}: EditCalloutDialogProps) {
	const [variant, setVariant] = useState<CalloutVariant>(currentVariant);
	const [icon, setIcon] = useState(currentIcon);

	useEffect(() => {
		if (isOpen) {
			setVariant(currentVariant);
			setIcon(currentIcon);
		}
	}, [isOpen, currentVariant, currentIcon]);

	const handleSave = () => {
		onSave(variant, icon);
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Edit Callout</DialogTitle>
				</DialogHeader>

				<div className="grid gap-4 py-4">
					{/* Variant Selector */}
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="variant" className="text-right">
							Variant
						</Label>
						<Select
							value={variant}
							onValueChange={(value: CalloutVariant) =>
								setVariant(value)
							}
						>
							<SelectTrigger className="col-span-3">
								<SelectValue placeholder="Select variant" />
							</SelectTrigger>
							<SelectContent>
								{VARIANT_OPTIONS.map((option) => (
									<SelectItem
										key={option.value}
										value={option.value}
									>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Icon Selector */}
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="icon-select" className="text-right">
							Icon
						</Label>
						<Select value={icon} onValueChange={setIcon}>
							<SelectTrigger className="col-span-3">
								<SelectValue placeholder="Select icon" />
							</SelectTrigger>
							<SelectContent>
								{COMMON_ICONS.map((option) => (
									<SelectItem
										key={option.value}
										value={option.value}
									>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Custom Icon Input */}
					<div className="grid grid-cols-4 items-center gap-4">
						<Label htmlFor="custom-icon" className="text-right">
							Custom
						</Label>
						<Input
							id="custom-icon"
							value={icon}
							onChange={(e) => setIcon(e.target.value)}
							className="col-span-3"
							placeholder="Enter custom icon or emoji"
						/>
					</div>
				</div>

				{/* Actions */}
				<div className="flex justify-end space-x-2">
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
					<Button onClick={handleSave}>Save</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
