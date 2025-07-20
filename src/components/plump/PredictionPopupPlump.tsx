import { useState } from "react";

type Props = {
	players: string[];
	cardCount: number;
	onSubmit: (guesses: number[]) => void;
	onClose: () => void;
};

export default function PredictionPopupPlump({
	players,
	cardCount,
	onSubmit,
	onClose,
}: Props) {
	const [guesses, setGuesses] = useState<number[]>(
		new Array(players.length).fill(0)
	);

	const handleChange = (i: number, val: string) => {
		const parsed = parseInt(val);
		if (!isNaN(parsed)) {
			setGuesses((prev) => prev.map((g, j) => (i === j ? parsed : g)));
		}
	};

	const isValid = guesses.reduce((a, b) => a + b, 0) !== cardCount;

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-white p-6 rounded-md w-[90%] max-w-md space-y-4">
				<h2 className="text-lg font-bold text-center">
					Gissningar för denna runda ({cardCount} kort)
				</h2>
				{players.map((player, i) => (
					<div key={i} className="flex justify-between items-center">
						<span>{player}</span>
						<input
							type="number"
							value={guesses[i]}
							onChange={(e) => handleChange(i, e.target.value)}
							onFocus={(e) => e.target.select()}
							className="border rounded px-2 py-1 w-20 text-center"
							min={0}
						/>
					</div>
				))}
				{!isValid && (
					<p className="text-red-600 text-sm text-center">
						Gissningarna får inte summera till {cardCount}
					</p>
				)}
				<div className="flex gap-2 justify-center">
					<button
						disabled={!isValid}
						onClick={() => onSubmit(guesses)}
						className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
					>
						Spara
					</button>
					<button
						onClick={onClose}
						className="underline text-sm text-gray-600"
					>
						Avbryt
					</button>
				</div>
			</div>
		</div>
	);
}