import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, X } from "lucide-react";
import GridProtocol, {
	type ScoreCellValue,
	type GridProtocolRow,
} from "../components/scorecard/GridProtocol";

type Player = {
	name: string;
};

type YatzyProtocolProps = {
	gameName: string;
	players: Player[];
	values: ScoreCellValue[][];
	onChange: (
		rowIndex: number,
		playerIndex: number,
		value: ScoreCellValue,
	) => void;
	onBatchChange?: (
		updater: (prev: ScoreCellValue[][]) => ScoreCellValue[][],
	) => void;
	isLocked?: boolean;
};

type YatzyRowType =
	| "upper"
	| "bonus"
	| "pair"
	| "twoPair"
	| "kind3"
	| "kind4"
	| "straight"
	| "fullHouse"
	| "chance"
	| "yatzy";

type YatzyRow = {
	key: string;
	label: string;
	type: YatzyRowType;
	rowIndex: number;
	faceValue?: number;
	fixedScore?: number;
};

type CountModalState = {
	kind: "count";
	row: YatzyRow;
	playerIndex: number;
	count: number;
	maxCount: number;
	multiplier: number;
};

type FaceModalState = {
	kind: "face";
	row: YatzyRow;
	playerIndex: number;
	selectedFace: number;
	factor: number;
};

type TwoPairModalState = {
	kind: "twoPair";
	row: YatzyRow;
	playerIndex: number;
	selectedFaces: number[];
};

type FixedModalState = {
	kind: "fixed";
	row: YatzyRow;
	playerIndex: number;
	active: boolean;
	score: number;
};

type FullHouseModalState = {
	kind: "fullHouse";
	row: YatzyRow;
	playerIndex: number;
	tripleFace: number;
	pairFace: number;
};

type NumberModalState = {
	kind: "number";
	row: YatzyRow;
	playerIndex: number;
	value: number;
	min: number;
	max: number;
};

type ModalState =
	| CountModalState
	| FaceModalState
	| TwoPairModalState
	| FixedModalState
	| FullHouseModalState
	| NumberModalState
	| null;

const yatzyRows: YatzyRow[] = [
	{ key: "ones", label: "Ettor", type: "upper", rowIndex: 0, faceValue: 1 },
	{ key: "twos", label: "Tvåor", type: "upper", rowIndex: 1, faceValue: 2 },
	{ key: "threes", label: "Treor", type: "upper", rowIndex: 2, faceValue: 3 },
	{ key: "fours", label: "Fyror", type: "upper", rowIndex: 3, faceValue: 4 },
	{ key: "fives", label: "Femmor", type: "upper", rowIndex: 4, faceValue: 5 },
	{ key: "sixes", label: "Sexor", type: "upper", rowIndex: 5, faceValue: 6 },
	{ key: "bonus", label: "Bonus", type: "bonus", rowIndex: 6 },
	{ key: "pair", label: "Par", type: "pair", rowIndex: 7 },
	{ key: "two-pair", label: "Två par", type: "twoPair", rowIndex: 8 },
	{ key: "three-kind", label: "Triss", type: "kind3", rowIndex: 9 },
	{ key: "four-kind", label: "Fyrtal", type: "kind4", rowIndex: 10 },
	{
		key: "small-straight",
		label: "Liten stege",
		type: "straight",
		rowIndex: 11,
		fixedScore: 15,
	},
	{
		key: "large-straight",
		label: "Stor stege",
		type: "straight",
		rowIndex: 12,
		fixedScore: 20,
	},
	{ key: "full-house", label: "Kåk", type: "fullHouse", rowIndex: 13 },
	{ key: "chance", label: "Chans", type: "chance", rowIndex: 14 },
	{
		key: "yatzy",
		label: "Yatzy",
		type: "yatzy",
		rowIndex: 15,
		fixedScore: 50,
	},
];

const tenThousandRows: GridProtocolRow[] = Array.from(
	{ length: 10 },
	(_, index) => ({
		key: `round-${index + 1}`,
		label: `Runda ${index + 1}`,
	}),
);

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
	return getUpperSum(values, playerIndex) >= 63 ? 50 : 0;
}

function getRemainingToBonus(values: ScoreCellValue[][], playerIndex: number) {
	return Math.max(0, 63 - getUpperSum(values, playerIndex));
}

function getTotalScore(values: ScoreCellValue[][], playerIndex: number) {
	return yatzyRows.reduce((sum, row) => {
		if (row.type === "bonus") {
			return sum + getBonusScore(values, playerIndex);
		}

		return sum + getNumericValue(values, row.rowIndex, playerIndex);
	}, 0);
}

function syncBonusRow(next: ScoreCellValue[][], playerCount: number) {
	if (!next[6]) return next;

	for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
		const upperSum = [0, 1, 2, 3, 4, 5].reduce((sum, rowIndex) => {
			const value = next[rowIndex]?.[playerIndex];
			return sum + (typeof value === "number" ? value : 0);
		}, 0);

		next[6][playerIndex] = upperSum >= 63 ? 50 : 0;
	}

	return next;
}

function formatCellValue(
	row: YatzyRow,
	values: ScoreCellValue[][],
	playerIndex: number,
) {
	if (row.type === "bonus") {
		const bonus = getBonusScore(values, playerIndex);
		const remaining = getRemainingToBonus(values, playerIndex);

		if (bonus > 0) {
			return {
				main: "50",
				sub: "Bonus klar",
				color: "text-emerald-500",
				subColor: "text-emerald-400",
			};
		}

		return {
			main: "0",
			sub: `${remaining} kvar`,
			color: "text-slate-700",
			subColor: "text-amber-500",
		};
	}

	const value = values[row.rowIndex]?.[playerIndex];
	if (value === "" || typeof value !== "number") {
		return {
			main: "—",
			sub: "",
			color: "text-slate-300",
			subColor: "text-slate-300",
		};
	}

	return {
		main: String(value),
		sub: "",
		color: value > 0 ? "text-emerald-500" : "text-slate-700",
		subColor: "text-slate-300",
	};
}

function getPairOptions(factor: number) {
	return Array.from({ length: 7 }, (_, i) => i).map((face) => ({
		face,
		score: face === 0 ? 0 : face * factor,
	}));
}

function getDisplayLabelForModal(row: YatzyRow) {
	switch (row.type) {
		case "upper":
			return `Hur många ${row.label.toLowerCase()}?`;
		case "pair":
			return "Vilket par fick du?";
		case "twoPair":
			return "Välj två olika par";
		case "kind3":
			return "Vilken triss fick du?";
		case "kind4":
			return "Vilket fyrtal fick du?";
		case "straight":
			return "Fick du stegen?";
		case "fullHouse":
			return "Välj triss och par";
		case "chance":
			return "Ange summan för chans";
		case "yatzy":
			return "Fick du Yatzy?";
		default:
			return row.label;
	}
}

function saveValueWithBonus(
	values: ScoreCellValue[][],
	rowIndex: number,
	playerIndex: number,
	nextValue: number,
	playerCount: number,
) {
	const next = cloneValues(values);
	next[rowIndex][playerIndex] = nextValue;
	return syncBonusRow(next, playerCount);
}

function getMobileFirstColWidth(playerCount: number) {
	if (playerCount >= 5) return "54px";
	if (playerCount === 4) return "58px";
	if (playerCount === 3) return "62px";
	return "66px";
}

function getMobilePlayerMinWidth(playerCount: number) {
	if (playerCount >= 5) return "34px";
	if (playerCount === 4) return "38px";
	if (playerCount === 3) return "42px";
	return "48px";
}

function YatzyTable({
	players,
	values,
	onChange,
	onBatchChange,
	isLocked = false,
}: Omit<YatzyProtocolProps, "gameName">) {
	const [modal, setModal] = useState<ModalState>(null);

	useEffect(() => {
		if (!modal) return;

		const previousBodyOverflow = document.body.style.overflow;
		const previousHtmlOverflow = document.documentElement.style.overflow;

		document.body.style.overflow = "hidden";
		document.documentElement.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = previousBodyOverflow;
			document.documentElement.style.overflow = previousHtmlOverflow;
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

	const openCell = (row: YatzyRow, playerIndex: number) => {
		if (isLocked || row.type === "bonus") return;

		const currentValue = getNumericValue(values, row.rowIndex, playerIndex);

		switch (row.type) {
			case "upper": {
				const faceValue = row.faceValue ?? 1;
				setModal({
					kind: "count",
					row,
					playerIndex,
					count: Math.floor(currentValue / faceValue),
					maxCount: 5,
					multiplier: faceValue,
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

			case "twoPair": {
				const faces: number[] = [];
				if (currentValue > 0) {
					for (let first = 1; first <= 6; first++) {
						for (let second = first + 1; second <= 6; second++) {
							if (2 * first + 2 * second === currentValue) {
								faces.push(first, second);
							}
						}
					}
				}

				setModal({
					kind: "twoPair",
					row,
					playerIndex,
					selectedFaces: faces.slice(0, 2),
				});
				return;
			}

			case "straight":
				setModal({
					kind: "fixed",
					row,
					playerIndex,
					active: currentValue === (row.fixedScore ?? 0),
					score: row.fixedScore ?? 0,
				});
				return;

			case "fullHouse": {
				let tripleFace = 0;
				let pairFace = 0;

				if (currentValue > 0) {
					for (let t = 1; t <= 6; t++) {
						for (let p = 1; p <= 6; p++) {
							if (t !== p && 3 * t + 2 * p === currentValue) {
								tripleFace = t;
								pairFace = p;
							}
						}
					}
				}

				setModal({
					kind: "fullHouse",
					row,
					playerIndex,
					tripleFace,
					pairFace,
				});
				return;
			}

			case "chance":
				setModal({
					kind: "number",
					row,
					playerIndex,
					value: currentValue,
					min: 0,
					max: 30,
				});
				return;

			case "yatzy":
				setModal({
					kind: "fixed",
					row,
					playerIndex,
					active: currentValue === (row.fixedScore ?? 0),
					score: row.fixedScore ?? 0,
				});
				return;

			default:
				return;
		}
	};

	const closeModal = () => setModal(null);

	const commitValue = (
		rowIndex: number,
		playerIndex: number,
		nextValue: number,
	) => {
		if (onBatchChange) {
			onBatchChange((prev) =>
				saveValueWithBonus(
					prev,
					rowIndex,
					playerIndex,
					nextValue,
					players.length,
				),
			);
			return;
		}

		onChange(rowIndex, playerIndex, nextValue);

		const nextValues = saveValueWithBonus(
			values,
			rowIndex,
			playerIndex,
			nextValue,
			players.length,
		);

		for (let index = 0; index < players.length; index++) {
			onChange(6, index, nextValues[6][index]);
		}
	};

	const upperRows = yatzyRows.slice(0, 6);
	const lowerRows = yatzyRows.slice(7);

	const mobileFirstColWidth = getMobileFirstColWidth(players.length);
	const mobilePlayerMinWidth = getMobilePlayerMinWidth(players.length);
	const desktopFirstColWidth = "96px";

	const gridTemplateMobile = `${mobileFirstColWidth} repeat(${players.length}, minmax(${mobilePlayerMinWidth}, 1fr))`;
	const gridTemplateDesktop = `${desktopFirstColWidth} repeat(${players.length}, minmax(0, 1fr))`;

	return (
		<>
			<div className="w-full overflow-x-hidden">
				<div className="w-full overflow-hidden rounded-[22px] border border-[#dbe5df] bg-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.03)] sm:min-w-[780px] sm:rounded-[28px]">
					<div
						className="grid bg-[#e7f1eb]"
						style={{
							gridTemplateColumns: gridTemplateMobile,
						}}
					>
						
						<div className="flex items-center justify-center border-b border-r border-[#d8e3dc] px-1 py-2 text-center text-[0.58rem] font-black uppercase tracking-[0.01em] text-slate-800 sm:px-4 sm:py-4 sm:text-sm sm:tracking-[0.08em]">
							Yatzy
						</div>

						{players.map((player) => (
							<div
								key={player.name}
								className="border-b border-[#d8e3dc] px-0.5 py-2 text-center text-[0.56rem] font-black text-slate-800 sm:px-4 sm:py-4 sm:text-sm sm:tracking-[0.08em]"
							>
								<span className="block truncate leading-tight">
									{player.name}
								</span>
							</div>
						))}
					</div>

					{upperRows.map((row, rowIndex) => {
						const bg =
							rowIndex % 2 === 0 ? "bg-white/60" : "bg-[#f7faf8]";

						return (
							<div
								key={row.key}
								className="grid"
								style={{
									gridTemplateColumns: gridTemplateMobile,
								}}
							>
								<div
									className={`border-r border-t border-[#d8e3dc] px-1 py-2 text-[0.62rem] font-black text-slate-900 sm:px-4 sm:py-4 sm:text-[1rem] ${bg}`}
								>
									{row.label}
								</div>

								{players.map((player, playerIndex) => {
									const display = formatCellValue(
										row,
										values,
										playerIndex,
									);

									return (
										<button
											key={`${row.key}-${player.name}`}
											type="button"
											onClick={() =>
												openCell(row, playerIndex)
											}
											disabled={isLocked}
											className={`flex min-h-[38px] flex-col items-center justify-center border-t border-[#d8e3dc] px-0 py-1 text-center transition sm:min-h-[62px] sm:px-4 sm:py-3 ${bg} ${
												isLocked
													? "cursor-default"
													: "hover:bg-emerald-50/50"
											}`}
										>
											<span
												className={`text-[0.72rem] font-black sm:text-[1.05rem] ${display.color}`}
											>
												{display.main}
											</span>
										</button>
									);
								})}
							</div>
						);
					})}

					<div
						className="grid bg-[#eef7f1]"
						style={{
							gridTemplateColumns: gridTemplateMobile,
						}}
					>
						<div className="border-r border-t border-[#d8e3dc] px-1 py-2 text-[0.62rem] font-black text-slate-900 sm:px-4 sm:py-4 sm:text-[1rem]">
							Summa
						</div>

						{players.map((player, playerIndex) => (
							<div
								key={`upper-${player.name}`}
								className="flex min-h-[40px] flex-col items-center justify-center border-t border-[#d8e3dc] px-0 py-1 text-center sm:min-h-[62px] sm:px-4 sm:py-3"
							>
								<span className="text-[0.72rem] font-black text-slate-900 sm:text-[1.05rem]">
									{upperSums[playerIndex]}
								</span>
								<span className="mt-0.5 text-[7px] font-semibold text-slate-500 sm:mt-1 sm:text-xs">
									{getRemainingToBonus(values, playerIndex) >
									0
										? `${getRemainingToBonus(values, playerIndex)} kvar`
										: "63 uppnådd"}
								</span>
							</div>
						))}
					</div>

					<div
						className="grid bg-[#fffdf7]"
						style={{
							gridTemplateColumns: gridTemplateMobile,
						}}
					>
						<div className="border-r border-t border-[#d8e3dc] px-1 py-2 text-[0.62rem] font-black text-slate-900 sm:px-4 sm:py-4 sm:text-[1rem]">
							Bonus
						</div>

						{players.map((player, playerIndex) => {
							const display = formatCellValue(
								yatzyRows[6],
								values,
								playerIndex,
							);

							return (
								<div
									key={`bonus-${player.name}`}
									className="flex min-h-[40px] flex-col items-center justify-center border-t border-[#d8e3dc] px-0 py-1 text-center sm:min-h-[62px] sm:px-4 sm:py-3"
								>
									<span
										className={`text-[0.72rem] font-black sm:text-[1.05rem] ${display.color}`}
									>
										{display.main}
									</span>
									<span
										className={`mt-0.5 text-[7px] font-semibold sm:mt-1 sm:text-xs ${display.subColor}`}
									>
										{display.sub}
									</span>
								</div>
							);
						})}
					</div>

					{lowerRows.map((row, rowIndex) => {
						const bg =
							rowIndex % 2 === 0 ? "bg-white/60" : "bg-[#f7faf8]";

						return (
							<div
								key={row.key}
								className="grid"
								style={{
									gridTemplateColumns: gridTemplateMobile,
								}}
							>
								<div
									className={`border-r border-t border-[#d8e3dc] px-1 py-2 text-[0.62rem] font-black text-slate-900 sm:px-4 sm:py-4 sm:text-[1rem] ${bg}`}
								>
									{row.label}
								</div>

								{players.map((player, playerIndex) => {
									const display = formatCellValue(
										row,
										values,
										playerIndex,
									);

									return (
										<button
											key={`${row.key}-${player.name}`}
											type="button"
											onClick={() =>
												openCell(row, playerIndex)
											}
											disabled={isLocked}
											className={`flex min-h-[40px] flex-col items-center justify-center border-t border-[#d8e3dc] px-0 py-1 text-center transition sm:min-h-[62px] sm:px-4 sm:py-3 ${bg} ${
												isLocked
													? "cursor-default"
													: "hover:bg-emerald-50/50"
											}`}
										>
											<span
												className={`text-[0.72rem] font-black sm:text-[1.05rem] ${display.color}`}
											>
												{display.main}
											</span>
										</button>
									);
								})}
							</div>
						);
					})}

					<div
						className="grid bg-[#dff0e7]"
						style={{
							gridTemplateColumns: gridTemplateMobile,
						}}
					>
						<div className="border-r border-t border-[#cfe0d6] px-1 py-2 text-[0.66rem] font-black text-slate-900 sm:px-4 sm:py-4 sm:text-[1.1rem]">
							Totalt
						</div>

						{players.map((player, index) => (
							<div
								key={`total-${player.name}`}
								className="flex items-center justify-center border-t border-[#cfe0d6] px-0 py-2 sm:px-4 sm:py-4"
							>
								<span className="text-[0.8rem] font-black text-emerald-600 sm:text-[1.35rem]">
									{totals[index]}
								</span>
							</div>
						))}
					</div>

					<style>{`
						@media (min-width: 640px) {
							.grid[style*="repeat(${players.length}, minmax"] {
								grid-template-columns: ${gridTemplateDesktop} !important;
							}
						}
					`}</style>
				</div>
			</div>

			{modal &&
				createPortal(
					<div
						className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/30 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6"
						onClick={closeModal}
					>
						<div
							className="relative my-auto w-full max-w-[560px] rounded-[24px] bg-white p-4 shadow-[0_24px_60px_rgba(0,0,0,0.18)] sm:rounded-[28px] sm:p-8"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="text-center">
								<h2 className="text-[1.35rem] font-black text-slate-900 sm:text-[2rem]">
									{modal.row.label} –{" "}
									{players[modal.playerIndex].name}
								</h2>
								<p className="mt-2 text-[0.95rem] text-slate-500 sm:text-[1.1rem]">
									{getDisplayLabelForModal(modal.row)}
								</p>
							</div>

							{modal.kind === "count" && (
								<>
									<div className="mt-6 flex items-center justify-center gap-3 sm:mt-8 sm:gap-4">
										<button
											type="button"
											onClick={() =>
												setModal({
													...modal,
													count: Math.max(
														0,
														modal.count - 1,
													),
												})
											}
											className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dfe9e3] text-slate-900 transition hover:bg-[#d3dfd8] sm:h-12 sm:w-12"
										>
											<Minus size={20} />
										</button>

										<div className="min-w-[92px] text-center sm:min-w-[110px]">
											<div className="text-[1.6rem] font-black text-slate-900 sm:text-[2rem]">
												{modal.count}
											</div>
											<div className="text-xs text-slate-500 sm:text-sm">
												poäng:{" "}
												{modal.count * modal.multiplier}
											</div>
										</div>

										<button
											type="button"
											onClick={() =>
												setModal({
													...modal,
													count: Math.min(
														modal.maxCount,
														modal.count + 1,
													),
												})
											}
											className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dfe9e3] text-slate-900 transition hover:bg-[#d3dfd8] sm:h-12 sm:w-12"
										>
											<Plus size={20} />
										</button>
									</div>

									<div className="mt-6 sm:mt-8">
										<button
											type="button"
											onClick={() => {
												commitValue(
													modal.row.rowIndex,
													modal.playerIndex,
													modal.count *
														modal.multiplier,
												);
												closeModal();
											}}
											className="w-full rounded-[16px] bg-emerald-500 px-5 py-4 text-[1rem] font-bold text-white transition hover:bg-emerald-600 sm:rounded-[18px] sm:py-5 sm:text-[1.1rem]"
										>
											Bekräfta resultat
										</button>
									</div>
								</>
							)}

							{modal.kind === "face" && (
								<>
									<div className="mt-6 grid grid-cols-3 gap-2 sm:mt-8 sm:grid-cols-4 sm:gap-3">
										{getPairOptions(modal.factor).map(
											(option) => (
												<button
													key={option.face}
													type="button"
													onClick={() =>
														setModal({
															...modal,
															selectedFace:
																option.face,
														})
													}
													className={`rounded-[14px] border px-3 py-3 text-center transition sm:rounded-[18px] sm:px-4 sm:py-4 ${
														modal.selectedFace ===
														option.face
															? "border-emerald-400 bg-emerald-50"
															: "border-[#d8e3dc] bg-white hover:bg-slate-50"
													}`}
												>
													<div className="text-[0.95rem] font-black text-slate-900 sm:text-[1.1rem]">
														{option.face === 0
															? "0"
															: `${option.face}or`}
													</div>
													<div className="mt-1 text-xs text-slate-500 sm:text-sm">
														{option.score} p
													</div>
												</button>
											),
										)}
									</div>

									<div className="mt-6 sm:mt-8">
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
											className="w-full rounded-[16px] bg-emerald-500 px-5 py-4 text-[1rem] font-bold text-white transition hover:bg-emerald-600 sm:rounded-[18px] sm:py-5 sm:text-[1.1rem]"
										>
											Bekräfta resultat
										</button>
									</div>
								</>
							)}

							{modal.kind === "twoPair" && (
								<>
									<div className="mt-6 grid grid-cols-3 gap-2 sm:mt-8 sm:gap-3">
										{[1, 2, 3, 4, 5, 6].map((face) => {
											const selected =
												modal.selectedFaces.includes(
													face,
												);

											return (
												<button
													key={face}
													type="button"
													onClick={() => {
														const alreadySelected =
															modal.selectedFaces.includes(
																face,
															);

														if (alreadySelected) {
															setModal({
																...modal,
																selectedFaces:
																	modal.selectedFaces.filter(
																		(
																			value,
																		) =>
																			value !==
																			face,
																	),
															});
															return;
														}

														if (
															modal.selectedFaces
																.length >= 2
														)
															return;

														setModal({
															...modal,
															selectedFaces: [
																...modal.selectedFaces,
																face,
															].sort(
																(a, b) => a - b,
															),
														});
													}}
													className={`rounded-[14px] border px-3 py-3 text-center transition sm:rounded-[18px] sm:px-4 sm:py-4 ${
														selected
															? "border-emerald-400 bg-emerald-50"
															: "border-[#d8e3dc] bg-white hover:bg-slate-50"
													}`}
												>
													<div className="text-[0.95rem] font-black text-slate-900 sm:text-[1.1rem]">
														{face}or
													</div>
													<div className="mt-1 text-xs text-slate-500 sm:text-sm">
														{face * 2} p
													</div>
												</button>
											);
										})}
									</div>

									<div className="mt-5 text-center text-[1rem] font-semibold text-slate-600 sm:mt-6 sm:text-[1.1rem]">
										Poäng:{" "}
										{modal.selectedFaces.length === 2
											? modal.selectedFaces[0] * 2 +
												modal.selectedFaces[1] * 2
											: 0}
									</div>

									<div className="mt-6 sm:mt-8">
										<button
											type="button"
											onClick={() => {
												const score =
													modal.selectedFaces
														.length === 2
														? modal
																.selectedFaces[0] *
																2 +
															modal
																.selectedFaces[1] *
																2
														: 0;

												commitValue(
													modal.row.rowIndex,
													modal.playerIndex,
													score,
												);
												closeModal();
											}}
											className="w-full rounded-[16px] bg-emerald-500 px-5 py-4 text-[1rem] font-bold text-white transition hover:bg-emerald-600 sm:rounded-[18px] sm:py-5 sm:text-[1.1rem]"
										>
											Bekräfta resultat
										</button>
									</div>
								</>
							)}

							{modal.kind === "fixed" && (
								<>
									<div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8">
										<button
											type="button"
											onClick={() =>
												setModal({
													...modal,
													active: false,
												})
											}
											className={`rounded-[16px] border px-4 py-4 text-[0.95rem] font-semibold transition sm:rounded-[18px] sm:px-5 sm:py-5 sm:text-[1.05rem] ${
												!modal.active
													? "border-emerald-400 bg-emerald-50 text-slate-900"
													: "border-[#d8e3dc] bg-white text-slate-700 hover:bg-slate-50"
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
											className={`rounded-[16px] border px-4 py-4 text-[0.95rem] font-semibold transition sm:rounded-[18px] sm:px-5 sm:py-5 sm:text-[1.05rem] ${
												modal.active
													? "border-emerald-400 bg-emerald-50 text-slate-900"
													: "border-[#d8e3dc] bg-white text-slate-700 hover:bg-slate-50"
											}`}
										>
											Ja ({modal.score} p)
										</button>
									</div>

									<div className="mt-6 sm:mt-8">
										<button
											type="button"
											onClick={() => {
												commitValue(
													modal.row.rowIndex,
													modal.playerIndex,
													modal.active
														? modal.score
														: 0,
												);
												closeModal();
											}}
											className="w-full rounded-[16px] bg-emerald-500 px-5 py-4 text-[1rem] font-bold text-white transition hover:bg-emerald-600 sm:rounded-[18px] sm:py-5 sm:text-[1.1rem]"
										>
											Bekräfta resultat
										</button>
									</div>
								</>
							)}

							{modal.kind === "fullHouse" && (
								<>
									<div className="mt-6 grid gap-5 sm:mt-8 sm:grid-cols-2 sm:gap-6">
										<div>
											<p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.08em] text-slate-500 sm:text-sm">
												Triss
											</p>
											<div className="grid grid-cols-3 gap-2 sm:gap-3">
												{[0, 1, 2, 3, 4, 5, 6].map(
													(face) => (
														<button
															key={`triple-${face}`}
															type="button"
															onClick={() =>
																setModal({
																	...modal,
																	tripleFace:
																		face,
																	pairFace:
																		modal.pairFace ===
																		face
																			? 0
																			: modal.pairFace,
																})
															}
															className={`rounded-[14px] border px-3 py-3 text-center transition sm:rounded-[16px] ${
																modal.tripleFace ===
																face
																	? "border-emerald-400 bg-emerald-50"
																	: "border-[#d8e3dc] bg-white hover:bg-slate-50"
															}`}
														>
															{face === 0
																? "0"
																: face}
														</button>
													),
												)}
											</div>
										</div>

										<div>
											<p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.08em] text-slate-500 sm:text-sm">
												Par
											</p>
											<div className="grid grid-cols-3 gap-2 sm:gap-3">
												{[0, 1, 2, 3, 4, 5, 6].map(
													(face) => {
														const disabled =
															face !== 0 &&
															face ===
																modal.tripleFace;

														return (
															<button
																key={`pair-${face}`}
																type="button"
																disabled={
																	disabled
																}
																onClick={() =>
																	setModal({
																		...modal,
																		pairFace:
																			face,
																	})
																}
																className={`rounded-[14px] border px-3 py-3 text-center transition sm:rounded-[16px] ${
																	modal.pairFace ===
																	face
																		? "border-emerald-400 bg-emerald-50"
																		: "border-[#d8e3dc] bg-white hover:bg-slate-50"
																} ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
															>
																{face === 0
																	? "0"
																	: face}
															</button>
														);
													},
												)}
											</div>
										</div>
									</div>

									<div className="mt-5 text-center text-[1rem] font-semibold text-slate-600 sm:mt-6 sm:text-[1.1rem]">
										Poäng:{" "}
										{modal.tripleFace > 0 &&
										modal.pairFace > 0
											? modal.tripleFace * 3 +
												modal.pairFace * 2
											: 0}
									</div>

									<div className="mt-6 sm:mt-8">
										<button
											type="button"
											onClick={() => {
												const score =
													modal.tripleFace > 0 &&
													modal.pairFace > 0
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
											className="w-full rounded-[16px] bg-emerald-500 px-5 py-4 text-[1rem] font-bold text-white transition hover:bg-emerald-600 sm:rounded-[18px] sm:py-5 sm:text-[1.1rem]"
										>
											Bekräfta resultat
										</button>
									</div>
								</>
							)}

							{modal.kind === "number" && (
								<>
									<div className="mt-6 flex items-center justify-center gap-3 sm:mt-8 sm:gap-4">
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
											className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dfe9e3] text-slate-900 transition hover:bg-[#d3dfd8] sm:h-12 sm:w-12"
										>
											<Minus size={20} />
										</button>

										<div className="min-w-[92px] text-center sm:min-w-[110px]">
											<div className="text-[1.6rem] font-black text-slate-900 sm:text-[2rem]">
												{modal.value}
											</div>
											<div className="text-xs text-slate-500 sm:text-sm">
												poäng
											</div>
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
											className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dfe9e3] text-slate-900 transition hover:bg-[#d3dfd8] sm:h-12 sm:w-12"
										>
											<Plus size={20} />
										</button>
									</div>

									<div className="mt-6 sm:mt-8">
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
											className="w-full rounded-[16px] bg-emerald-500 px-5 py-4 text-[1rem] font-bold text-white transition hover:bg-emerald-600 sm:rounded-[18px] sm:py-5 sm:text-[1.1rem]"
										>
											Bekräfta resultat
										</button>
									</div>
								</>
							)}

							<button
								type="button"
								onClick={closeModal}
								className="absolute right-3 top-3 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 sm:right-4 sm:top-4"
								aria-label="Stäng"
							>
								<X size={22} />
							</button>
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}

export default function YatzyProtocol({
	gameName,
	players,
	values,
	onChange,
	onBatchChange,
	isLocked = false,
}: YatzyProtocolProps) {
	const isTenThousand =
		gameName.trim() === "10000" || gameName.toLowerCase().includes("10000");

	if (isTenThousand) {
		return (
			<GridProtocol
				titleCellLabel={gameName.toUpperCase()}
				rows={tenThousandRows}
				players={players}
				values={values}
				onChange={onChange}
			/>
		);
	}

	return (
		<YatzyTable
			players={players}
			values={values}
			onChange={onChange}
			onBatchChange={onBatchChange}
			isLocked={isLocked}
		/>
	);
}
