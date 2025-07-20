import { useState, useEffect } from "react";
import { useGameSession } from "../../context/GameSessionContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ScorePopupChicago from "../chicago/ScorePopupChicago";
import TallyMarks from "../chicago/TallyMarks";
import WinnerPopup from "../WinnerPopup";

export default function ChicagoTable() {
	const { session } = useGameSession();
	const players = session?.players ?? [];
	const navigate = useNavigate();

	const [winnerMessage, setWinnerMessage] = useState<string | null>(null);
	const [scores, setScores] = useState<number[]>(
		new Array(players.length).fill(0)
	);
	const [chicagoCounts, setChicagoCounts] = useState<number[]>(
		new Array(players.length).fill(0)
	);
	const [strikedScores, setStrikedScores] = useState<number[]>(
		new Array(players.length).fill(0)
	);
	const [selectedPlayerIndex, setSelectedPlayerIndex] = useState<
		number | null
	>(null);



	useEffect(() => {
		players.forEach((player, i) => {
			const netScore = scores[i] - strikedScores[i];
			const chicagoCount = chicagoCounts[i];

			if (netScore >= 47) {
				setWinnerMessage(
					`${player.name} har köpstopp!`
				);
				setTimeout(() => setWinnerMessage(null), 5000);
			}

			if (chicagoCount > 0 && netScore >= 52) {
				setWinnerMessage(
					`${player.name} har vunnit spelet: ${netScore} poäng!`
				);
				setTimeout(() => setWinnerMessage(null), 5000);
			}
		});
	}, [scores, strikedScores, chicagoCounts, players]);
	



	const handleScore = (points: number, id?: string) => {
		if (selectedPlayerIndex === null) return;

		if (id === "fourOfKind") {
			setStrikedScores((prev) =>
				prev.map((val, i) =>
					i === selectedPlayerIndex ? val : scores[i]
				)
			);
		}

		setScores((prev) =>
			prev.map((score, i) =>
				i === selectedPlayerIndex ? score + points : score
			)
		);

		setSelectedPlayerIndex(null);
	};
	

	const handleSayChicago = () => {
		if (selectedPlayerIndex === null) return;
		if (scores[selectedPlayerIndex] < 15) return;

		setChicagoCounts((prev) =>
			prev.map((count, i) =>
				i === selectedPlayerIndex ? count + 1 : count
			)
		);
		setSelectedPlayerIndex(null);
	};

	const handleMissedChicago = () => {
		if (selectedPlayerIndex === null) return;
		setStrikedScores((prev) =>
			prev.map((val, i) => (i === selectedPlayerIndex ? val + 15 : val))
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
						<div className="w-24 font-bold px-2 border-r border-black flex items-center">
							Chicago
						</div>
						{players.map((player, i) => (
							<div
								key={i}
								className="min-w-[80px] text-center font-medium px-2 border-r border-black  flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100"
								onClick={() => setSelectedPlayerIndex(i)}
							>
								<div>{player.name}</div>
								<div className="flex gap-1 mt-0.5">
									{Array.from({
										length: chicagoCounts[i],
									}).map((_, idx) => (
										<span
											key={idx}
											className="w-5 h-5 rounded-full border border-black flex items-center justify-center text-xs font-bold"
										>
											C
										</span>
									))}
								</div>
							</div>
						))}
					</div>

					{Array.from({ length: 30 }).map((_, rowIdx) => (
						<div key={rowIdx} className="flex h-10">
							<div className="w-24 border-r border-black" />
							{players.map((_, colIdx) => {
								const total = scores[colIdx];
								const striked = strikedScores[colIdx];
								const rowScore =
									Math.floor(total / 10) === rowIdx
										? total % 10
										: rowIdx < Math.floor(total / 10)
										? 10
										: 0;

								const rowStriked =
									Math.floor(striked / 10) === rowIdx
										? striked % 10
										: rowIdx < Math.floor(striked / 10)
										? 10
										: 0;

								return (
									<div
										key={colIdx}
										className="min-w-[80px] border-r border-black  flex items-center justify-center"
									>
										{rowScore > 0 && (
											<TallyMarks
												count={rowScore}
												striked={rowStriked}
											/>
										)}
									</div>
								);
							})}
						</div>
					))}
				</div>
			</div>

			{selectedPlayerIndex !== null && (
				// <ScorePopup
				// 	playerName={players[selectedPlayerIndex].name}
				// 	currentScore={scores[selectedPlayerIndex]}
				// 	onSelect={handleScore}
				// 	onSayChicago={handleSayChicago}
				// 	onMissChicago={handleMissedChicago}
				// 	onClose={() => setSelectedPlayerIndex(null)}
				// 	canSayChicago={scores[selectedPlayerIndex] >= 15}
				// />

				<ScorePopupChicago
	playerName={players[selectedPlayerIndex].name}
	currentScore={scores[selectedPlayerIndex]}
	strikedScore={strikedScores[selectedPlayerIndex]} // 👈 Ny prop
	onSelect={handleScore}
	onSayChicago={handleSayChicago}
	onMissChicago={handleMissedChicago}
	onClose={() => setSelectedPlayerIndex(null)}
	canSayChicago={scores[selectedPlayerIndex] - strikedScores[selectedPlayerIndex] >= 15}
/>

			)}
		</div>
	);
}
