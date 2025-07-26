import { useState } from "react";
import { useGameSession } from "../../context/GameSessionContext";
import { useNavigate } from "react-router-dom";
import { trebellerCategories } from "../../gameLogic/trebeller";
import { createInitialTrebellerRounds } from "../../gameLogic/trebeller";
import type {
	TrebellerCategory,
	TrebellerRound,
} from "../../gameLogic/trebeller";

import { ArrowLeft } from "lucide-react";
import ScorePopupTrebeller from "../trebeller/ScorePopupTrebeller";
import WinnerPopup from "../WinnerPopup";

export default function TrebellerTable() {
	const { session } = useGameSession();
	const navigate = useNavigate();
	const players = session?.players ?? [];
	const [rounds, setRounds] = useState<TrebellerRound[]>(
		createInitialTrebellerRounds()
	);
	const [activeCategory, setActiveCategory] =
		useState<TrebellerCategory | null>(null);

	if (players.length !== 3) {
		return (
			<div className="p-6 text-center text-red-600 font-bold">
				Trebeller kräver exakt 3 spelare.
			</div>
		);
	}

	const handleRoundSubmit = (
		_: number,
		chosenBy: number,
		tricksTaken: number[],
		scores: number[]
	) => {
		if (!activeCategory) return;

		const newRound: TrebellerRound = {
			category: activeCategory,
			chosenBy,
			tricksTaken,
			scores,
		};

		setRounds([...rounds, newRound]);
		setActiveCategory(null);
	};

	const scoreLog: string[][] = players.map(() => [] as string[]);
	rounds.forEach((round) => {
		round.scores.forEach((score, idx) => {
			scoreLog[idx].push(score >= 0 ? `+${score}` : `${score}`);
		});
	});

	const calculateTotal = (playerIdx: number) =>
		rounds.reduce((sum, r) => sum + (r.scores[playerIdx] ?? 0), 0);

	const isGameOver = rounds.length >= 18;

	return (
		<div className="px-4 py-6">
			<button
				onClick={() => navigate(-1)}
				className="text-gray-600 hover:text-black flex items-center gap-2 mb-4"
			>
				<ArrowLeft size={24} />
				<span className="text-md font-medium">Tillbaka</span>
			</button>

	
			{isGameOver && (
				<WinnerPopup
					message={`Spelet är slut! ${
						players[
							calculateTotal(0) > calculateTotal(1) &&
							calculateTotal(0) > calculateTotal(2)
								? 0
								: calculateTotal(1) > calculateTotal(2)
								? 1
								: 2
						].name
					} vann!`}
				/>
			)}

			<div className="overflow-x-auto bg-white rounded shadow">
				<div className="min-w-[600px]">
					<div className="flex border-b border-black h-14">
						<div className="w-32 font-bold px-2 border-r border-black flex items-center justify-center">
							Trebeller
						</div>
						{players.map((p, i) => (
							<div
								key={i}
								className="min-w-[100px] border-r border-black flex items-center justify-center font-medium"
							>
								{p.name}
							</div>
						))}
					</div>

					{trebellerCategories.map((cat, rowIdx) => (
						<div
							key={rowIdx}
							className="flex border-b border-black h-12"
						>
							<div
								className={`w-32 border-r border-black flex items-center justify-center cursor-pointer hover:bg-gray-100 text-sm text-center`}
								onClick={() => {
									if (
										!isGameOver &&
										rounds.filter((r) => r.category === cat)
											.length < 3
									) {
										setActiveCategory(cat);
									}
								}}
							>
								{cat}
							</div>
							{players.map((_, colIdx) => (
								<div
									key={colIdx}
									className="min-w-[100px] border-r border-black flex items-center justify-center text-xl"
								>
									{rounds.some(
										(r) =>
											r.category === cat &&
											r.chosenBy === colIdx
									)
										? "✗"
										: ""}
								</div>
							))}
						</div>
					))}

					<div className="flex border-t border-black">
						<div className="w-32 border-r border-black flex items-start justify-center font-bold py-2">
							Poäng
						</div>
						{players.map((_, idx) => (
							<div
								key={idx}
								className="min-w-[100px] border-r border-black flex flex-col items-center justify-start py-2 text-sm font-medium"
							>
								{scoreLog[idx].map((score, i) => (
									<div key={i}>{score}</div>
								))}
								<hr className="w-full border-t border-gray-400 my-1" />
								<div className="font-bold">
									{calculateTotal(idx)}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{activeCategory && (
				<ScorePopupTrebeller
					roundIndex={-1}
					round={{
						category: activeCategory,
						chosenBy: -1,
						scores: [],
						tricksTaken: [],
					}}
					players={players.map((p) => p.name)}
					onSubmit={handleRoundSubmit}
					onClose={() => setActiveCategory(null)}
				/>
			)}
		</div>
	);
}
