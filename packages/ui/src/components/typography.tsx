import type { ReactNode } from "react";
import { cn } from "@inferno/ui/lib/utils";

export function Lead({ children }: { children: ReactNode }) {
	return <p className="text-foreground text-base ">{children}</p>;
}

export function Large({ children }: { children: ReactNode }) {
	return <div className="text-lg font-semibold">{children}</div>;
}

export function Small({
	children,
	className,
}: { children: ReactNode; className?: string }) {
	return (
		<small
			className={cn(
				"text-tiny text-secondary-foreground leading-none font-medium my-0 mb-0",
				className,
			)}
		>
			{children}
		</small>
	);
}

export function Muted({ children }: { children: ReactNode }) {
	return <p className="text-muted-foreground text-sm">{children}</p>;
}
