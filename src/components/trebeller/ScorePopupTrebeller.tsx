import { useState } from "react";
import Button from "../Button";
import type { TrebellerRound } from "../../gameLogic/trebeller";

type Props = {
	roundIndex: number;
	round: TrebellerRound;
	players: string[];
	onSubmit: (
		roundIndex: number,
		chosenBy: number,
		tricksTaken: number[]
	) => void;
	onClose: () => void;
};

export default function ScorePopupTrebeller({
	roundIndex,
	round,
	players,
	onSubmit,
	onClose,
}: Props) {
	const [chosenBy, setChosenBy] = useState<number | null>(null);
	const [tricksTaken, setTricksTaken] = useState<number[]>(
		Array(players.length).fill(0)
	);
	const [error, setError] = useState("");

	const handleTrickChange = (i: number, value: string) => {
		const num = parseInt(value);
		if (isNaN(num) || num < 0) return;
		const updated = [...tricksTaken];
		updated[i] = num;
		setTricksTaken(updated);
		setError("");
	};

	const handleConfirm = () => {
		if (chosenBy === null) {
			setError("Välj vem som valde denna runda.");
			return;
		}
		const totalTricks = tricksTaken.reduce((sum, n) => sum + n, 0);
		if (totalTricks !== 13) {
			setError("Totalt antal stick måste vara exakt 13.");
			return;
		}
		onSubmit(roundIndex, chosenBy, tricksTaken);
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-white p-6 rounded shadow max-w-md w-full text-center">
				<h2 className="text-xl font-bold mb-2">{round.category}</h2>
				<p className="text-sm text-gray-600 mb-4">
					Välj vem som valde, och hur många stick varje spelare tog.
				</p>

				<div className="space-y-3 text-left mb-4">
					<p className="font-medium text-sm">Vem valde rundan?</p>
					{players.map((name, i) => (
						<label
							key={i}
							className="flex items-center gap-2 cursor-pointer"
						>
							<input
								type="radio"
								name="chooser"
								checked={chosenBy === i}
								onChange={() => setChosenBy(i)}
								onFocus={(e) => e.target.select()}
							/>
							<span>{name}</span>
						</label>
					))}
				</div>

				<div className="space-y-3 text-left">
					<p className="font-medium text-sm">Antal stick:</p>
					{players.map((name, i) => (
						<div
							key={i}
							className="flex items-center justify-between"
						>
							<label className="mr-4 font-medium">{name}</label>
							<input
								type="number"
								min={0}
								value={tricksTaken[i]}
								onChange={(e) =>
									handleTrickChange(i, e.target.value)
								}
								onFocus={(e) => e.target.select()}
								className="border px-3 py-1 rounded w-24 text-right"
							/>
						</div>
					))}
				</div>

				{error && (
					<p className="text-red-600 text-sm mt-4 font-medium">
						{error}
					</p>
				)}

				<div className="flex justify-end gap-4 mt-6">
					<Button text="Avbryt" color="secondary" onClick={onClose} />
					<Button
						text="Bekräfta"
						color="primary"
						onClick={handleConfirm}
					/>
				</div>
			</div>
		</div>
	);
}
