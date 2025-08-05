/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo } from "react";
import { ProtocolService } from "../../services/ProtocolService";
import type { SavedProtocol } from "../../types/savedProtocol";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGameSession } from "../../context/GameSessionContext";
import WinnerPopup from "../WinnerPopup";
interface DiscGolfTableProps {
	players?: { name: string }[];
	scores?: number[][];
	resumeMode?: boolean;
	id?: string;
}

export default function DiscGolfTable({
	players: resumePlayers,
	scores: initialScores,
	// resumeMode = false,
	id,
}: DiscGolfTableProps) {
	const { session } = useGameSession();
	const navigate = useNavigate();
	const holeCount = 18;

	const [winnerMessage, setWinnerMessage] = useState<string | null>(null);

	// ✅ Choose players from props (resume) or session (new game)
	const players = useMemo(
		() => resumePlayers || session?.players || [],
		[resumePlayers, session?.players]
	);

	// ✅ Pick ID: from props if resuming, otherwise generate new
	const [protocolId] = useState<string>(id || crypto.randomUUID());

	// ✅ Scores: from props if resuming, otherwise empty
	const [scores, setScores] = useState<number[][]>(
		initialScores && initialScores.length > 0
			? initialScores
			: players.map(() => Array(holeCount).fill(0))
	);

	const getTotal = (playerIndex: number) =>
		scores[playerIndex].reduce((sum, val) => sum + val, 0);

	const handleScoreChange = (
		playerIndex: number,
		holeIndex: number,
		value: string
	) => {
		const updated = scores.map((row, pIdx) =>
			pIdx === playerIndex
				? row.map((score, hIdx) =>
						hIdx === holeIndex ? parseInt(value) || 0 : score
				  )
				: row
		);
		setScores(updated);
	};

	// ✅ Auto-save for both new and resumed games
	useEffect(() => {
		if (!players.length) return; // avoid saving when no players set

		const protocol: SavedProtocol = {
			id: protocolId,
			name: "Disc Golf match",
			gameType: "discGolf",
			players,
			scores,
			date: new Date().toISOString(),
		};
		ProtocolService.save(protocol);
	}, [scores, players, protocolId]);

	useEffect(() => {
		if (players.length === 0) return;

		const allFilled = scores.every((playerScores) =>
			playerScores.every((score) => score > 0)
		);
		if (allFilled) {
			let winnerIndex = 0;
			let lowestScore = getTotal(0);

			for (let i = 1; i < players.length; i++) {
				const total = getTotal(i);
				if (total < lowestScore) {
					lowestScore = total;
					winnerIndex = i;
				}
			}

			setWinnerMessage(
				`${players[winnerIndex].name} har vunnit spelet! ${lowestScore} poäng!`
			);
			setTimeout(() => setWinnerMessage(null), 5000);
		}
	}, [scores, players]);

	if (!players.length) {
		return <div className="p-4 text-center">Inga spelare hittades.</div>;
	}

	return (
		<section className="overflow-x-auto px-4 py-8">
			<div className="mb-4 flex gap-4 items-center">
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
