import { useState, useEffect } from "react";
import { useGameSession } from "../../context/GameSessionContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ScorePopup500 from "../500/ScorePopup500";
import WinnerPopup from "../WinnerPopup";

type Round = { value: number; crossed?: boolean };

export default function Table500() {
	const { session } = useGameSession();
	const players = session?.players ?? [];
	const navigate = useNavigate();

	const [winnerMessage, setWinnerMessage] = useState<string | null>(null);
	const [scores, setScores] = useState<Round[][]>(
		new Array(players.length).fill(0).map(() => [])
	);
	const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<
		number | null
	>(null);

	useEffect(() => {
		scores.forEach((rounds, i) => {
			const total = rounds
				.filter((r) => !r.crossed)
				.reduce((sum, r) => sum + r.value, 0);
			if (total >= 500) {
				setWinnerMessage(
					`${players[i].name} har vunnit spelet! (${total} poäng)`
				);
				setTimeout(() => setWinnerMessage(null), 5000);
			}
		});
	}, [scores, players]);

	const handleNewScore = (score: number) => {
		if (selectedPlayerIndex === null) return;

		setScores((prev) =>
			prev.map((rounds, i) => {
				if (i !== selectedPlayerIndex) return rounds;

				const prevTotal = rounds
					.filter((r) => !r.crossed)
					.reduce((sum, r) => sum + r.value, 0);

				const newRounds = rounds.map((r) => ({ ...r, crossed: true }));

				return [
					...newRounds,
					{ value: prevTotal + score, crossed: false },
				];
			})
		);

		setSelectedPlayerIndex(null);
	};

	return (
		<div className="w-full px-4 py-6">
			<div className="mb-4">
				<button
					onClick={() => navigate(-1)}
					className="text-gray-600 hover:text-black flex items-center gap-2"
				>
					<ArrowLeft size={24} />
					<span className="text-md font-medium">Tillbaka</span>
				</button>
				{winnerMessage && <WinnerPopup message={winnerMessage} />}
			</div>

			<div className="bg-white rounded-md shadow-md overflow-x-auto">
				<div className="min-w-[600px]">
					<div className="flex border-b border-black h-14">
						<div className="w-24 font-bold px-2 border-r border-black flex items-center justify-center">
							500
						</div>
						{players.map((player, i) => (
							<div
								key={i}
								className="min-w-[80px] text-center font-medium px-2 border-r border-black flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100"
								onClick={() => setSelectedPlayerIndex(i)}
							>
								<div>{player.name}</div>
							</div>
						))}
					</div>

					{Array.from({ length: 30 }).map((_, rowIdx) => (
						<div key={rowIdx} className="flex h-10">
							<div className="w-24 border-r border-black" />
							{players.map((_, colIdx) => {
								const round = scores[colIdx][rowIdx];
								return (
									<div
										key={colIdx}
										className="min-w-[80px] border-r border-black flex items-center justify-center"
									>
										{round && (
											<span
												className={`text-sm ${
													round.crossed
														? "line-through text-gray-400"
														: "font-bold"
												}`}
											>
												{round.value}
											</span>
										)}
									</div>
								);
							})}
						</div>
					))}
				</div>
			</div>

			{selectedPlayerIndex !== null && (
				<ScorePopup500
					playerName={players[selectedPlayerIndex].name}
					onSubmit={handleNewScore}
					onClose={() => setSelectedPlayerIndex(null)}
				/>
			)}
		</div>
	);
}
