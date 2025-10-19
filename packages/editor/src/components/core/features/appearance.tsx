import { Palette, SaveIcon, Settings2, Type } from "lucide-react";
import { useEffect } from "react";
import { SettingItem } from "./../item";
import {
	SettingsLayout,
	SettingsLayoutContent,
	SettingsLayoutHeader,
} from "./../settings-layout";
import { ModeToggle } from "./../theme-toggle";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@inferno/ui/components/select";
import { Separator } from "@inferno/ui/components/separator";
import { Switch } from "@inferno/ui/components/switch";
import { useAppConfig } from "./../../../hooks/use-lexical-config";

export default function Appearance() {
	const {
		setCanUseRichText,
		canUseRichText,
		enableAutoSave,
		setEnableAutoSave,
		fontFamily,
		setFontFamily,
	} = useAppConfig();

	useEffect(() => {
		const fontMap = {
			system: 'ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI Variable Display", "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol"',
			geist: '"Geist", sans-serif',
			monkey: '"Happy Monkey", system-ui',
		};

		document.documentElement.style.setProperty(
			"--font-family",
			fontMap[fontFamily],
		);
	}, [fontFamily]);
	return (
		<SettingsLayout>
			<SettingsLayoutHeader icon={Settings2} name="Settings" />
			<SettingsLayoutContent>
				<SettingItem
					icon={<Palette className="h-4 w-4" />}
					title="Font Family"
					description="Choose your preferred font"
					control={
						<Select
							value={fontFamily}
							onValueChange={(value) =>
								setFontFamily(
									value as "system" | "geist" | "monkey",
								)
							}
						>
							<SelectTrigger className="w-[130px]">
								<SelectValue placeholder="Select font" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="system">System</SelectItem>
								<SelectItem value="geist">Geist</SelectItem>
								<SelectItem value="monkey">
									Happy Monkey
								</SelectItem>
							</SelectContent>
						</Select>
					}
				/>

				<SettingItem
					icon={<Palette className="h-4 w-4" />}
					title="Theme"
					description="Choose your preferred color theme"
					control={<ModeToggle />}
				/>
				<Separator />

				<SettingItem
					icon={<Type className="h-4 w-4" />}
					title="Rich Text Mode"
					description="Enable rich text formatting and styling options"
					control={
						<Switch
							checked={canUseRichText}
							onCheckedChange={(value) =>
								setCanUseRichText(value)
							}
							aria-label="Toggle rich text mode"
						/>
					}
				/>
				<SettingItem
					icon={<SaveIcon className="h-4 w-4" />}
					title={"Enable Auto Save"}
					description="Auto save (saved every 15 seconds)"
					control={
						<Switch
							checked={enableAutoSave}
							onCheckedChange={(value) =>
								setEnableAutoSave(value)
							}
							aria-label="Toggle Auto save to idb"
						/>
					}
				/>

				<Separator />
			</SettingsLayoutContent>
		</SettingsLayout>
	);
}
