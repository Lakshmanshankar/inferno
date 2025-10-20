import { XIcon } from "lucide-react";
import { Button } from "@inferno/ui/components/button";
import { Checkbox } from "@inferno/ui/components/checkbox";
import { Input } from "@inferno/ui/components/input";
import { Label } from "@inferno/ui/components/label";

interface TextInputWithClearProps {
	labelProps?: React.ComponentProps<typeof Label>;
	inputProps?: React.ComponentProps<typeof Input>;
	clearBtnProps?: React.ComponentProps<typeof Button>;
	value: string;
	id: string;
	onChange: (value: string) => void;
}

export const TextInput: React.FC<TextInputWithClearProps> = ({
	labelProps,
	inputProps,
	clearBtnProps,
	value,
	id,
	onChange,
}) => {
	return (
		<div>
			{labelProps?.children && (
				<Label htmlFor={id} {...labelProps}>
					{labelProps.children}
				</Label>
			)}
			<div className="relative">
				<Input
					{...inputProps}
					id={id}
					value={value}
					onChange={(e) => onChange(e.target.value)}
				/>
				{value && (
					<Button
						variant={"ghost"}
						{...clearBtnProps}
						className={`absolute right-0 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-accent/50 ${
							clearBtnProps?.className ?? ""
						}`}
						onClick={() => onChange("")}
					>
						<XIcon className="h-3.5 w-3.5" />
					</Button>
				)}
			</div>
		</div>
	);
};

interface CheckboxInputProps {
	labelProps?: React.ComponentProps<typeof Label>;
	checkboxProps?: React.ComponentProps<typeof Checkbox>;
	value: boolean;
	onChange: (value: boolean) => void;
}

export const CheckboxInput: React.FC<
	CheckboxInputProps & { defaultChecked?: boolean }
> = ({ labelProps, checkboxProps, value, onChange, defaultChecked }) => {
	return (
		<div className="flex items-center gap-2">
			<Checkbox
				{...checkboxProps}
				checked={value}
				defaultChecked={defaultChecked}
				onCheckedChange={(checked) => onChange(!!checked)}
				className={`cursor-pointer ${checkboxProps?.className ?? ""}`}
			/>
			{labelProps?.children && (
				<Label {...labelProps}>{labelProps.children}</Label>
			)}
		</div>
	);
};
