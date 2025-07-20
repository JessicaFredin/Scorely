import { useState } from "react";
import Button from "../Button";
import { getTotalTricks } from "../../gameLogic/jazz";

type JazzRoundRule = {
	label: string;
	scoreType: "minus" | "plus";
	pointsPerUnit: number;
	description: string;
};

type Props = {
	round: JazzRoundRule;
	players: string[];
	onSubmit: (scores: number[]) => void;
	onClose: () => void;
};

export default function ScorePopupJazz({
	round,
	players,
	onSubmit,
	onClose,
}: Props) {
	const [inputs, setInputs] = useState<number[]>(
		Array(players.length).fill(0)
	);
	const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
	const [error, setError] = useState<string>("");

	const isSingleChoice = ["Klöver kung", "Sista stick"].includes(round.label);

	const handleNumberChange = (i: number, value: string) => {
		const parsed = parseInt(value || "0");
		if (isNaN(parsed) || parsed < 0) return;
		const updated = [...inputs];
		updated[i] = parsed;
		setInputs(updated);
		setError("");
	};

	const getExpectedTotal = () => {
		switch (round.label) {
			case "Pass":
			case "Spel":
				return getTotalTricks(players.length);
			case "Klöver":
				return 13;
			case "Damer":
				return 4;
			default:
				return null;
		}
	};

	const handleConfirm = () => {
		if (isSingleChoice) {
			if (selectedIndex === null) {
				setError("Välj en spelare.");
				return;
			}
			const result = players.map((_, i) =>
				i === selectedIndex ? round.pointsPerUnit : 0
			);
			onSubmit(result);
			return;
		}

		const total = inputs.reduce((a, b) => a + b, 0);
		const expected = getExpectedTotal();

		if (expected !== null && total !== expected) {
			const diff = expected - total;
			setError(
				`Fel antal: ${
					diff > 0 ? `${diff} för lite` : `${-diff} för mycket`
				}.`
			);
			return;
		}

		const result = inputs.map((v) => v * round.pointsPerUnit);
		onSubmit(result);
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-white p-6 rounded shadow max-w-md w-full text-center">
				<h2 className="text-xl font-bold mb-2">{round.label}</h2>
				<p className="text-sm text-gray-600 mb-4">
					{round.description}
				</p>

				{isSingleChoice ? (
					<div className="space-y-3 text-left">
						{players.map((name, i) => (
							<label
								key={i}
								className="flex items-center gap-2 cursor-pointer"
							>
								<input
									type="radio"
									name="single-winner"
									checked={selectedIndex === i}
									onChange={() => {
										setSelectedIndex(i);
										setError("");
									}}
								/>
								<span>{name}</span>
							</label>
						))}
					</div>
				) : (
					<div className="space-y-3 text-left">
						{players.map((name, i) => (
							<div
								key={i}
								className="flex items-center justify-between"
							>
								<label className="mr-4 font-medium">
									{name}
								</label>
								<input
									type="number"
									min={0}
									value={inputs[i]}
									onChange={(e) =>
										handleNumberChange(i, e.target.value)
									}
									onFocus={(e) => e.target.select()}
									className="border px-3 py-1 rounded w-24 text-right"
								/>
							</div>
						))}
					</div>
				)}

				{error && <p className="text-red-600 text-sm mt-4">{error}</p>}

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
