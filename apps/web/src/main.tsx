import { App } from "./App.tsx";
import { ThemeProvider } from "@inferno/ui/hooks/theme";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { initFirebase } from "@inferno/firebase";

initFirebase();
import { AuthProvider } from "@inferno/firebase/auth";

const AppComponent = () => {
	return (
		<>
			<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
				<AuthProvider>
					<App />
				</AuthProvider>
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
