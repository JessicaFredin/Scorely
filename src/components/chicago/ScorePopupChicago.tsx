import { chicagoLogic } from "../../gameLogic/chicago";

type ScorePopupProps = {
	playerName: string;
	currentScore: number;
	strikedScore: number;
	onSelect: (points: number, id?: string) => void;
	onSayChicago: () => void;
	onMissChicago: () => void;
	onClose: () => void;
	canSayChicago: boolean;
};

const scoreLabels: Record<string, string> = {
	pair: "1 par",
	twoPair: "2 par",
	threeOfKind: "Triss",
	straight: "Stege",
	flush: "Färg",
	fullHouse: "Kåk",
	fourOfKind: "Fyrtal",
	straightFlush: "Straight Flush",
	royalFlush: "Royal Flush",
	outplay: "Utspel",
	outplayWithTwo: "Utspel med tvåa",
	chicagoSuccess: "Chicago!",
	chicagoFail: "Missad Chicago",
};

export default function ScorePopup({
	playerName,
	currentScore,
	strikedScore,
	onSelect,
	onSayChicago,
	onMissChicago,
	onClose,
	canSayChicago,
}: ScorePopupProps) {
	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
			<div className="bg-white p-6 rounded-md space-y-4 w-[90%] max-w-md">
				<h2 className="text-lg font-bold">
					Poäng till {playerName} (nuvarande:{" "}
					{currentScore - strikedScore}p)
				</h2>

				<div className="grid grid-cols-2 gap-2">
					{chicagoLogic.scoring.map(({ id, points }) => (
						<button
							key={id}
							onClick={() => {
								if (id === "chicagoFail") onMissChicago();
								else onSelect(points, id);
							}}
							className="bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded text-sm"
						>
							{scoreLabels[id] ?? id} ({points}p)
						</button>
					))}
				</div>

				<button
					onClick={onSayChicago}
					disabled={!canSayChicago}
					className={`px-4 py-2 rounded text-sm w-full ${
						canSayChicago
							? "bg-red-100 hover:bg-red-200"
							: "bg-gray-200 text-gray-400 cursor-not-allowed"
					}`}
				>
					Säg Chicago
				</button>

				<button
					onClick={onClose}
					className="text-sm text-gray-600 underline w-full"
				>
					Avbryt
				</button>
			</div>
		</div>
	);
}
