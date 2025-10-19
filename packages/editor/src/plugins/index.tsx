import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { DatesPlugin } from "./date-node-plugin";
import { MD_TRANSFORMERS } from "./markdown-plugin";
import { MentionMenuPlugin } from "./mention-menu/mention-menu-plugin.tsx";
import { AutoSaveToIDBPlugin } from "./save-to-idb-plugin";
import { SlashMenuPlugin } from "./slash-menu/slash-menu-plugin";
import { FloatMenu } from "./text/floating-toolbar";
import { TextFormattingPlugin } from "./text/text-formating-plugin";
import { TocPlugin } from "./toc-plugin.tsx";
import { useAppConfig } from "./../hooks/use-lexical-config";
import { CalloutPlugin } from "./callout-plugin";
import { CollapsiblePlugin } from "./collapsible-plugin";
import { LayoutPlugin } from "./column-layout";
import { ImagesPlugin } from "./image-node-plugin";
import EnsureLastParagraphPlugin from "./trailing-paragraph-plugin";

export function LexicalPlugins() {
	const { canUseRichText } = useAppConfig();
	return (
		<>
			<AutoSaveToIDBPlugin />
			<MarkdownShortcutPlugin transformers={MD_TRANSFORMERS} />
			<HistoryPlugin />
			<LinkPlugin />
			<ListPlugin />
			<CheckListPlugin />
			<TabIndentationPlugin />
			<AutoFocusPlugin />
			<SlashMenuPlugin />
			<ImagesPlugin />
			<MentionMenuPlugin />
			<DatesPlugin />
			<LayoutPlugin />
			<CalloutPlugin />
			<EnsureLastParagraphPlugin />
			<CollapsiblePlugin />
			<TocPlugin />
			{canUseRichText && (
				<FloatMenu>
					<TextFormattingPlugin />
				</FloatMenu>
			)}
		</>
	);
}
