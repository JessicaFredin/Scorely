import "./App.css";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import GameList from "./pages/SelectGame";
import GamePage from "./pages/GamePage";
import NotFound from "./pages/NotFound";
import SelectPlayers from "./pages/SelectPlayers";
import SavedProtocols from "./pages/SavedProtocols";
import ResumeProtocol from "./pages/ResumeProtocol";
import ScorecardPage from "./pages/ScorecardPage";

import CreateCustomProtocol from "./pages/CreateCustomProtocol";
import CustomProtocols from "./pages/CustomProtocols";
import CustomProtocolPlayers from "./pages/CustomProtocolPlayers";
import PlayCustomProtocol from "./pages/PlayCustomProtocol";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />

				<Route path="/games" element={<GameList />} />

				<Route path="/game/:id" element={<GamePage />} />

				<Route path="/select-players" element={<SelectPlayers />} />

				<Route path="/game" element={<GamePage />} />

				<Route path="/saved-protocols" element={<SavedProtocols />} />

				<Route
					path="/resume-protocol/:id"
					element={<ResumeProtocol />}
				/>

				<Route path="/game/chicago" element={<ScorecardPage />} />

				<Route path="/game/500" element={<ScorecardPage />} />

				<Route path="/game/plump" element={<ScorecardPage />} />

				<Route path="/game/jazz" element={<ScorecardPage />} />

				<Route path="/game/trebeller" element={<ScorecardPage />} />

				<Route path="/game/discgolf" element={<ScorecardPage />} />

				<Route path="/game/golf" element={<ScorecardPage />} />

				<Route path="/game/yatzy" element={<ScorecardPage />} />

				<Route path="/game/10000" element={<ScorecardPage />} />

				<Route path="/game/maxi-yatzy" element={<ScorecardPage />} />

				<Route path="/game/gigant-yatzy" element={<ScorecardPage />} />

				<Route path="/game/4-manswhist" element={<ScorecardPage />} />

				<Route path="/game/2-manswhist" element={<ScorecardPage />} />

				<Route path="/game/30" element={<ScorecardPage />} />

				<Route path="/custom-protocols" element={<CustomProtocols />} />

				<Route
					path="/create-custom-protocol"
					element={<CreateCustomProtocol />}
				/>

				<Route
					path="/custom-protocol/:id/players"
					element={<CustomProtocolPlayers />}
				/>

				<Route
					path="/custom-match/:matchId"
					element={<PlayCustomProtocol />}
				/>

				<Route
					path="/custom-protocol/:id/edit"
					element={<CreateCustomProtocol />}
				/>

				<Route path="*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
