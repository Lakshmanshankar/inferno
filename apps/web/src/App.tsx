import { Editor } from "@inferno/editor";
export const App: React.FC = () => {
	return (
		<div className="min-h-screen bg-gray-50 p-4">
			<div className="mx-auto w-fit py-8 px-4">
				<Editor />
			</div>
		</div>
	);
};
