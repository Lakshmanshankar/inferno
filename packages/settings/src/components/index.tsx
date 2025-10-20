import { LucideSettings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSettingsStore } from "./settings-store";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@inferno/ui/components/dialog";
import { SidebarProvider } from "@inferno/ui/components/sidebar";
import { SettingsMain } from "./main";
import { SETTINGS_REGISTRY } from "./registry";
import { SettingsSidebar } from "./sidebar";

export function Settings() {
	const [searchParams] = useSearchParams();
	const [searchQuery, setSearchQuery] = useState("");
	const { open, activeTab, setTab, close, syncFromParams, openTab } =
		useSettingsStore();

	useEffect(() => {
		syncFromParams(searchParams);
	}, [searchParams, syncFromParams]);

	const handleSearchQuery = (query: string) => {
		setSearchQuery(query);
		const first = SETTINGS_REGISTRY.filter((setting) =>
			setting.name.toLowerCase().includes(query.toLowerCase()),
		)?.[0];
		if (first) setTab(first.name);
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(isOpen) => {
				isOpen ? openTab("Appearance") : close();
			}}
		>
			<DialogTrigger>
				<LucideSettings2 />
			</DialogTrigger>
			<DialogContent className="border-secondary md:min-w-[60vw] h-[85vh] max-h-[85vh] max-w-[90vw] p-0 overflow-hidden">
				<DialogTitle className="sr-only">Settings</DialogTitle>
				<DialogDescription className="sr-only">
					Application settings
				</DialogDescription>
				<SidebarProvider className="items-start h-[85vh] border-none">
					<SettingsSidebar
						searchQuery={searchQuery}
						onSearch={handleSearchQuery}
						activeTab={activeTab}
						setTab={setTab}
					/>
					<SettingsMain activeTab={activeTab} />
				</SidebarProvider>
			</DialogContent>
		</Dialog>
	);
}
