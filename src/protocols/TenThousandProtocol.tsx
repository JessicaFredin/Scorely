import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, X } from "lucide-react";

export type ScoreCellValue = number | "";

type Player = {
	name: string;
};

type TenThousandProtocolProps = {
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

type ModalState = {
	rowIndex: number;
	playerIndex: number;
	value: number;
} | null;

const INITIAL_ROWS = 5;
const WIN_TARGET = 10000;
const ENTRY_TARGET = 1000;

function cloneValues(values: ScoreCellValue[][]) {
	return values.map((row) => [...row]);
}

function createEmptyRow(playerCount: number): ScoreCellValue[] {
	return Array.from({ length: playerCount }, () => "");
}

function ensureMinimumRows(
	values: ScoreCellValue[][],
	playerCount: number,
	minRows = INITIAL_ROWS,
) {
	const next = cloneValues(values);

	while (next.length < minRows) {
		next.push(createEmptyRow(playerCount));
	}

	return next;
}

function getCommittedRoundScore(
	previousTotal: number,
	rawValue: ScoreCellValue,
) {
	if (typeof rawValue !== "number") {
		return 0;
	}

	if (previousTotal >= ENTRY_TARGET) {
		return rawValue;
	}

	return rawValue >= ENTRY_TARGET ? rawValue : 0;
}

function getPlayerTotals(values: ScoreCellValue[][], playerCount: number) {
	return Array.from({ length: playerCount }, (_, playerIndex) => {
		let runningTotal = 0;

		for (let rowIndex = 0; rowIndex < values.length; rowIndex++) {
			const rawValue = values[rowIndex]?.[playerIndex] ?? "";

			const committed = getCommittedRoundScore(runningTotal, rawValue);

			runningTotal += committed;
		}

		return runningTotal;
	});
}

function getPlayerTotalBeforeRow(
	values: ScoreCellValue[][],
	playerIndex: number,
	rowIndex: number,
) {
	let runningTotal = 0;

	for (
		let currentRowIndex = 0;
		currentRowIndex < rowIndex;
		currentRowIndex++
	) {
		const rawValue = values[currentRowIndex]?.[playerIndex] ?? "";

		const committed = getCommittedRoundScore(runningTotal, rawValue);

		runningTotal += committed;
	}

	return runningTotal;
}

function getPlayerTotalAfterRow(
	values: ScoreCellValue[][],
	playerIndex: number,
	rowIndex: number,
) {
	let runningTotal = 0;

	for (
		let currentRowIndex = 0;
		currentRowIndex <= rowIndex;
		currentRowIndex++
	) {
		const rawValue = values[currentRowIndex]?.[playerIndex] ?? "";

		const committed = getCommittedRoundScore(runningTotal, rawValue);

		runningTotal += committed;
	}

	return runningTotal;
}

function hasWinner(values: ScoreCellValue[][], playerCount: number) {
	return getPlayerTotals(values, playerCount).some(
		(total) => total >= WIN_TARGET,
	);
}

function getStatusLabel(total: number) {
	return total >= ENTRY_TARGET ? "På tavlan" : "Ej inne";
}

function getStatusClass(total: number) {
	return total >= ENTRY_TARGET ? "text-emerald-600" : "text-amber-500";
}

function getCellDisplay(
	values: ScoreCellValue[][],
	rowIndex: number,
	playerIndex: number,
) {
	const rawValue = values[rowIndex]?.[playerIndex] ?? "";

	const totalBefore = getPlayerTotalBeforeRow(values, playerIndex, rowIndex);

	const totalAfter = getPlayerTotalAfterRow(values, playerIndex, rowIndex);

	return {
		rawValue,
		totalBefore,
		totalAfter,

		isOnBoardBeforeRow: totalBefore >= ENTRY_TARGET,

		isOnBoardAfterRow: totalAfter >= ENTRY_TARGET,
	};
}

function normalizeEntryValue(value: number, isOnBoard: boolean) {
	const safeValue = Math.max(0, value);

	if (isOnBoard) {
		return safeValue;
	}

	if (safeValue === 0) {
		return 0;
	}

	if (safeValue < ENTRY_TARGET) {
		return ENTRY_TARGET;
	}

	return safeValue;
}

const quickScores = [
	0, 50, 100, 200, 300, 400, 500, 600, 750, 1000, 1500, 2000, 3000,
];

export default function TenThousandProtocol({
	gameName,
	players,
	values,
	onChange,
	onBatchChange,
	isLocked = false,
}: TenThousandProtocolProps) {
	const [modal, setModal] = useState<ModalState>(null);

	useEffect(() => {
		if (!modal) {
			return;
		}

		const previousBodyOverflow = document.body.style.overflow;

		const previousHtmlOverflow = document.documentElement.style.overflow;

		document.body.style.overflow = "hidden";

		document.documentElement.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = previousBodyOverflow;

			document.documentElement.style.overflow = previousHtmlOverflow;
		};
	}, [modal]);

	const safeValues = useMemo(
		() => ensureMinimumRows(values, players.length),
		[values, players.length],
	);

	const totals = useMemo(
		() => getPlayerTotals(safeValues, players.length),
		[safeValues, players.length],
	);

	const openCell = (rowIndex: number, playerIndex: number) => {
		if (isLocked) {
			return;
		}

		const currentValue = safeValues[rowIndex]?.[playerIndex];

		const totalBefore = getPlayerTotalBeforeRow(
			safeValues,
			playerIndex,
			rowIndex,
		);

		const isOnBoard = totalBefore >= ENTRY_TARGET;

		setModal({
			rowIndex,
			playerIndex,

			value:
				typeof currentValue === "number"
					? normalizeEntryValue(currentValue, isOnBoard)
					: 0,
		});
	};

	const closeModal = () => {
		setModal(null);
	};

	const commitValue = (
		rowIndex: number,
		playerIndex: number,
		nextValue: number,
	) => {
		/*
			ScorecardPage skickar in
			onBatchChange.

			Vi använder det här eftersom
			vi både kan ändra cellen OCH
			lägga till en ny rad i samma
			uppdatering.
		*/

		if (onBatchChange) {
			onBatchChange((prev) => {
				const next = ensureMinimumRows(prev, players.length);

				const totalBefore = getPlayerTotalBeforeRow(
					next,
					playerIndex,
					rowIndex,
				);

				const isOnBoard = totalBefore >= ENTRY_TARGET;

				next[rowIndex][playerIndex] = normalizeEntryValue(
					nextValue,
					isOnBoard,
				);

				const lastRowIndex = next.length - 1;

				const winnerExists = hasWinner(next, players.length);

				/*
						VIKTIGT:

						Varje spelare är
						oberoende.

						Så fort NÅGON spelare
						fyller i sin ruta på
						den sista raden skapas
						en ny rad.

						Vi väntar alltså INTE
						på att de andra spelarna
						ska fylla i sina rutor.
					*/

				if (rowIndex === lastRowIndex && !winnerExists) {
					next.push(createEmptyRow(players.length));
				}

				return next;
			});

			return;
		}

		/*
			Fallback om komponenten någon
			gång används utan onBatchChange.
		*/

		const totalBefore = getPlayerTotalBeforeRow(
			safeValues,
			playerIndex,
			rowIndex,
		);

		const isOnBoard = totalBefore >= ENTRY_TARGET;

		onChange(
			rowIndex,
			playerIndex,
			normalizeEntryValue(nextValue, isOnBoard),
		);
	};

	const modalTotalBefore =
		modal !== null
			? getPlayerTotalBeforeRow(
					safeValues,
					modal.playerIndex,
					modal.rowIndex,
				)
			: 0;

	const modalPlayerIsOnBoard = modalTotalBefore >= ENTRY_TARGET;

	const modalValueIsValid =
		modal === null
			? false
			: modalPlayerIsOnBoard ||
				modal.value === 0 ||
				modal.value >= ENTRY_TARGET;

	return (
		<>
			<div className="overflow-x-auto">
				<div className="min-w-[760px] overflow-hidden rounded-[28px] border border-[#dbe5df] bg-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
					{/* HEADER */}

					<div
						className="grid bg-[#e7f1eb]"
						style={{
							gridTemplateColumns: `90px repeat(${players.length}, minmax(0, 1fr))`,
						}}
					>
						<div className="border-b border-r border-[#d8e3dc] px-4 py-4 text-sm font-black uppercase tracking-[0.08em] text-slate-800">
							{gameName}
						</div>

						{players.map((player) => (
							<div
								key={player.name}
								className="border-b border-[#d8e3dc] px-4 py-4 text-center text-sm font-black tracking-[0.08em] text-slate-800"
							>
								{player.name}
							</div>
						))}
					</div>

					{/* STATUS */}

					<div
						className="grid bg-[#eef7f1]"
						style={{
							gridTemplateColumns: `90px repeat(${players.length}, minmax(0, 1fr))`,
						}}
					>
						<div className="border-r border-b border-[#d8e3dc] px-4 py-4 text-[1rem] font-black text-slate-900">
							Status
						</div>

						{players.map((player, playerIndex) => (
							<div
								key={`status-${player.name}`}
								className="border-b border-[#d8e3dc] px-4 py-4 text-center"
							>
								<span
									className={`text-[1rem] font-black ${getStatusClass(
										totals[playerIndex],
									)}`}
								>
									{getStatusLabel(totals[playerIndex])}
								</span>
							</div>
						))}
					</div>

					{/* ROUNDS */}

					{safeValues.map((_, rowIndex) => {
						const rowBg =
							rowIndex % 2 === 0 ? "bg-white/60" : "bg-[#f7faf8]";

						return (
							<div
								key={`row-${rowIndex}`}
								className="grid"
								style={{
									gridTemplateColumns: `90px repeat(${players.length}, minmax(0, 1fr))`,
								}}
							>
								<div
									className={`border-r border-t border-[#d8e3dc] px-4 py-5 text-center ${rowBg}`}
								>
									<div className="text-[1rem] font-black text-slate-900">
										Runda {rowIndex + 1}
									</div>
								</div>

								{players.map((player, playerIndex) => {
									const display = getCellDisplay(
										safeValues,
										rowIndex,
										playerIndex,
									);

									const shownValue =
										typeof display.rawValue === "number"
											? display.rawValue
											: 0;

									return (
										<button
											key={`cell-${rowIndex}-${player.name}`}
											type="button"
											onClick={() =>
												openCell(rowIndex, playerIndex)
											}
											disabled={isLocked}
											className={`flex min-h-[110px] flex-col items-center justify-center border-t border-[#d8e3dc] px-4 py-5 text-center transition ${rowBg} ${
												isLocked
													? "cursor-default"
													: "hover:bg-emerald-50/40"
											}`}
										>
											{/* ROUND SCORE */}

											<span
												className={`text-[1.1rem] font-black ${
													shownValue >= ENTRY_TARGET
														? "text-emerald-600"
														: shownValue > 0
															? "text-slate-700"
															: "text-slate-400"
												}`}
											>
												{shownValue}
											</span>

											{/* RUNNING TOTAL */}

											<span className="mt-1 text-[1rem] font-bold text-slate-400">
												{display.totalAfter}
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
							gridTemplateColumns: `90px repeat(${players.length}, minmax(0, 1fr))`,
						}}
					>
						<div className="border-r border-t border-[#cfe0d6] px-4 py-4 text-[1.1rem] font-black text-slate-900">
							Totalt
						</div>

						{players.map((player, playerIndex) => (
							<div
								key={`total-${player.name}`}
								className="flex items-center justify-center border-t border-[#cfe0d6] px-4 py-4"
							>
								<span
									className={`text-[1.35rem] font-black ${
										totals[playerIndex] >= WIN_TARGET
											? "text-emerald-600"
											: "text-slate-900"
									}`}
								>
									{totals[playerIndex]}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* SCORE MODAL */}

			{modal &&
				createPortal(
					<div
						className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/30 px-4 py-6 backdrop-blur-sm"
						onClick={closeModal}
					>
						<div
							className="relative my-auto w-full max-w-[520px] rounded-[28px] bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.18)] sm:p-8"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="text-center">
								<h2 className="text-[2rem] font-black text-slate-900">
									Runda {modal.rowIndex + 1} –{" "}
									{players[modal.playerIndex].name}
								</h2>

								<p className="mt-2 text-[1.05rem] text-slate-500">
									Skriv poängen för rundan
								</p>

								{!modalPlayerIsOnBoard && (
									<p className="mt-2 text-sm font-semibold text-amber-600">
										För att komma in måste rundan vara minst
										1000 poäng.
									</p>
								)}
							</div>

							{/* +/- */}

							<div className="mt-8 flex items-center justify-center gap-4">
								<button
									type="button"
									onClick={() =>
										setModal((prev) => {
											if (!prev) {
												return prev;
											}

											if (!modalPlayerIsOnBoard) {
												return {
													...prev,

													value:
														prev.value <=
														ENTRY_TARGET
															? 0
															: prev.value - 50,
												};
											}

											return {
												...prev,

												value: Math.max(
													0,
													prev.value - 50,
												),
											};
										})
									}
									className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dfe9e3] text-slate-900 transition hover:bg-[#d3dfd8]"
								>
									<Minus size={22} />
								</button>

								<div className="min-w-[140px] text-center">
									<div className="text-[2rem] font-black text-slate-900">
										{modal.value}
									</div>

									<div className="text-sm text-slate-500">
										poäng
									</div>
								</div>

								<button
									type="button"
									onClick={() =>
										setModal((prev) => {
											if (!prev) {
												return prev;
											}

											if (!modalPlayerIsOnBoard) {
												return {
													...prev,

													value:
														prev.value === 0
															? ENTRY_TARGET
															: prev.value + 50,
												};
											}

											return {
												...prev,

												value: prev.value + 50,
											};
										})
									}
									className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dfe9e3] text-slate-900 transition hover:bg-[#d3dfd8]"
								>
									<Plus size={22} />
								</button>
							</div>

							{/* QUICK VALUES */}

							<div className="mt-8 grid grid-cols-4 gap-3">
								{quickScores.map((score) => {
									const disabled =
										!modalPlayerIsOnBoard &&
										score > 0 &&
										score < ENTRY_TARGET;

									return (
										<button
											key={score}
											type="button"
											disabled={disabled}
											onClick={() =>
												setModal((prev) =>
													prev
														? {
																...prev,

																value: score,
															}
														: prev,
												)
											}
											className={`rounded-[16px] border px-3 py-3 text-center font-bold transition ${
												modal.value === score
													? "border-emerald-400 bg-emerald-50 text-slate-900"
													: "border-[#d8e3dc] bg-white text-slate-700 hover:bg-slate-50"
											} ${
												disabled
													? "cursor-not-allowed opacity-35 hover:bg-white"
													: ""
											}`}
										>
											{score}
										</button>
									);
								})}
							</div>

							{/* CONFIRM */}

							<div className="mt-8">
								<button
									type="button"
									disabled={!modalValueIsValid}
									onClick={() => {
										commitValue(
											modal.rowIndex,
											modal.playerIndex,
											modal.value,
										);

										closeModal();
									}}
									className={`w-full rounded-[18px] px-5 py-5 text-[1.1rem] font-bold text-white transition ${
										modalValueIsValid
											? "bg-emerald-500 hover:bg-emerald-600"
											: "bg-[#93d5bf]"
									}`}
								>
									Bekräfta resultat
								</button>
							</div>

							{/* CLOSE */}

							<button
								type="button"
								onClick={closeModal}
								className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
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
