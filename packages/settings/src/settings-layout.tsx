import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Lead } from "@inferno/ui/components/typography";

interface SettingsLayoutHeaderProps {
	name?: string;
	icon: LucideIcon;
}

export function SettingsLayoutHeader({
	icon: Icon,
	name,
}: SettingsLayoutHeaderProps) {
	return (
		<div className="fixed z-10 w-full max-w-[300px] md:max-w-[500px] top-2 bg-background border-b border-accent py-3 px-4 md:px-6">
			<div className="ml-12 md:ml-0 flex items-center gap-2">
				<Icon className="h-5 w-5 text-muted-foreground" />
				<Lead>{name}</Lead>
			</div>
		</div>
	);
}

interface SettingsLayoutContentProps {
	children: ReactNode;
	className?: string;
}

export function SettingsLayoutContent({
	children,
	className,
}: SettingsLayoutContentProps) {
	return (
		<div className="flex-1 overflow-y-auto mt-5">
			<div
				className={className || "container max-w-4xl px-4 md:px-6 py-4"}
			>
				{children}
			</div>
		</div>
	);
}

interface SettingsLayoutProps {
	children: ReactNode;
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
	return <div className="flex flex-col h-full w-full mt-0">{children}</div>;
}
