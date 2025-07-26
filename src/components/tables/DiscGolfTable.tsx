// import React from "react";
// import { useGameSession } from "../../context/GameSessionContext";

// const DiscGolfTable = () => {
// 	const { session } = useGameSession();

// 	if (!session?.players) return null;

// 	return (
// 		<div className="overflow-x-auto">
// 			<table className="min-w-full table-auto border-collapse border">
// 				<thead>
// 					<tr>
// 						<th className="border p-2">Hål</th>
// 						{session.players.map((player, index) => (
// 							<th key={index} className="border p-2">
// 								{player.name}
// 							</th>
// 						))}
// 					</tr>
// 				</thead>
// 				<tbody>
// 					{Array.from({ length: 18 }).map((_, holeIndex) => (
// 						<tr key={holeIndex}>
// 							<td className="border p-2 text-center">
// 								{holeIndex + 1}
// 							</td>
// 							{session.players.map((player, playerIndex) => (
// 								<td key={playerIndex} className="border p-2">
// 									<input
// 										type="number"
// 										min="1"
// 										className="w-full text-center border rounded"
// 										placeholder="—"
// 									/>
// 								</td>
// 							))}
// 						</tr>
// 					))}
// 				</tbody>
// 			</table>
// 		</div>
// 	);
// };

// export default DiscGolfTable;

import { useState, useMemo } from "react";
import { useGameSession } from "../../context/GameSessionContext";
import { useNavigate } from "react-router-dom";
import WinnerPopup from "../WinnerPopup";
import { ArrowLeft } from "lucide-react";

export default function DiscgolfTable() {
	const { session } = useGameSession();
	// const players = session?.players ?? [];
	const players = useMemo(() => session?.players ?? [], [session?.players]);
	const navigate = useNavigate();
	const [winnerMessage, _] = useState<string | null>(null);

	const holeCount = 18;
	const [scores, setScores] = useState<number[][]>(
		players.map(() => Array(holeCount).fill(0))
	);

	const handleScoreChange = (
		playerIndex: number,
		holeIndex: number,
		value: string
	) => {
		const updated = [...scores];
		const parsed = parseInt(value);
		updated[playerIndex][holeIndex] = isNaN(parsed) ? 0 : parsed;
		setScores(updated);
	};

	const getTotal = (playerIndex: number) =>
		scores[playerIndex].reduce((sum, val) => sum + val, 0);

	// useEffect(() => {
	// 	players.forEach((player, i) => {
	// 		const score = scores[i];

	// 		if (player.scores > 63) {
	// 			setWinnerMessage(`${player.name} har vunnit spelet: ${score}`);
	// 			setTimeout(() => setWinnerMessage(null), 5000);
	// 		}
	// 	});
	// }, [scores, players]);

	if (!session?.game || players.length === 0) {
		return <p className="text-center mt-10">Ingen speldata tillgänglig.</p>;
	}

	return (
		<section className="overflow-x-auto px-4 py-8">
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

			<table className="table-fixed border border-black w-full max-w-4xl mx-auto text-sm">
				<thead>
					<tr>
						<th className="border p-2 text-left w-24">Discgolf</th>
						{players.map((player, idx) => (
							<th key={idx} className="border p-2">
								{player.name}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{Array(holeCount)
						.fill(0)
						.map((_, holeIdx) => (
							<tr key={holeIdx}>
								<td className="border p-2 font-medium">
									Hål {holeIdx + 1}
								</td>
								{players.map((_, playerIdx) => (
									<td key={playerIdx} className="border p-1">
										<input
											type="number"
											className="w-full p-1 rounded text-center"
											value={
												scores[playerIdx][holeIdx] || ""
											}
											onChange={(e) =>
												handleScoreChange(
													playerIdx,
													holeIdx,
													e.target.value
												)
											}
										/>
									</td>
								))}
							</tr>
						))}
					<tr>
						<td className="border p-2 font-bold bg-gray-100">
							Totalt
						</td>
						{players.map((_, playerIdx) => (
							<td
								key={playerIdx}
								className="border p-2 font-bold bg-gray-100 text-center"
							>
								{getTotal(playerIdx)}
							</td>
						))}
					</tr>
				</tbody>
			</table>
		</section>
	);
}
