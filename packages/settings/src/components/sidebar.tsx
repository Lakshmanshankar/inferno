import { Menu, Search } from "lucide-react";
import { useState } from "react";
import type { TabName } from "./registry";
import { Button } from "@inferno/ui/components/button";
import { Input } from "@inferno/ui/components/input";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@inferno/ui/components/sheet";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@inferno/ui/components/sidebar";
import { cn } from "@inferno/ui/lib/utils";
import { SETTINGS_REGISTRY } from "./registry";

function SettingsSidebarContent({
	searchQuery,
	onSearch,
	activeTab,
	setTab,
	onItemClick,
}: {
	searchQuery: string;
	onSearch: (q: string) => void;
	activeTab: TabName;
	setTab: (t: TabName) => void;
	onItemClick?: () => void;
}) {
	const filtered = SETTINGS_REGISTRY.filter((s) =>
		s.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	return (
		<SidebarContent className="p-2 bg-secondary/40">
			<SidebarGroup className="px-2">
				<SidebarGroupContent>
					<SidebarMenu className="px-0">
						<SidebarMenuItem className="flex px-0 justify-center my-0!">
							<div className="my-2">
								<div className="relative w-[200px]">
									<Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
									<Input
										placeholder="Search settings"
										value={searchQuery}
										onChange={(e) =>
											onSearch(e.target.value)
										}
										className="pl-7 h-8 text-sm bg-muted/50"
									/>
								</div>
							</div>
						</SidebarMenuItem>
						{filtered.map((item) => (
							<SidebarMenuItem
								key={item.name}
								className="px-0 min-w-[200px]"
							>
								<SidebarMenuButton
									asChild
									isActive={item.name === activeTab}
									className={cn(
										"w-full justify-start gap-2 py-2 my-0 min-h-fit text-sm",
										item.name === activeTab &&
											"bg-accent text-primary!",
									)}
								>
									<button
										type="button"
										onClick={() => {
											setTab(item.name);
											onItemClick?.();
										}}
									>
										<item.icon className="h-3 w-3" />
										<span>{item.name}</span>
									</button>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		</SidebarContent>
	);
}

function SettingsSidebarLayout({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<Sidebar
			collapsible="none"
			className={cn("border-r border-accent h-full", className)}
		>
			{children}
		</Sidebar>
	);
}

export function SettingsSidebar({
	searchQuery,
	onSearch,
	activeTab,
	setTab,
}: {
	searchQuery: string;
	onSearch: (q: string) => void;
	activeTab: TabName;
	setTab: (t: TabName) => void;
}) {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						className="md:hidden bg-background fixed top-3 left-5  z-40 h-9 w-9"
					>
						<Menu className="h-4 w-4" />
						<span className="sr-only">Toggle settings menu</span>
					</Button>
				</SheetTrigger>
				<SheetContent side="left" className="w-[280px] p-0">
					<SheetHeader className="p-2 border-b border-accent">
						<SheetTitle>Settings</SheetTitle>
					</SheetHeader>
					<div className="h-[calc(100%-73px)]">
						<SettingsSidebarLayout className="border-0">
							<SettingsSidebarContent
								searchQuery={searchQuery}
								onSearch={onSearch}
								activeTab={activeTab}
								setTab={setTab}
								onItemClick={() => setOpen(false)}
							/>
						</SettingsSidebarLayout>
					</div>
				</SheetContent>
			</Sheet>

			{/* Desktop Sidebar - visible on medium screens and up */}
			<SettingsSidebarLayout className="hidden md:flex">
				<SettingsSidebarContent
					searchQuery={searchQuery}
					onSearch={onSearch}
					activeTab={activeTab}
					setTab={setTab}
				/>
			</SettingsSidebarLayout>
		</>
	);
}
