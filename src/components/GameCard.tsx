// import { type Game } from "../types/game";
// import { Link } from "react-router-dom";

// interface GameCardProps {
// 	game: Game;
// }

// const GameCard = ({ game }: GameCardProps) => {
// 	return (
// 		<div className="bg-white rounded-2xl shadow p-4 border hover:shadow-md transition">
// 			<div className="flex justify-between items-start">
// 				<div>
// 					<h2 className="text-xl font-bold text-gray-800">
// 						{game.name}
// 					</h2>
// 					<p className="text-sm text-gray-500 capitalize">
// 						{game.category}
// 					</p>
// 				</div>
// 				<span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">
// 					{game.minPlayers}-{game.maxPlayers} spelare
// 				</span>
// 			</div>

// 			<p className="text-gray-700 mt-2 text-sm">{game.description}</p>

// 			<Link
// 				to={`/game/${game.id}`}
// 				className="mt-4 inline-block bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700"
// 			>
// 				Starta protokoll
// 			</Link>
// 		</div>
// 	);
// };

// export default GameCard;
