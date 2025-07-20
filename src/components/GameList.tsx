import type { Game } from "../types/game";
import { useGameSession } from "../context/GameSessionContext";
import { useNavigate } from "react-router-dom";

type GameListProps = {
	games: Game[];
	category: string;
};

export default function GameList({ games, category }: GameListProps) {
	const { setSession } = useGameSession();
	const navigate = useNavigate();

	const handleSelect = (game: Game) => {
		setSession({ game, players: [] }); // tom spelare först
		navigate("/select-players");
	};

	return (
		<div className="mt-8 space-y-4">
			<h2 className="text-2xl font-semibold text-[#1E2A38]">
				Valda spel: {category}
			</h2>
			<ul className="space-y-2">
				{games.map((game) => (
					<li
						key={game.id}
						onClick={() => handleSelect(game)}
						role="button"
						tabIndex={0}
						className="text-left bg-white rounded shadow p-4 cursor-pointer"
					>
						<h3 className="font-bold text-lg">{game.name}</h3>
						<p className="text-sm text-gray-600">
							{game.description}
						</p>
					</li>
				))}
			</ul>
		</div>
	);
}
