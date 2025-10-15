import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { theme } from "./theme";
import { LexicalNodes } from "./nodes";
import { LexicalPlugins } from "./plugins";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function onError(error: any) {
	console.error(error);
}

export function Editor() {
	const initialConfig = {
		namespace: "Jingle",
		theme,
		onError,
		nodes: LexicalNodes,
	};

	return (
		<div className="my-10 mt-20 z-0">
			<LexicalComposer initialConfig={initialConfig}>
				<div className="editor-container">
					<RichTextPlugin
						contentEditable={
							<ContentEditable
								className="editor-block border-none"
								spellCheck={false}
								aria-placeholder="Type something"
								placeholder={<div className="editor-placeholder">Start typing...</div>}
							/>
						}
						ErrorBoundary={LexicalErrorBoundary}
					/>
				</div>
				<LexicalPlugins />
			</LexicalComposer>
		</div>
	);
}
