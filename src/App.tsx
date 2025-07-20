import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import GameList from "./pages/SelectGame";
import GamePage from "./pages/GamePage";
import NotFound from "./pages/NotFound";
import SelectPlayers from "./pages/SelectPlayers";
import ChicagoTable from "./components/tables/ChicagoTable";
import FivehundredTable from "./components/tables/500Table";
import PlumpTable from "./components/tables/PlumpTable";
import JazzTable from "./components/tables/JazzTable";
import TrebellerTable from "./components/tables/TrebellerTable";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/games" element={<GameList />} />
				<Route path="/game/:id" element={<GamePage />} />
				<Route path="/select-players" element={<SelectPlayers />} />
				<Route path="/game" element={<GamePage />} />
				<Route path="/game/chicago" element={<ChicagoTable />} />
				<Route path="/game/500" element={<FivehundredTable />} />
				<Route path="/game/plump" element={<PlumpTable />} />
				<Route path="/game/jazz" element={<JazzTable />} />
				<Route path="/game/trebeller" element={<TrebellerTable />} />
				<Route path="*" element={<NotFound />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
