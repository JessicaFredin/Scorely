import { useState, useEffect } from "react";
import { useGameSession } from "../../context/GameSessionContext";
import { useNavigate } from "react-router-dom";
import { generatePlumpRounds } from "../../gameLogic/plump";
import { ArrowLeft } from "lucide-react";
import PredictionPopupPlump from "../plump/PredictionPopupPlump";
import ResultPopupPlump from "../plump/ResultPopupPlump";
import WinnerPopup from "../WinnerPopup";

type RoundResult = {
	guess: number;
	result: number | null;
};

export default function PlumpTable() {
	const { session } = useGameSession();
	const navigate = useNavigate();

	const players = session?.players ?? [];
	const rounds = generatePlumpRounds(players.length);

	const [results, setResults] = useState<RoundResult[][]>(
		new Array(rounds.length)
			.fill(0)
			.map(() =>
				new Array(players.length)
					.fill(0)
					.map(() => ({ guess: 0, result: null }))
			)
	);

	const [activeRoundIndex, setActiveRoundIndex] = useState<number | null>(
		null
	);
	const [activeResultInput, setActiveResultInput] = useState<{
		roundIdx: number;
		playerIdx: number;
	} | null>(null);
	const [winnerMessage, setWinnerMessage] = useState<string | null>(null);

	const totalScore = (playerIndex: number): number =>
		results.reduce((sum, row) => {
			const { guess, result } = row[playerIndex];
			if (result === null) return sum;
			return sum + (guess === result ? 10 + guess : 0);
		}, 0);

	const handleSubmit = (guesses: number[]) => {
		if (activeRoundIndex === null) return;
		setResults((prev) =>
			prev.map((row, rowIdx) =>
				rowIdx === activeRoundIndex
					? row.map((_, i) => ({ guess: guesses[i], result: null }))
					: row
			)
		);
		setActiveRoundIndex(null);
	};

	const handleResult = (roundIdx: number, playerIdx: number) => {
		setActiveResultInput({ roundIdx, playerIdx });
	};

	const saveResult = (value: number) => {
		if (!activeResultInput) return;
		const { roundIdx, playerIdx } = activeResultInput;

		setResults((prev) =>
			prev.map((row, i) =>
				i === roundIdx
					? row.map((cell, j) =>
							j === playerIdx ? { ...cell, result: value } : cell
					  )
					: row
			)
		);
		setActiveResultInput(null);
	};

	useEffect(() => {
		const allFilled = results.every((row) =>
			row.every((cell) => cell.result !== null)
		);
		if (allFilled) {
			const scores = players.map((_, i) => totalScore(i));
			const max = Math.max(...scores);
			const winners = players
				.filter((_, i) => scores[i] === max)
				.map((p) => p.name);
			setWinnerMessage(
				winners.length > 1
					? `Oavgjort mellan ${winners.join(" och ")} (${max} poäng)`
					: `${winners[0]} har vunnit spelet! ${max} poäng.`
			);
			setTimeout(() => setWinnerMessage(null), 8000);
		}
	}, [results, players]);

	return (
		<div className="px-4 py-6">
			<button
				onClick={() => navigate(-1)}
				className="text-gray-600 hover:text-black flex items-center gap-2 mb-4"
			>
				<ArrowLeft size={24} />
				<span className="text-md font-medium">Tillbaka</span>
			</button>

			{winnerMessage && <WinnerPopup message={winnerMessage} />}

			<div className="overflow-x-auto bg-white rounded shadow">
				<div className="min-w-[600px]">
					<div className="flex border-b border-black h-14">
						<div className="w-24 font-bold px-2 border-r border-black flex items-center justify-center">
							Plump
						</div>
						{players.map((p, i) => (
							<div
								key={i}
								className="min-w-[80px] border-r border-black flex items-center justify-center font-medium"
							>
								{p.name}
							</div>
						))}
					</div>

					{rounds.map((cards, rowIdx) => (
						<div
							key={rowIdx}
							className="flex border-b border-black h-12"
						>
							<div
								className="w-24 border-r border-black flex items-center justify-center cursor-pointer hover:bg-gray-100"
								onClick={() => setActiveRoundIndex(rowIdx)}
							>
								{cards}
							</div>

							{players.map((_, colIdx) => {
								const { guess, result } =
									results[rowIdx][colIdx];
								const isSuccess =
									result !== null && guess === result;
								// const isFail =
								// 	result !== null && guess !== result;

								return (
									<div
										key={colIdx}
										onClick={() =>
											handleResult(rowIdx, colIdx)
										}
										className="min-w-[80px] border-r border-black flex items-center justify-center cursor-pointer"
									>
										{result === null ? (
											<span className="text-gray-400">
												{guess}
											</span>
										) : isSuccess ? (
											<span className="text-green-700 font-bold">
												{`1${guess}`}
											</span>
										) : (
											<div className="w-4 h-4 bg-black rounded-full" />
										)}
									</div>
								);
							})}
						</div>
					))}

					<div className="flex h-14 border-t border-black font-bold bg-gray-50">
						<div className="w-24 border-r border-black flex items-center justify-center">
							Summa
						</div>
						{players.map((_, i) => (
							<div
								key={i}
								className="min-w-[80px] border-r border-black flex items-center justify-center"
							>
								{totalScore(i)}
							</div>
						))}
					</div>
				</div>
			</div>

			{activeRoundIndex !== null && (
				<PredictionPopupPlump
					players={players.map((p) => p.name)}
					cardCount={rounds[activeRoundIndex]}
					onSubmit={handleSubmit}
					onClose={() => setActiveRoundIndex(null)}
				/>
			)}

			{activeResultInput && (
				<ResultPopupPlump
					playerName={players[activeResultInput.playerIdx].name}
					onSubmit={saveResult}
					onClose={() => setActiveResultInput(null)}
				/>
			)}
		</div>
	);
}
