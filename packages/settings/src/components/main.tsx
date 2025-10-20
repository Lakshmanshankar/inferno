import { lazy, Suspense, useMemo } from "react";
import type { TabName } from "./registry";
import { ScrollArea } from "@inferno/ui/components/scroll-area";
import { Spinner } from "@inferno/ui/components/spinner";
import { SETTINGS_REGISTRY } from "./registry";

export function SettingsMain({ activeTab }: { activeTab: TabName }) {
	const ActiveComponent = useMemo(() => {
		const entry = SETTINGS_REGISTRY.find((s) => s.name === activeTab);
		return entry ? lazy(entry.loader) : null;
	}, [activeTab]);

	if (!ActiveComponent) return null;

	return (
		<div className="overflow-y-auto w-full flex flex-col justify-center relative">
			<ScrollArea className="w-full h-[85vh] px-0 py-5">
				<div className="max-w-[500px] w-full flex justify-center items-center mx-auto">
					<Suspense
						fallback={
							<div className="flex items-center justify-center w-full h-[70vh]">
								<Spinner className="size-6 " />
							</div>
						}
					>
						<ActiveComponent />
					</Suspense>
				</div>
			</ScrollArea>
		</div>
	);
}
