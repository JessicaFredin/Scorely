import { useGameSession } from "../context/GameSessionContext";

export default function GamePage() {
	const { session } = useGameSession();

	if (!session?.game || session.players.length === 0) {
		return <p className="text-center mt-10">Ingen speldata tillgänglig.</p>;
	}

	const { game, players } = session;

	// Temporärt: hårdkodade radnamn per spel
	const rowLabelsByGame: Record<string, string[]> = {
		Jazz: [
			"Pass",
			"Klöver",
			"Damer",
			"Klöver kung (KK)",
			"Sista",
			"Spel",
			"Sjuan",
		],
		// Lägg till fler spel här
		Default: Array(15).fill(""),
	};

	const rowLabels = rowLabelsByGame[game.name] ?? rowLabelsByGame.Default;

	return (
		<section className="overflow-x-auto px-4 py-8">
			<h2 className="text-2xl font-bold mb-6 text-center">{game.name}</h2>

			<table className="table-fixed border border-black w-full max-w-3xl mx-auto">
				<thead>
					<tr>
						<th className="border p-2 w-40 text-left">Rond</th>
						{players.map((player, idx) => (
							<th key={idx} className="border p-2">
								{player.name}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rowLabels.map((label, rowIdx) => (
						<tr key={rowIdx}>
							<td className="border p-2">{label}</td>
							{players.map((_, colIdx) => (
								<td key={colIdx} className="border p-1">
									<input
										type="text"
										className="w-full p-1 border rounded"
										placeholder=""
									/>
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</section>
	);
}
