import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";

export function LexicalPlugins() {
	return (
		<>
			<MarkdownShortcutPlugin transformers={[]} />
			<HistoryPlugin />
			<LinkPlugin />
			<ListPlugin />
			<CheckListPlugin />
			<TabIndentationPlugin />
			<AutoFocusPlugin />
		</>
	);
}
