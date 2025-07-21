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


import { useState } from "react";
import { useGameSession } from "../../context/GameSessionContext";

export default function DiscgolfTable() {
	const { session } = useGameSession();
	const players = session?.players ?? [];

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

	if (!session?.game || players.length === 0) {
		return <p className="text-center mt-10">Ingen speldata tillgänglig.</p>;
	}

	return (
		<section className="overflow-x-auto px-4 py-8">
			<h2 className="text-2xl font-bold mb-6 text-center">Discgolf</h2>

			<table className="table-fixed border border-black w-full max-w-4xl mx-auto text-sm">
				<thead>
					<tr>
						<th className="border p-2 text-left w-24">Namn</th>
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
											className="w-full p-1 border rounded text-center"
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
