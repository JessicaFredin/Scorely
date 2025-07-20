import { useState, useEffect, useMemo } from "react";
import { useGameSession } from "../../context/GameSessionContext";
import { useNavigate } from "react-router-dom";
import { jazzRounds } from "../../gameLogic/jazz";
import { ArrowLeft } from "lucide-react";
import ScorePopupJazz from "../jazz/ScorePopupJazz";
import WinnerPopup from "../WinnerPopup";

export default function JazzTable() {
	const { session } = useGameSession();
	const navigate = useNavigate();
	// const players = session?.players ?? [];
	const players = useMemo(() => session?.players ?? [], [session?.players]);
	const [winnerMessage, setWinnerMessage] = useState<string | null>(null);

	const [results, setResults] = useState<number[][]>(
		Array(jazzRounds.length)
			.fill(null)
			.map(() => Array(players.length).fill(0))
	);

	const [activeRoundIndex, setActiveRoundIndex] = useState<number | null>(
		null
	);

	const calculateTotal = (col: number) =>
		results.reduce((sum, row) => sum + row[col], 0);

	const handleSubmit = (values: number[]) => {
		if (activeRoundIndex === null) return;
		setResults((prev) =>
			prev.map((row, rowIdx) =>
				rowIdx === activeRoundIndex ? values : row
			)
		);
		setActiveRoundIndex(null);
	};

	useEffect(() => {
		const allFilled = results.every((row) =>
			row.every((cell) => typeof cell === "number")
		);
		const allRoundsHaveScores = results.every((row) =>
			row.some((cell) => cell !== 0)
		);

		if (!allFilled || !allRoundsHaveScores) return;

		const totals = players.map((_, idx) =>
			results.reduce((sum, row) => sum + row[idx], 0)
		);

		const maxScore = Math.max(...totals);
		const winners = players.filter((_, idx) => totals[idx] === maxScore);

		if (winners.length === 1) {
			setWinnerMessage(
				`${winners[0].name} har vunnit spelet! (${maxScore} poäng)`
			);
		} else {
			setWinnerMessage(
				`Oavgjort mellan ${winners
					.map((p) => p.name)
					.join(" & ")}! (${maxScore} poäng)`
			);
		}

		const timeout = setTimeout(() => setWinnerMessage(null), 5000);
		return () => clearTimeout(timeout);
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
						<div className="w-32 font-bold px-2 border-r border-black flex items-center justify-center">
							Jazz
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

					{jazzRounds.map((round, rowIdx) => (
						<div
							key={rowIdx}
							className="flex border-b border-black h-12"
						>
							<div
								className="w-32 border-r border-black flex items-center justify-center cursor-pointer hover:bg-gray-100 text-sm text-center"
								onClick={() => setActiveRoundIndex(rowIdx)}
							>
								{round.label}
							</div>
							{players.map((_, colIdx) => (
								<div
									key={colIdx}
									className="min-w-[80px] border-r border-black flex items-center justify-center"
								>
									{results[rowIdx][colIdx] !== 0 ? (
										<span
											className={
												results[rowIdx][colIdx] < 0
													? "text-red-600"
													: "text-green-600"
											}
										>
											{results[rowIdx][colIdx]}
										</span>
									) : (
										<span className="text-gray-400">0</span>
									)}

									{/* <span
										className={
											results[rowIdx][colIdx] < 0
												? "text-red-600"
												: results[rowIdx][colIdx] > 0
												? "text-green-600"
												: "text-gray-400"
										}
									>
										{results[rowIdx][colIdx]}
                                    </span> */}
								</div>
							))}
						</div>
					))}

					<div className="flex h-14 border-t border-black font-bold bg-gray-50">
						<div className="w-32 border-r border-black flex items-center justify-center">
							Summa
						</div>
						{players.map((_, i) => (
							<div
								key={i}
								className="min-w-[80px] border-r border-black flex items-center justify-center"
							>
								{calculateTotal(i)}
							</div>
						))}
					</div>
				</div>
			</div>

			{activeRoundIndex !== null && (
				<ScorePopupJazz
					round={jazzRounds[activeRoundIndex]}
					players={players.map((p) => p.name)}
					onSubmit={handleSubmit}
					onClose={() => setActiveRoundIndex(null)}
				/>
			)}
		</div>
	);
}
