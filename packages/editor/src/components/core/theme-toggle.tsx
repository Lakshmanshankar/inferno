"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@inferno/ui/components/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@inferno/ui/components/tooltip";
import { type Theme, useTheme } from "@inferno/ui/hooks/theme";

export function ModeToggle() {
	const { setTheme, theme } = useTheme();

	const themes = [
		{ id: "light", icon: Sun, label: "Light" },
		{ id: "dark", icon: Moon, label: "Dark" },
		// { id: "system", icon: Monitor, label: "System" },
	];

	const currentTheme = themes.find((t) => t.id === theme) || themes[0];
	const CurrentIcon = currentTheme.icon;

	const cycleTheme = () => {
		const currentIndex = themes.findIndex((t) => t.id === theme);
		const nextIndex = (currentIndex + 1) % themes.length;
		setTheme(themes[nextIndex].id as Theme);
	};

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						onClick={cycleTheme}
						className="relative h-8 w-8 rounded-md bg-accent hover:bg-accent hover:text-accent-foreground"
						aria-label={`Current theme: ${currentTheme.label}. Click to cycle themes`}
					>
						<CurrentIcon className="h-4 w-4 transition-all duration-300 ease-out" />
					</Button>
				</TooltipTrigger>
				<TooltipContent side="bottom">
					<p className="text-sm">{currentTheme.label}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
