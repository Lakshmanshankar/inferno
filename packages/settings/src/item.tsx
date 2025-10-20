import { Card } from "@inferno/ui/components/card";
import { cn } from "@inferno/ui/lib/utils";

interface SettingsItemProps {
	icon: React.ReactNode;
	title: string;
	description: string | null;
	control: React.ReactNode;
	className?: string;
	alignIcon?: "start" | "center" | "end";
}

export function SettingItem({
	icon,
	title,
	description,
	control,
	className,
	alignIcon = "start",
}: SettingsItemProps) {
	return (
		<Card
			className={cn(
				"p-4 my-5 sm:mx-0 flex flex-row items-center",
				className,
			)}
		>
			<div className={`flex items-${alignIcon} space-x-3 flex-1`}>
				<div className="mt-0.5 text-muted-foreground">{icon}</div>
				<div className="space-y-1 flex-1">
					<p className="text-sm font-medium leading-none">{title}</p>
					{description && (
						<p className="text-xs text-muted-foreground">
							{description}
						</p>
					)}
				</div>
			</div>
			<div className="flex-shrink-0">{control}</div>
		</Card>
	);
}
