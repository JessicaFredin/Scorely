import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, X } from "lucide-react";

import type {
	ProtocolComponentProps,
	ScoreCellValue,
} from "../data/protocolRegistry";

type MaxiRowType =
	| "upper"
	| "bonus"
	| "pair"
	| "twoPair"
	| "threePair"
	| "kind3"
	| "kind4"
	| "kind5"
	| "straight"
	| "fullHouse"
	| "house"
	| "tower"
	| "chance"
	| "maxiYatzy";

type MaxiRow = {
	key: string;
	label: string;
	type: MaxiRowType;
	rowIndex: number;
	faceValue?: number;
	fixedScore?: number;
	helper?: string;
};

type CountModal = {
	kind: "count";
	row: MaxiRow;
	playerIndex: number;
	count: number;
	multiplier: number;
};

type FaceModal = {
	kind: "face";
	row: MaxiRow;
	playerIndex: number;
	selectedFace: number;
	factor: number;
};

type MultiFacesModal = {
	kind: "multiFaces";
	row: MaxiRow;
	playerIndex: number;
	selectedFaces: number[];
	requiredFaces: number;
	factor: number;
};

type FixedModal = {
	kind: "fixed";
	row: MaxiRow;
	playerIndex: number;
	active: boolean;
	score: number;
};

type FullHouseModal = {
	kind: "fullHouse";
	row: MaxiRow;
	playerIndex: number;
	tripleFace: number;
	pairFace: number;
};

type HouseModal = {
	kind: "house";
	row: MaxiRow;
	playerIndex: number;
	firstTriple: number;
	secondTriple: number;
};

type TowerModal = {
	kind: "tower";
	row: MaxiRow;
	playerIndex: number;
	fourFace: number;
	pairFace: number;
};

type NumberModal = {
	kind: "number";
	row: MaxiRow;
	playerIndex: number;
	value: number;
	min: number;
	max: number;
};

type ModalState =
	| CountModal
	| FaceModal
	| MultiFacesModal
	| FixedModal
	| FullHouseModal
	| HouseModal
	| TowerModal
	| NumberModal
	| null;

const BONUS_THRESHOLD = 75;
const BONUS_SCORE = 50;

const maxiRows: MaxiRow[] = [
	{
		key: "ones",
		label: "Ettor",
		type: "upper",
		rowIndex: 0,
		faceValue: 1,
	},
	{
		key: "twos",
		label: "Tvåor",
		type: "upper",
		rowIndex: 1,
		faceValue: 2,
	},
	{
		key: "threes",
		label: "Treor",
		type: "upper",
		rowIndex: 2,
		faceValue: 3,
	},
	{
		key: "fours",
		label: "Fyror",
		type: "upper",
		rowIndex: 3,
		faceValue: 4,
	},
	{
		key: "fives",
		label: "Femmor",
		type: "upper",
		rowIndex: 4,
		faceValue: 5,
	},
	{
		key: "sixes",
		label: "Sexor",
		type: "upper",
		rowIndex: 5,
		faceValue: 6,
	},

	{
		key: "bonus",
		label: "Bonus",
		type: "bonus",
		rowIndex: 6,
	},

	{
		key: "pair",
		label: "1 par",
		type: "pair",
		rowIndex: 7,
	},

	{
		key: "two-pair",
		label: "2 par",
		type: "twoPair",
		rowIndex: 8,
	},

	{
		key: "three-pair",
		label: "3 par",
		type: "threePair",
		rowIndex: 9,
	},

	{
		key: "three-kind",
		label: "Tretal",
		type: "kind3",
		rowIndex: 10,
	},

	{
		key: "four-kind",
		label: "Fyrtal",
		type: "kind4",
		rowIndex: 11,
	},

	{
		key: "five-kind",
		label: "Femtal",
		type: "kind5",
		rowIndex: 12,
	},

	{
		key: "small-straight",
		label: "Liten straight",
		type: "straight",
		rowIndex: 13,
		fixedScore: 15,
		helper: "1–2–3–4–5",
	},

	{
		key: "large-straight",
		label: "Stor straight",
		type: "straight",
		rowIndex: 14,
		fixedScore: 20,
		helper: "2–3–4–5–6",
	},

	{
		key: "full-straight",
		label: "Full straight",
		type: "straight",
		rowIndex: 15,
		fixedScore: 21,
		helper: "1–2–3–4–5–6",
	},

	{
		key: "full-house",
		label: "Kåk",
		type: "fullHouse",
		rowIndex: 16,
		helper: "Tretal + par",
	},

	{
		key: "house",
		label: "Hus",
		type: "house",
		rowIndex: 17,
		helper: "Två olika tretal",
	},

	{
		key: "tower",
		label: "Torn",
		type: "tower",
		rowIndex: 18,
		helper: "Fyrtal + par",
	},

	{
		key: "chance",
		label: "Chans",
		type: "chance",
		rowIndex: 19,
	},

	{
		key: "maxi-yatzy",
		label: "Maxi Yatzy",
		type: "maxiYatzy",
		rowIndex: 20,
		fixedScore: 100,
		helper: "6 lika",
	},
];

function cloneValues(values: ScoreCellValue[][]) {
	return values.map((row) => [...row]);
}

function getNumericValue(
	values: ScoreCellValue[][],
	rowIndex: number,
	playerIndex: number,
) {
	const value = values[rowIndex]?.[playerIndex];

	return typeof value === "number" ? value : 0;
}

function getUpperSum(values: ScoreCellValue[][], playerIndex: number) {
	return [0, 1, 2, 3, 4, 5].reduce(
		(sum, rowIndex) => sum + getNumericValue(values, rowIndex, playerIndex),
		0,
	);
}

function getBonusScore(values: ScoreCellValue[][], playerIndex: number) {
	return getUpperSum(values, playerIndex) >= BONUS_THRESHOLD
		? BONUS_SCORE
		: 0;
}

function getRemainingToBonus(values: ScoreCellValue[][], playerIndex: number) {
	return Math.max(0, BONUS_THRESHOLD - getUpperSum(values, playerIndex));
}

function getTotalScore(values: ScoreCellValue[][], playerIndex: number) {
	return maxiRows.reduce((sum, row) => {
		if (row.type === "bonus") {
			return sum + getBonusScore(values, playerIndex);
		}

		return sum + getNumericValue(values, row.rowIndex, playerIndex);
	}, 0);
}

function syncBonusRow(next: ScoreCellValue[][], playerCount: number) {
	if (!next[6]) {
		return next;
	}

	for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
		const upperSum = [0, 1, 2, 3, 4, 5].reduce((sum, rowIndex) => {
			const value = next[rowIndex]?.[playerIndex];

			return sum + (typeof value === "number" ? value : 0);
		}, 0);

		next[6][playerIndex] = upperSum >= BONUS_THRESHOLD ? BONUS_SCORE : 0;
	}

	return next;
}

function getFirstColWidth() {
	return "150px";
}

function getPlayerMinWidth(playerCount: number) {
	if (playerCount >= 5) return "76px";
	if (playerCount === 4) return "84px";
	if (playerCount === 3) return "92px";
	return "110px";
}

function getModalTitle(row: MaxiRow) {
	switch (row.type) {
		case "upper":
			return `Hur många ${row.label.toLowerCase()} fick du?`;

		case "pair":
			return "Vilket par fick du?";

		case "twoPair":
			return "Vilka två par fick du?";

		case "threePair":
			return "Vilka tre par fick du?";

		case "kind3":
			return "Vilket tretal fick du?";

		case "kind4":
			return "Vilket fyrtal fick du?";

		case "kind5":
			return "Vilket femtal fick du?";

		case "straight":
			return `Fick du ${row.label.toLowerCase()}?`;

		case "fullHouse":
			return "Vilken kåk fick du?";

		case "house":
			return "Vilket hus fick du?";

		case "tower":
			return "Vilket torn fick du?";

		case "chance":
			return "Hur många poäng fick du på chans?";

		case "maxiYatzy":
			return "Fick du Maxi Yatzy?";

		default:
			return row.label;
	}
}

function getModalSubtitle(row: MaxiRow) {
	switch (row.type) {
		case "upper":
			return "Välj antal tärningar.";

		case "pair":
			return "Välj tärningsvärdet för paret.";

		case "twoPair":
			return "Paren måste ha olika värden.";

		case "threePair":
			return "Alla tre par måste ha olika värden.";

		case "kind3":
			return "Tre lika tärningar.";

		case "kind4":
			return "Fyra lika tärningar.";

		case "kind5":
			return "Fem lika tärningar.";

		case "fullHouse":
			return "Tretalet och paret måste ha olika värden.";

		case "house":
			return "De två tretalen måste ha olika värden.";

		case "tower":
			return "Fyrtalet och paret måste ha olika värden.";

		case "chance":
			return "Summan av alla sex tärningar.";

		case "maxiYatzy":
			return "Alla sex tärningar ska visa samma värde.";

		default:
			return row.helper ?? "";
	}
}

function formatCell(
	row: MaxiRow,
	values: ScoreCellValue[][],
	playerIndex: number,
) {
	if (row.type === "bonus") {
		const bonus = getBonusScore(values, playerIndex);

		const remaining = getRemainingToBonus(values, playerIndex);

		return {
			main: String(bonus),

			sub: bonus > 0 ? "Bonus klar" : `${remaining} kvar`,

			mainClass: bonus > 0 ? "text-emerald-500" : "text-slate-700",

			subClass: bonus > 0 ? "text-emerald-500" : "text-amber-500",
		};
	}

	const value = values[row.rowIndex]?.[playerIndex];

	if (value === "" || typeof value !== "number") {
		return {
			main: "—",
			sub: "",
			mainClass: "text-slate-300",
			subClass: "text-slate-300",
		};
	}

	return {
		main: String(value),
		sub: "",

		mainClass: value > 0 ? "text-emerald-500" : "text-slate-500",

		subClass: "text-slate-300",
	};
}

export default function MaxiYatzyProtocol({
	players,
	values,
	onChange,
	onBatchChange,
	isLocked = false,
}: ProtocolComponentProps) {
	const [modal, setModal] = useState<ModalState>(null);

	useEffect(() => {
		if (!modal) return;

		const oldBody = document.body.style.overflow;

		const oldHtml = document.documentElement.style.overflow;

		document.body.style.overflow = "hidden";

		document.documentElement.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = oldBody;

			document.documentElement.style.overflow = oldHtml;
		};
	}, [modal]);

	const totals = useMemo(
		() =>
			players.map((_, playerIndex) => getTotalScore(values, playerIndex)),
		[players, values],
	);

	const upperSums = useMemo(
		() => players.map((_, playerIndex) => getUpperSum(values, playerIndex)),
		[players, values],
	);

	const openCell = (row: MaxiRow, playerIndex: number) => {
		if (isLocked || row.type === "bonus") {
			return;
		}

		const currentValue = getNumericValue(values, row.rowIndex, playerIndex);

		switch (row.type) {
			case "upper": {
				const face = row.faceValue ?? 1;

				setModal({
					kind: "count",
					row,
					playerIndex,

					count:
						currentValue > 0 ? Math.round(currentValue / face) : 0,

					multiplier: face,
				});

				return;
			}

			case "pair":
				setModal({
					kind: "face",
					row,
					playerIndex,
					selectedFace: currentValue > 0 ? currentValue / 2 : 0,
					factor: 2,
				});
				return;

			case "twoPair":
				setModal({
					kind: "multiFaces",
					row,
					playerIndex,
					selectedFaces: [],
					requiredFaces: 2,
					factor: 2,
				});
				return;

			case "threePair":
				setModal({
					kind: "multiFaces",
					row,
					playerIndex,
					selectedFaces: [],
					requiredFaces: 3,
					factor: 2,
				});
				return;

			case "kind3":
				setModal({
					kind: "face",
					row,
					playerIndex,
					selectedFace: currentValue > 0 ? currentValue / 3 : 0,
					factor: 3,
				});
				return;

			case "kind4":
				setModal({
					kind: "face",
					row,
					playerIndex,
					selectedFace: currentValue > 0 ? currentValue / 4 : 0,
					factor: 4,
				});
				return;

			case "kind5":
				setModal({
					kind: "face",
					row,
					playerIndex,
					selectedFace: currentValue > 0 ? currentValue / 5 : 0,
					factor: 5,
				});
				return;

			case "straight":
				setModal({
					kind: "fixed",
					row,
					playerIndex,
					active: currentValue === (row.fixedScore ?? 0),
					score: row.fixedScore ?? 0,
				});
				return;

			case "maxiYatzy":
				setModal({
					kind: "fixed",
					row,
					playerIndex,
					active: currentValue === 100,
					score: 100,
				});
				return;

			case "fullHouse":
				setModal({
					kind: "fullHouse",
					row,
					playerIndex,
					tripleFace: 0,
					pairFace: 0,
				});
				return;

			case "house":
				setModal({
					kind: "house",
					row,
					playerIndex,
					firstTriple: 0,
					secondTriple: 0,
				});
				return;

			case "tower":
				setModal({
					kind: "tower",
					row,
					playerIndex,
					fourFace: 0,
					pairFace: 0,
				});
				return;

			case "chance":
				setModal({
					kind: "number",
					row,
					playerIndex,
					value: currentValue,
					min: 0,
					max: 36,
				});
				return;
		}
	};

	const closeModal = () => {
		setModal(null);
	};

	const commitValue = (
		rowIndex: number,
		playerIndex: number,
		nextValue: number,
	) => {
		if (onBatchChange) {
			onBatchChange((prev) => {
				const next = cloneValues(prev);

				next[rowIndex][playerIndex] = nextValue;

				return syncBonusRow(next, players.length);
			});

			return;
		}

		onChange(rowIndex, playerIndex, nextValue);
	};

	const renderFaceButtons = (
		selectedFace: number,
		onSelect: (face: number) => void,
		factor: number,
	) => (
		<div className="grid grid-cols-7 gap-2">
			{[0, 1, 2, 3, 4, 5, 6].map((face) => (
				<button
					key={face}
					type="button"
					onClick={() => onSelect(face)}
					className={`rounded-[14px] border px-2 py-3 text-center transition ${
						selectedFace === face
							? "border-emerald-400 bg-emerald-50 text-slate-900"
							: "border-[#d8e3dc] bg-white text-slate-700 hover:bg-slate-50"
					}`}
				>
					<div className="font-black">{face}</div>

					{face > 0 && (
						<div className="mt-0.5 text-[10px] text-slate-400">
							{face * factor} p
						</div>
					)}
				</button>
			))}
		</div>
	);

	const firstColWidth = getFirstColWidth();

	const playerMinWidth = getPlayerMinWidth(players.length);

	const gridTemplateColumns = `${firstColWidth} repeat(${players.length}, minmax(${playerMinWidth}, 1fr))`;

	return (
		<>
			<div className="mx-auto w-full max-w-[1000px] overflow-x-auto pb-2">
				<div className="min-w-max overflow-hidden rounded-[24px] border border-white/70 bg-white/55 shadow-[0_8px_24px_rgba(0,0,0,0.03)] sm:rounded-[28px]">
					{/* HEADER */}
					<div
						className="grid bg-[#e7f1eb]"
						style={{
							gridTemplateColumns,
						}}
					>
						<div className="flex items-center border-b border-r border-[#d8e3dc] px-4 py-4 text-xs font-black uppercase tracking-[0.08em] text-slate-700">
							Maxi
						</div>

						{players.map((player, playerIndex) => (
							<div
								key={`${player.name}-${playerIndex}`}
								className="min-w-0 border-b border-[#d8e3dc] px-3 py-4 text-center"
							>
								<p className="truncate text-sm font-black text-slate-800">
									{player.name}
								</p>

								<p className="mt-0.5 text-xs font-bold text-slate-400">
									{totals[playerIndex]} p
								</p>
							</div>
						))}
					</div>

					{/* UPPER ROWS */}
					{maxiRows
						.filter((row) => row.type === "upper")
						.map((row, displayIndex) => {
							const rowBg =
								displayIndex % 2 === 0
									? "bg-white/60"
									: "bg-[#f7faf8]";

							return (
								<div
									key={row.key}
									className="grid"
									style={{
										gridTemplateColumns,
									}}
								>
									<div
										className={`min-w-0 border-r border-t border-[#d8e3dc] px-4 py-4 ${rowBg}`}
									>
										<p className="whitespace-nowrap text-sm font-black leading-tight text-slate-800">
											{row.label}
										</p>
									</div>

									{players.map((player, playerIndex) => {
										const display = formatCell(
											row,
											values,
											playerIndex,
										);

										return (
											<button
												key={`${row.key}-${player.name}-${playerIndex}`}
												type="button"
												onClick={() =>
													openCell(row, playerIndex)
												}
												disabled={isLocked}
												className={`flex min-h-[72px] min-w-0 flex-col items-center justify-center border-t border-[#d8e3dc] px-3 py-3 text-center transition ${rowBg} ${
													!isLocked
														? "hover:bg-emerald-50/60 active:bg-emerald-100/60"
														: ""
												}`}
											>
												<span
													className={`text-base font-black ${display.mainClass}`}
												>
													{display.main}
												</span>
											</button>
										);
									})}
								</div>
							);
						})}

					{/* ÖVRE DELEN - DIRECTLY ABOVE BONUS */}
					<div
						className="grid bg-[#eef7f1]"
						style={{
							gridTemplateColumns,
						}}
					>
						<div className="border-r border-t border-[#cfe0d6] px-4 py-4">
							<p className="whitespace-nowrap text-xs font-black uppercase tracking-[0.08em] text-slate-700">
								Övre delen
							</p>

							<p className="mt-1 text-[10px] font-medium text-slate-400">
								Summa ettor–sexor
							</p>
						</div>

						{players.map((player, playerIndex) => {
							const remaining = getRemainingToBonus(
								values,
								playerIndex,
							);

							const hasBonus =
								upperSums[playerIndex] >= BONUS_THRESHOLD;

							return (
								<div
									key={`upper-summary-${player.name}-${playerIndex}`}
									className="flex min-h-[72px] flex-col items-center justify-center border-t border-[#cfe0d6] px-3 py-3 text-center"
								>
									<div>
										<span className="text-base font-black text-slate-800">
											{upperSums[playerIndex]}
										</span>

										<span className="ml-1 text-xs font-bold text-slate-400">
											/{BONUS_THRESHOLD}
										</span>
									</div>

									<p
										className={`mt-1 text-[10px] font-bold ${
											hasBonus
												? "text-emerald-500"
												: "text-amber-500"
										}`}
									>
										{hasBonus
											? "Bonus klar"
											: `${remaining} kvar`}
									</p>
								</div>
							);
						})}
					</div>

					{/* BONUS */}
					{maxiRows
						.filter((row) => row.type === "bonus")
						.map((row) => (
							<div
								key={row.key}
								className="grid bg-white/60"
								style={{
									gridTemplateColumns,
								}}
							>
								<div className="border-r border-t border-[#d8e3dc] px-4 py-4">
									<p className="whitespace-nowrap text-sm font-black text-slate-800">
										Bonus
									</p>
								</div>

								{players.map((player, playerIndex) => {
									const display = formatCell(
										row,
										values,
										playerIndex,
									);

									return (
										<div
											key={`bonus-${player.name}-${playerIndex}`}
											className="flex min-h-[72px] flex-col items-center justify-center border-t border-[#d8e3dc] px-3 py-3 text-center"
										>
											<span
												className={`text-base font-black ${display.mainClass}`}
											>
												{display.main}
											</span>

											{display.sub && (
												<span
													className={`mt-1 text-[10px] font-bold ${display.subClass}`}
												>
													{display.sub}
												</span>
											)}
										</div>
									);
								})}
							</div>
						))}

					{/* LOWER ROWS */}
					{maxiRows
						.filter(
							(row) =>
								row.type !== "upper" && row.type !== "bonus",
						)
						.map((row, displayIndex) => {
							const rowBg =
								displayIndex % 2 === 0
									? "bg-[#f7faf8]"
									: "bg-white/60";

							return (
								<div
									key={row.key}
									className="grid"
									style={{
										gridTemplateColumns,
									}}
								>
									<div
										className={`min-w-0 border-r border-t border-[#d8e3dc] px-4 py-4 ${rowBg}`}
									>
										<p className="whitespace-nowrap text-sm font-black leading-tight text-slate-800">
											{row.label}
										</p>

										{row.helper && (
											<p className="mt-1 whitespace-nowrap text-[10px] font-medium leading-tight text-slate-400">
												{row.helper}
											</p>
										)}
									</div>

									{players.map((player, playerIndex) => {
										const display = formatCell(
											row,
											values,
											playerIndex,
										);

										return (
											<button
												key={`${row.key}-${player.name}-${playerIndex}`}
												type="button"
												onClick={() =>
													openCell(row, playerIndex)
												}
												disabled={isLocked}
												className={`flex min-h-[72px] min-w-0 flex-col items-center justify-center border-t border-[#d8e3dc] px-3 py-3 text-center transition ${rowBg} ${
													!isLocked
														? "hover:bg-emerald-50/60 active:bg-emerald-100/60"
														: ""
												}`}
											>
												<span
													className={`text-base font-black ${display.mainClass}`}
												>
													{display.main}
												</span>
											</button>
										);
									})}
								</div>
							);
						})}

					{/* TOTAL */}
					<div
						className="grid bg-[#dff0e7]"
						style={{
							gridTemplateColumns,
						}}
					>
						<div className="border-r border-t border-[#cfe0d6] px-4 py-4 text-sm font-black uppercase text-slate-900">
							Totalt
						</div>

						{players.map((player, playerIndex) => (
							<div
								key={`total-${player.name}-${playerIndex}`}
								className="flex items-center justify-center border-t border-[#cfe0d6] px-3 py-4"
							>
								<span className="text-xl font-black text-slate-950">
									{totals[playerIndex]}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* MODAL */}
			{modal &&
				createPortal(
					<div
						className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/35 p-3 backdrop-blur-[2px] sm:p-4"
						onClick={closeModal}
					>
						<div
							className="relative my-auto max-h-[92dvh] w-full max-w-[520px] overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl sm:p-6"
							onClick={(event) => event.stopPropagation()}
						>
							<button
								type="button"
								onClick={closeModal}
								className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
								aria-label="Stäng"
							>
								<X size={18} />
							</button>

							<div className="pr-10">
								<p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-600">
									{players[modal.playerIndex]?.name}
								</p>

								<h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
									{getModalTitle(modal.row)}
								</h2>

								<p className="mt-2 text-sm leading-6 text-slate-500">
									{getModalSubtitle(modal.row)}
								</p>
							</div>

							{/* COUNT */}
							{modal.kind === "count" && (
								<>
									<div className="mt-7 grid grid-cols-7 gap-2">
										{Array.from(
											{ length: 7 },
											(_, count) => (
												<button
													key={count}
													type="button"
													onClick={() =>
														setModal({
															...modal,
															count,
														})
													}
													className={`rounded-[14px] border px-2 py-3 text-center transition ${
														modal.count === count
															? "border-emerald-400 bg-emerald-50"
															: "border-[#d8e3dc] bg-white hover:bg-slate-50"
													}`}
												>
													<div className="font-black text-slate-900">
														{count}
													</div>

													<div className="mt-0.5 text-[10px] text-slate-400">
														{count *
															modal.multiplier}{" "}
														p
													</div>
												</button>
											),
										)}
									</div>

									<button
										type="button"
										onClick={() => {
											commitValue(
												modal.row.rowIndex,
												modal.playerIndex,
												modal.count * modal.multiplier,
											);

											closeModal();
										}}
										className="mt-7 w-full rounded-full bg-emerald-500 px-5 py-4 text-sm font-black text-white transition hover:bg-emerald-600 sm:text-base"
									>
										Bekräfta resultat
									</button>
								</>
							)}

							{/* FACE */}
							{modal.kind === "face" && (
								<>
									<div className="mt-7">
										{renderFaceButtons(
											modal.selectedFace,
											(face) =>
												setModal({
													...modal,
													selectedFace: face,
												}),
											modal.factor,
										)}
									</div>

									<button
										type="button"
										onClick={() => {
											commitValue(
												modal.row.rowIndex,
												modal.playerIndex,
												modal.selectedFace *
													modal.factor,
											);

											closeModal();
										}}
										className="mt-7 w-full rounded-full bg-emerald-500 px-5 py-4 text-sm font-black text-white transition hover:bg-emerald-600 sm:text-base"
									>
										Bekräfta resultat
									</button>
								</>
							)}

							{/* MULTI FACES */}
							{modal.kind === "multiFaces" && (
								<>
									<div className="mt-7 grid grid-cols-6 gap-2">
										{[1, 2, 3, 4, 5, 6].map((face) => {
											const selected =
												modal.selectedFaces.includes(
													face,
												);

											const disabled =
												!selected &&
												modal.selectedFaces.length >=
													modal.requiredFaces;

											return (
												<button
													key={face}
													type="button"
													disabled={disabled}
													onClick={() => {
														const next = selected
															? modal.selectedFaces.filter(
																	(item) =>
																		item !==
																		face,
																)
															: [
																	...modal.selectedFaces,
																	face,
																];

														setModal({
															...modal,
															selectedFaces: next,
														});
													}}
													className={`rounded-[14px] border px-3 py-3 text-center transition ${
														selected
															? "border-emerald-400 bg-emerald-50 text-slate-900"
															: "border-[#d8e3dc] bg-white text-slate-700"
													} ${
														disabled
															? "cursor-not-allowed opacity-35"
															: "hover:bg-slate-50"
													}`}
												>
													<div className="font-black">
														{face}
													</div>

													<div className="mt-0.5 text-[10px] text-slate-400">
														{face * modal.factor} p
													</div>
												</button>
											);
										})}
									</div>

									<div className="mt-5 rounded-[16px] bg-slate-50 px-4 py-3 text-center text-sm font-bold text-slate-700">
										Poäng:{" "}
										{modal.selectedFaces.length ===
										modal.requiredFaces
											? modal.selectedFaces.reduce(
													(sum, face) =>
														sum +
														face * modal.factor,
													0,
												)
											: 0}
									</div>

									<button
										type="button"
										onClick={() => {
											const score =
												modal.selectedFaces.length ===
												modal.requiredFaces
													? modal.selectedFaces.reduce(
															(sum, face) =>
																sum +
																face *
																	modal.factor,
															0,
														)
													: 0;

											commitValue(
												modal.row.rowIndex,
												modal.playerIndex,
												score,
											);

											closeModal();
										}}
										className="mt-5 w-full rounded-full bg-emerald-500 px-5 py-4 text-sm font-black text-white transition hover:bg-emerald-600 sm:text-base"
									>
										Bekräfta resultat
									</button>
								</>
							)}

							{/* FIXED */}
							{modal.kind === "fixed" && (
								<>
									<div className="mt-7 grid grid-cols-2 gap-3">
										<button
											type="button"
											onClick={() =>
												setModal({
													...modal,
													active: false,
												})
											}
											className={`rounded-[16px] border px-4 py-4 font-black transition ${
												!modal.active
													? "border-emerald-400 bg-emerald-50"
													: "border-[#d8e3dc] bg-white hover:bg-slate-50"
											}`}
										>
											Nej
										</button>

										<button
											type="button"
											onClick={() =>
												setModal({
													...modal,
													active: true,
												})
											}
											className={`rounded-[16px] border px-4 py-4 font-black transition ${
												modal.active
													? "border-emerald-400 bg-emerald-50"
													: "border-[#d8e3dc] bg-white hover:bg-slate-50"
											}`}
										>
											Ja ({modal.score} p)
										</button>
									</div>

									<button
										type="button"
										onClick={() => {
											commitValue(
												modal.row.rowIndex,
												modal.playerIndex,
												modal.active ? modal.score : 0,
											);

											closeModal();
										}}
										className="mt-7 w-full rounded-full bg-emerald-500 px-5 py-4 text-sm font-black text-white transition hover:bg-emerald-600 sm:text-base"
									>
										Bekräfta resultat
									</button>
								</>
							)}

							{/* FULL HOUSE */}
							{modal.kind === "fullHouse" && (
								<>
									<div className="mt-7 space-y-6">
										<div>
											<div className="mb-3 flex items-center justify-between">
												<p className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">
													Tretal
												</p>

												{modal.tripleFace > 0 && (
													<p className="text-xs font-bold text-emerald-600">
														{modal.tripleFace * 3}{" "}
														poäng
													</p>
												)}
											</div>

											{renderFaceButtons(
												modal.tripleFace,
												(face) =>
													setModal({
														...modal,
														tripleFace: face,
														pairFace:
															modal.pairFace ===
															face
																? 0
																: modal.pairFace,
													}),
												3,
											)}
										</div>

										<div className="h-px bg-slate-100" />

										<div>
											<div className="mb-3 flex items-center justify-between">
												<p className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">
													Par
												</p>

												{modal.pairFace > 0 && (
													<p className="text-xs font-bold text-emerald-600">
														{modal.pairFace * 2}{" "}
														poäng
													</p>
												)}
											</div>

											{renderFaceButtons(
												modal.pairFace,
												(face) => {
													if (
														face !== 0 &&
														face ===
															modal.tripleFace
													) {
														return;
													}

													setModal({
														...modal,
														pairFace: face,
													});
												},
												2,
											)}
										</div>
									</div>

									<div className="mt-6 rounded-[18px] bg-emerald-50 px-4 py-4 text-center">
										<p className="text-xs font-bold text-emerald-700">
											Totalt
										</p>

										<p className="mt-1 text-xl font-black text-emerald-800">
											{modal.tripleFace > 0 &&
											modal.pairFace > 0 &&
											modal.tripleFace !== modal.pairFace
												? modal.tripleFace * 3 +
													modal.pairFace * 2
												: 0}{" "}
											poäng
										</p>
									</div>

									<button
										type="button"
										onClick={() => {
											const score =
												modal.tripleFace > 0 &&
												modal.pairFace > 0 &&
												modal.tripleFace !==
													modal.pairFace
													? modal.tripleFace * 3 +
														modal.pairFace * 2
													: 0;

											commitValue(
												modal.row.rowIndex,
												modal.playerIndex,
												score,
											);

											closeModal();
										}}
										className="mt-5 w-full rounded-full bg-emerald-500 px-5 py-4 text-sm font-black text-white transition hover:bg-emerald-600 sm:text-base"
									>
										Bekräfta resultat
									</button>
								</>
							)}

							{/* HOUSE */}
							{modal.kind === "house" && (
								<>
									<div className="mt-7 space-y-6">
										<div>
											<p className="mb-3 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
												Första tretalet
											</p>

											{renderFaceButtons(
												modal.firstTriple,
												(face) =>
													setModal({
														...modal,
														firstTriple: face,
														secondTriple:
															modal.secondTriple ===
															face
																? 0
																: modal.secondTriple,
													}),
												3,
											)}
										</div>

										<div className="h-px bg-slate-100" />

										<div>
											<p className="mb-3 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
												Andra tretalet
											</p>

											{renderFaceButtons(
												modal.secondTriple,
												(face) => {
													if (
														face !== 0 &&
														face ===
															modal.firstTriple
													) {
														return;
													}

													setModal({
														...modal,
														secondTriple: face,
													});
												},
												3,
											)}
										</div>
									</div>

									<div className="mt-6 rounded-[18px] bg-emerald-50 px-4 py-4 text-center">
										<p className="text-xs font-bold text-emerald-700">
											Totalt
										</p>

										<p className="mt-1 text-xl font-black text-emerald-800">
											{modal.firstTriple > 0 &&
											modal.secondTriple > 0 &&
											modal.firstTriple !==
												modal.secondTriple
												? modal.firstTriple * 3 +
													modal.secondTriple * 3
												: 0}{" "}
											poäng
										</p>
									</div>

									<button
										type="button"
										onClick={() => {
											const score =
												modal.firstTriple > 0 &&
												modal.secondTriple > 0 &&
												modal.firstTriple !==
													modal.secondTriple
													? modal.firstTriple * 3 +
														modal.secondTriple * 3
													: 0;

											commitValue(
												modal.row.rowIndex,
												modal.playerIndex,
												score,
											);

											closeModal();
										}}
										className="mt-5 w-full rounded-full bg-emerald-500 px-5 py-4 text-sm font-black text-white transition hover:bg-emerald-600 sm:text-base"
									>
										Bekräfta resultat
									</button>
								</>
							)}

							{/* TOWER */}
							{modal.kind === "tower" && (
								<>
									<div className="mt-7 space-y-6">
										<div>
											<p className="mb-3 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
												Fyrtal
											</p>

											{renderFaceButtons(
												modal.fourFace,
												(face) =>
													setModal({
														...modal,
														fourFace: face,
														pairFace:
															modal.pairFace ===
															face
																? 0
																: modal.pairFace,
													}),
												4,
											)}
										</div>

										<div className="h-px bg-slate-100" />

										<div>
											<p className="mb-3 text-xs font-black uppercase tracking-[0.08em] text-slate-500">
												Par
											</p>

											{renderFaceButtons(
												modal.pairFace,
												(face) => {
													if (
														face !== 0 &&
														face === modal.fourFace
													) {
														return;
													}

													setModal({
														...modal,
														pairFace: face,
													});
												},
												2,
											)}
										</div>
									</div>

									<div className="mt-6 rounded-[18px] bg-emerald-50 px-4 py-4 text-center">
										<p className="text-xs font-bold text-emerald-700">
											Totalt
										</p>

										<p className="mt-1 text-xl font-black text-emerald-800">
											{modal.fourFace > 0 &&
											modal.pairFace > 0 &&
											modal.fourFace !== modal.pairFace
												? modal.fourFace * 4 +
													modal.pairFace * 2
												: 0}{" "}
											poäng
										</p>
									</div>

									<button
										type="button"
										onClick={() => {
											const score =
												modal.fourFace > 0 &&
												modal.pairFace > 0 &&
												modal.fourFace !==
													modal.pairFace
													? modal.fourFace * 4 +
														modal.pairFace * 2
													: 0;

											commitValue(
												modal.row.rowIndex,
												modal.playerIndex,
												score,
											);

											closeModal();
										}}
										className="mt-5 w-full rounded-full bg-emerald-500 px-5 py-4 text-sm font-black text-white transition hover:bg-emerald-600 sm:text-base"
									>
										Bekräfta resultat
									</button>
								</>
							)}

							{/* NUMBER */}
							{modal.kind === "number" && (
								<>
									<div className="mt-8 flex items-center justify-center gap-4">
										<button
											type="button"
											onClick={() =>
												setModal({
													...modal,
													value: Math.max(
														modal.min,
														modal.value - 1,
													),
												})
											}
											className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
										>
											<Minus size={20} />
										</button>

										<div className="min-w-[110px] text-center">
											<p className="text-4xl font-black text-slate-950">
												{modal.value}
											</p>

											<p className="mt-1 text-xs font-bold text-slate-400">
												poäng
											</p>
										</div>

										<button
											type="button"
											onClick={() =>
												setModal({
													...modal,
													value: Math.min(
														modal.max,
														modal.value + 1,
													),
												})
											}
											className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
										>
											<Plus size={20} />
										</button>
									</div>

									<input
										type="range"
										min={modal.min}
										max={modal.max}
										value={modal.value}
										onChange={(event) =>
											setModal({
												...modal,
												value: Number(
													event.target.value,
												),
											})
										}
										className="mt-6 w-full accent-emerald-500"
									/>

									<button
										type="button"
										onClick={() => {
											commitValue(
												modal.row.rowIndex,
												modal.playerIndex,
												modal.value,
											);

											closeModal();
										}}
										className="mt-7 w-full rounded-full bg-emerald-500 px-5 py-4 text-sm font-black text-white transition hover:bg-emerald-600 sm:text-base"
									>
										Bekräfta resultat
									</button>
								</>
							)}
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}
