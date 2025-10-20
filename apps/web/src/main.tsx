import { App } from "./App.tsx";
import { ThemeProvider } from "@inferno/ui/hooks/theme";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { initFirebase } from "@inferno/firebase";

initFirebase();
const AppComponent = () => {
	return (
		<>
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<App />
				{/* <Toaster richColors /> */}
			</ThemeProvider>
		</>
	);
};

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<AppComponent />} />
			</Routes>
		</BrowserRouter>
	</StrictMode>,
);
