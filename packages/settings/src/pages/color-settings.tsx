import { PaintBucket } from "lucide-react";
import { useEffect, useState } from "react";
import { SettingItem } from "./../item";
import {
	SettingsLayout,
	SettingsLayoutContent,
	SettingsLayoutHeader,
} from "./../settings-layout";
import { Button } from "@inferno/ui/components/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@inferno/ui/components/select";
import { useTheme } from "@inferno/ui/hooks/theme";
import { useColorStore } from "./../../../hooks/use-color-store";

type TabType = "light" | "dark";
type ColorType = "text" | "bg";

interface ColorPickerButtonProps {
	currentColor: string;
	onColorChange: (color: string) => void;
}

function ColorPickerButton({
	currentColor,
	onColorChange,
}: ColorPickerButtonProps) {
	return (
		<div className="relative">
			<input
				type="color"
				value={currentColor}
				onChange={(e) => onColorChange(e.target.value)}
				className="absolute inset-0 w-7 h-7 opacity-0 cursor-pointer"
			/>
			<Button
				variant="outline"
				size="sm"
				className="w-7 h-7 p-0 rounded-full border-2 border-accent bg-transparent pointer-events-none"
				style={{
					backgroundColor: currentColor,
				}}
			/>
		</div>
	);
}

export default function ColorSetting() {
	const { colors, updateColor, updateDarkColor, getColor } = useColorStore();
	const [activeTab, setActiveTab] = useState<TabType>("light");
	const theme = useTheme();

	useEffect(() => {
		setActiveTab(theme.theme as TabType);
	}, [theme.theme]);

	const colorNames: string[] = Array.from(
		new Set(colors.map((item) => item.id)),
	);

	const handleColorChange = (
		id: string,
		name: string,
		type: ColorType,
		newColor: string,
	): void => {
		if (activeTab === "light") {
			updateColor(id, type, newColor);
		} else {
			updateDarkColor(name, type, newColor);
		}
	};

	const getCurrentColor = (name: string, type: ColorType): string => {
		return (
			getColor(name, type, activeTab === "dark") ||
			(type === "text" ? "#000000" : "#ffffff")
		);
	};

	const getColorName = (name: string): string => {
		if (name === "primary" || name === "secondary" || name === "brand") {
			return name.charAt(0).toUpperCase() + name.slice(1);
		}
		return `Color ${name.replace("color", "")}`;
	};

	const handleThemeChange = (value: string) => {
		setActiveTab(value as TabType);
	};

	return (
		<SettingsLayout>
			<SettingsLayoutHeader icon={PaintBucket} name="Color Editor" />
			<SettingsLayoutContent>
				<div className="space-y-2">
					<SettingItem
						icon={<PaintBucket className="h-4 w-4" />}
						title="Theme Mode"
						description={`Currently editing ${activeTab === "light" ? "Light" : "Dark"} theme colors`}
						control={
							<Select
								value={activeTab}
								onValueChange={handleThemeChange}
							>
								<SelectTrigger className="w-[100px]">
									<SelectValue placeholder="Theme" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="light">Light</SelectItem>
									<SelectItem value="dark">Dark</SelectItem>
								</SelectContent>
							</Select>
						}
					/>

					<div className="space-y-1 pt-4">
						{colorNames.map((colorKey) => {
							const textColor = colors?.find(
								(el) => el.id === colorKey,
							);
							if (!textColor) return null;

							return (
								<div
									key={colorKey}
									className="flex items-center justify-between py-2.5 px-3 hover:bg-accent/50 rounded-lg transition-colors"
								>
									{/* Icon and Name */}
									<div className="flex items-center gap-3 flex-1">
										<div
											className="w-6 h-6 rounded border-2 border-secondary flex-shrink-0"
											style={{
												background: `linear-gradient(135deg, ${getCurrentColor(colorKey, "text")} 50%, ${getCurrentColor(colorKey, "bg")} 50%)`,
											}}
										/>
										<span className="text-sm font-medium">
											{getColorName(textColor.name)}
										</span>
									</div>

									{/* Color Pickers */}
									<div className="flex items-center gap-2">
										<ColorPickerButton
											currentColor={getCurrentColor(
												colorKey,
												"text",
											)}
											onColorChange={(color) =>
												handleColorChange(
													colorKey,
													textColor.name,
													"text",
													color,
												)
											}
										/>
										<ColorPickerButton
											currentColor={getCurrentColor(
												colorKey,
												"bg",
											)}
											onColorChange={(color) =>
												handleColorChange(
													colorKey,
													textColor.name,
													"bg",
													color,
												)
											}
										/>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</SettingsLayoutContent>
		</SettingsLayout>
	);
}
