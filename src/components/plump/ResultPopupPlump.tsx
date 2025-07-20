import { useState } from "react";

type Props = {
	playerName: string;
	onSubmit: (value: number) => void;
	onClose: () => void;
};

export default function ResultPopupPlump({
	playerName,
	onSubmit,
	onClose,
}: Props) {
	const [input, setInput] = useState("");

	const handleConfirm = () => {
		const parsed = parseInt(input);
		if (!isNaN(parsed)) {
			onSubmit(parsed);
			onClose();
		}
	};

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-white p-6 rounded-md w-[90%] max-w-md space-y-4">
				<h2 className="text-lg font-bold text-center">
					Hur många stick tog {playerName}?
				</h2>

				<input
					type="number"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onFocus={(e) => e.target.select()}
					className="w-full px-4 py-2 border border-gray-300 rounded text-center"
					autoFocus
				/>

				<div className="flex justify-between gap-2">
					<button
						onClick={onClose}
						className="w-full py-2 rounded bg-gray-200 hover:bg-gray-300"
					>
						Avbryt
					</button>
					<button
						onClick={handleConfirm}
						className="w-full py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
					>
						OK
					</button>
				</div>
			</div>
		</div>
	);
}
