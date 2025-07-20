// // import { useState } from "react";

// // type Props = {
// // 	players: string[];
// // 	category: string;
// // 	totalTricks: number;
// // 	onSubmit: (values: number[]) => void;
// // 	onClose: () => void;
// // };

// // export default function ScorePopupJazz({
// // 	players,
// // 	category,
// // 	totalTricks,
// // 	onSubmit,
// // 	onClose,
// // }: Props) {
// // 	const [values, setValues] = useState<number[]>(
// // 		new Array(players.length).fill(0)
// // 	);

// // 	const handleChange = (i: number, val: string) => {
// // 		const updated = [...values];
// // 		updated[i] = parseInt(val) || 0;
// // 		setValues(updated);
// // 	};

// // 	const handleConfirm = () => {
// // 		const total = values.reduce((sum, v) => sum + v, 0);
// // 		if (category === "Pass" && total !== totalTricks) {
// // 			alert(`Antalet stick måste bli exakt ${totalTricks}.`);
// // 			return;
// // 		}
// // 		onSubmit(values);
// // 	};

// // 	return (
// // 		<div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
// // 			<div className="bg-white p-6 rounded shadow-md w-full max-w-sm space-y-4">
// // 				<h2 className="text-lg font-bold text-center">{category}</h2>
// // 				{players.map((name, i) => (
// // 					<div key={i} className="flex items-center gap-2">
// // 						<span className="w-24">{name}</span>
// // 						<input
// // 							type="number"
// // 							className="flex-1 border px-3 py-1 rounded text-center"
// // 							value={values[i]}
// // 							onChange={(e) => handleChange(i, e.target.value)}
// // 							min={0}
// // 						/>
// // 					</div>
// // 				))}
// // 				<button
// // 					onClick={handleConfirm}
// // 					className="w-full bg-blue-600 text-white py-2 rounded"
// // 				>
// // 					Bekräfta
// // 				</button>
// // 				<button
// // 					onClick={onClose}
// // 					className="text-sm text-gray-500 underline w-full"
// // 				>
// // 					Avbryt
// // 				</button>
// // 			</div>
// // 		</div>
// // 	);
// // }



// type Props = {
// 	round: string;
// 	players: string[];
// 	onSubmit: (values: number[]) => void;
// 	onClose: () => void;
// };

// import { useState } from "react";

// export default function ScorePopupJazz({
// 	round,
// 	players,
// 	onSubmit,
// 	onClose,
// }: Props) {
// 	const [values, setValues] = useState<number[]>(
// 		Array(players.length).fill(0)
// 	);

// 	const handleChange = (index: number, value: string) => {
// 		const num = parseInt(value);
// 		const updated = [...values];
// 		updated[index] = isNaN(num) ? 0 : num;
// 		setValues(updated);
// 	};

// 	const handleSubmit = () => {
// 		onSubmit(values);
// 	};

// 	return (
// 		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
// 			<div className="bg-white p-6 rounded-md w-full max-w-sm space-y-4">
// 				<h2 className="text-lg font-bold text-center">
// 					Resultat för {round}
// 				</h2>
// 				{players.map((player, i) => (
// 					<div key={i} className="flex justify-between items-center">
// 						<span>{player}</span>
// 						<input
// 							type="number"
// 							value={values[i]}
// 							onChange={(e) => handleChange(i, e.target.value)}
// 							className="border rounded px-3 py-1 w-20 text-center"
// 						/>
// 					</div>
// 				))}
// 				<button
// 					onClick={handleSubmit}
// 					className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
// 				>
// 					Bekräfta
// 				</button>
// 				<button
// 					onClick={onClose}
// 					className="w-full text-sm text-gray-600 underline"
// 				>
// 					Avbryt
// 				</button>
// 			</div>
// 		</div>
// 	);
// }
  


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

