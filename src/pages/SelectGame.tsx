import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { games } from "../data/games";
import type { Game } from "../types/game";
import Button from "../components/Button";

export default function SelectGame() {
	const { gameId } = useParams();
	const navigate = useNavigate();
	const game = games.find((g) => g.id === gameId) as Game | undefined;

	const [playerCount, setPlayerCount] = useState<number | null>(null);
	const [playerNames, setPlayerNames] = useState<string[]>([]);

	if (!game) {
		return (
			<div className="text-center py-20 text-xl font-semibold text-red-600">
				Spelet hittades inte.
			</div>
		);
	}

	const handleCountSubmit = () => {
		if (playerCount !== null) {
			setPlayerNames(Array(playerCount).fill(""));
		}
	};

	const handleNameChange = (index: number, name: string) => {
		const updated = [...playerNames];
		updated[index] = name;
		setPlayerNames(updated);
	};

	const handleStart = () => {
		console.log("Starta spel med:", playerNames);
		navigate("/play"); // ev. nästa steg
	};

	return (
		<div className="max-w-xl mx-auto px-4 py-16 text-center">
			<h1 className="text-3xl sm:text-4xl font-bold text-[#1E2A38] mb-4">
				{game.name}
			</h1>
			<p className="text-gray-600 mb-8">{game.description}</p>

			{/* Steg 1: välj antal spelare */}
			{playerNames.length === 0 ? (
				<div className="space-y-4">
					<p className="text-lg font-medium">Hur många spelare?</p>
					<select
						className="border p-2 rounded w-full max-w-sm mx-auto"
						onChange={(e) => setPlayerCount(Number(e.target.value))}
						defaultValue=""
					>
						<option disabled value="">
							Välj antal spelare
						</option>
						{Array.from(
							{ length: game.maxPlayers - game.minPlayers + 1 },
							(_, i) => game.minPlayers + i
						).map((n) => (
							<option key={n} value={n}>
								{n}
							</option>
						))}
					</select>

					<Button
						text="Fortsätt"
						color="primary"
						onClick={handleCountSubmit}
					/>
				</div>
			) : (
				// Steg 2: skriv namn
				<div className="space-y-4">
					<p className="text-lg font-medium mb-4">
						Skriv in spelarnas namn:
					</p>
					{playerNames.map((name, i) => (
						<input
							key={i}
							type="text"
							className="w-full border p-2 rounded"
							placeholder={`Spelare ${i + 1}`}
							value={name}
							onChange={(e) =>
								handleNameChange(i, e.target.value)
							}
						/>
					))}

					<Button
						text="Starta spelet"
						color="secondary"
						onClick={handleStart}
					/>
				</div>
			)}
		</div>
	);
}
