import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GameSessionProvider } from "./context/GameSessionContext";
// import { registerSW } from "virtual:pwa-register";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<GameSessionProvider>
			<App />
		</GameSessionProvider>
	</StrictMode>
);

// registerSW();
