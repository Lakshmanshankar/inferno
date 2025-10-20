import { cn } from "@inferno/ui/lib/utils";
import * as SeparatorPrimitive from "@radix-ui/react-separator";

type SeparatorVariant = "default" | "vertical-alt";

function Separator({
	className,
	orientation = "horizontal",
	decorative = true,
	variant = "default",
	...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root> & {
	variant?: SeparatorVariant;
}) {
	return (
		<SeparatorPrimitive.Root
			data-slot="separator"
			decorative={decorative}
			orientation={orientation}
			className={cn(
				"bg-input shrink-0 space-y-3",
				orientation === "horizontal" && "h-px w-full",
				orientation === "vertical" && "h-full w-px",
				orientation === "vertical" && variant === "vertical-alt" && "bg-muted", // custom vertical variant
				className,
			)}
			{...props}
		/>
	);
}

export { Separator };
