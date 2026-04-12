import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronRight, Minus, Plus, X } from "lucide-react";

export type ScoreCellValue = number | "";

type Player = {
	name: string;
};

type JazzProtocolProps = {
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

type CounterRoundKey = "pass" | "clubs" | "queens" | "play" | "seven";
type SingleSelectRoundKey = "king-of-clubs" | "last-trick";
type RoundKey = CounterRoundKey | SingleSelectRoundKey;

type CounterRound = {
	key: CounterRoundKey;
	label: string;
	shortLabel: string;
	type: "counter";
	description: string;
	perUnit: number;
	targetTotal?: number;
};

type SingleRound = {
	key: SingleSelectRoundKey;
	label: string;
	shortLabel: string;
	type: "single";
	description: string;
	perUnit: number;
};

type JazzRound = CounterRound | SingleRound;

type CounterModalState = {
	type: "counter";
	rowIndex: number;
	round: CounterRound;
	counts: number[];
};

type SingleModalState = {
	type: "single";
	rowIndex: number;
	round: SingleRound;
	selectedPlayerIndex: number | null;
};

type ModalState = CounterModalState | SingleModalState | null;

const rounds: JazzRound[] = [
	{
		key: "pass",
		label: "Pass",
		shortLabel: "Pass",
		type: "counter",
		description: "Varje stick ger −1 poäng",
		perUnit: -1,
	},
	{
		key: "clubs",
		label: "Klöver",
		shortLabel: "Klöver",
		type: "counter",
		description: "Varje klöver ger −1 poäng",
		perUnit: -1,
		targetTotal: 13,
	},
	{
		key: "queens",
		label: "Damer",
		shortLabel: "Damer",
		type: "counter",
		description: "Varje dam ger −5 poäng",
		perUnit: -5,
		targetTotal: 4,
	},
	{
		key: "king-of-clubs",
		label: "Klöver Kung",
		shortLabel: "KK",
		type: "single",
		description: "Välj vilken spelare som tog klöver kung (−15)",
		perUnit: -15,
	},
	{
		key: "last-trick",
		label: "Sista",
		shortLabel: "Sista",
		type: "single",
		description: "Välj vilken spelare som tog sista sticket (−20)",
		perUnit: -20,
	},
	{
		key: "play",
		label: "Spel",
		shortLabel: "Spel",
		type: "counter",
		description: "Varje stick ger +1 poäng",
		perUnit: 1,
	},
	{
		key: "seven",
		label: "7-an",
		shortLabel: "7-an",
		type: "counter",
		description: "Varje kort du inte kunde lägga ger −1 poäng",
		perUnit: -1,
	},
];

function cloneValues(values: ScoreCellValue[][]) {
	return values.map((row) => [...row]);
}

function getTotalTarget(key: CounterRoundKey, playerCount: number) {
	if (key === "pass" || key === "play") {
		return Math.floor(52 / playerCount);
	}

	if (key === "clubs") return 13;
	if (key === "queens") return 4;

	return null;
}

function isRowFilled(row: ScoreCellValue[]) {
	return row.every((cell) => cell !== "");
}

function getCurrentRowIndex(values: ScoreCellValue[][]) {
	return values.findIndex((row) => !isRowFilled(row));
}

function isCounterRound(round: JazzRound): round is CounterRound {
	return round.type === "counter";
}

function isSingleRound(round: JazzRound): round is SingleRound {
	return round.type === "single";
}

export default function JazzProtocol({
	players,
	values,
	onChange,
	onBatchChange,
	isLocked = false,
}: JazzProtocolProps) {
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
			players.map((_, playerIndex) =>
				values.reduce((sum, row) => {
					const value = row[playerIndex];
					return sum + (typeof value === "number" ? value : 0);
				}, 0),
			),
		[players, values],
	);

	const currentRowIndex = useMemo(() => getCurrentRowIndex(values), [values]);

	const openRound = (rowIndex: number) => {
		if (isLocked) return;
		if (rowIndex !== currentRowIndex) return;

		const round = rounds[rowIndex];
		if (!round) return;

		if (isCounterRound(round)) {
			const counts = players.map((_, playerIndex) => {
				const raw = values[rowIndex]?.[playerIndex];
				if (typeof raw !== "number") return 0;
				return Math.abs(raw / round.perUnit);
			});

			setModal({
				type: "counter",
				rowIndex,
				round,
				counts,
			});
			return;
		}

		if (isSingleRound(round)) {
			const selectedPlayerIndex =
				values[rowIndex]?.findIndex(
					(value) => typeof value === "number" && value !== 0,
				) ?? -1;

			setModal({
				type: "single",
				rowIndex,
				round,
				selectedPlayerIndex:
					selectedPlayerIndex >= 0 ? selectedPlayerIndex : null,
			});
		}
	};

	const closeModal = () => {
		setModal(null);
	};

	const setCounterValue = (playerIndex: number, nextCount: number) => {
		if (!modal || modal.type !== "counter") return;

		const safeCount = Math.max(0, nextCount);
		const nextCounts = [...modal.counts];
		nextCounts[playerIndex] = safeCount;

		setModal({
			...modal,
			counts: nextCounts,
		});
	};

	const currentCounterSum =
		modal?.type === "counter"
			? modal.counts.reduce((sum, count) => sum + count, 0)
			: 0;

	const currentCounterTarget =
		modal?.type === "counter"
			? getTotalTarget(modal.round.key, players.length)
			: null;

	const canConfirmCounter =
		modal?.type === "counter"
			? currentCounterTarget === null ||
				currentCounterSum === currentCounterTarget
			: false;

	const canIncreaseCounter = (playerIndex: number) => {
		if (!modal || modal.type !== "counter") return false;
		if (currentCounterTarget === null) return true;
		return currentCounterSum < currentCounterTarget;
	};

	const canDecreaseCounter = (playerIndex: number) => {
		if (!modal || modal.type !== "counter") return false;
		return modal.counts[playerIndex] > 0;
	};

	const saveCounterRound = () => {
		if (!modal || modal.type !== "counter") return;
		if (!canConfirmCounter) return;

		const encodedValues = modal.counts.map(
			(count) => count * modal.round.perUnit,
		);

		if (onBatchChange) {
			onBatchChange((prev) => {
				const next = cloneValues(prev);

				for (
					let playerIndex = 0;
					playerIndex < players.length;
					playerIndex++
				) {
					next[modal.rowIndex][playerIndex] =
						encodedValues[playerIndex];
				}

				return next;
			});
		} else {
			for (
				let playerIndex = 0;
				playerIndex < players.length;
				playerIndex++
			) {
				onChange(
					modal.rowIndex,
					playerIndex,
					encodedValues[playerIndex],
				);
			}
		}

		closeModal();
	};

	const saveSingleRound = () => {
		if (!modal || modal.type !== "single") return;
		if (modal.selectedPlayerIndex === null) return;

		if (onBatchChange) {
			onBatchChange((prev) => {
				const next = cloneValues(prev);

				for (
					let playerIndex = 0;
					playerIndex < players.length;
					playerIndex++
				) {
					next[modal.rowIndex][playerIndex] =
						playerIndex === modal.selectedPlayerIndex
							? modal.round.perUnit
							: 0;
				}

				return next;
			});
		} else {
			for (
				let playerIndex = 0;
				playerIndex < players.length;
				playerIndex++
			) {
				onChange(
					modal.rowIndex,
					playerIndex,
					playerIndex === modal.selectedPlayerIndex
						? modal.round.perUnit
						: 0,
				);
			}
		}

		closeModal();
	};

	return (
		<>
			<div className="overflow-x-auto">
				<div className="min-w-[760px] overflow-hidden rounded-[28px] border border-[#dbe5df] bg-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
					<div
						className="grid bg-[#e7f1eb]"
						style={{
							gridTemplateColumns: `110px repeat(${players.length}, minmax(0, 1fr))`,
						}}
					>
						<div className="border-b border-r border-[#d8e3dc] px-4 py-4 text-sm font-black uppercase tracking-[0.08em] text-slate-800">
							Jazz
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

					{rounds.map((round, rowIndex) => {
						const isCurrent = rowIndex === currentRowIndex;

						return (
							<div
								key={round.key}
								onClick={() => openRound(rowIndex)}
								className={`grid ${
									isCurrent && !isLocked
										? "cursor-pointer bg-[#d6ebe0]"
										: "bg-transparent"
								}`}
								style={{
									gridTemplateColumns: `110px repeat(${players.length}, minmax(0, 1fr))`,
								}}
							>
								<div
									className={`flex items-center gap-2 border-r border-t border-[#d8e3dc] px-4 py-4 text-[1rem] font-black ${
										isCurrent
											? "bg-[#c0ddd0] text-slate-900"
											: "text-slate-900"
									}`}
								>
									{isCurrent && (
										<ChevronRight
											size={16}
											className="shrink-0 text-emerald-500"
										/>
									)}
									<span>{round.shortLabel}</span>
								</div>

								{players.map((player, playerIndex) => {
									const value =
										values[rowIndex]?.[playerIndex] ?? "";

									return (
										<div
											key={`${round.key}-${player.name}`}
											className={`flex min-h-[56px] items-center justify-center border-t border-[#d8e3dc] px-4 py-4 text-center ${
												isCurrent && !isLocked
													? "transition hover:bg-white/15"
													: ""
											}`}
										>
											<span
												className={`text-[1.05rem] font-black ${
													typeof value === "number"
														? value > 0
															? "text-emerald-500"
															: value < 0
																? "text-red-500"
																: "text-slate-500"
														: "text-slate-300"
												}`}
											>
												{typeof value === "number"
													? value > 0
														? `+${value}`
														: value
													: "—"}
											</span>
										</div>
									);
								})}
							</div>
						);
					})}

					<div
						className="grid bg-[#dff0e7]"
						style={{
							gridTemplateColumns: `110px repeat(${players.length}, minmax(0, 1fr))`,
						}}
					>
						<div className="border-r border-t border-[#cfe0d6] px-4 py-4 text-[1.1rem] font-black text-slate-900">
							Totalt
						</div>

						{players.map((player, index) => (
							<div
								key={`total-${player.name}`}
								className="flex items-center justify-center border-t border-[#cfe0d6] px-4 py-4"
							>
								<span
									className={`text-[1.35rem] font-black ${
										totals[index] < 0
											? "text-emerald-500"
											: totals[index] > 0
												? "text-red-500"
												: "text-slate-700"
									}`}
								>
									{totals[index]}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{modal &&
				createPortal(
					<div
						className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/30 px-4 py-6 backdrop-blur-sm"
						onClick={closeModal}
					>
						<div
							className="relative my-auto w-full max-w-[500px] rounded-[28px] bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.18)] sm:p-8"
							onClick={(e) => e.stopPropagation()}
						>
							{modal.type === "counter" ? (
								<>
									<div className="text-center">
										<h2 className="text-[2rem] font-black text-slate-900">
											{modal.round.label} –{" "}
											{modal.round.key === "clubs"
												? "Hur många klöver?"
												: modal.round.key === "queens"
													? "Hur många damer?"
													: modal.round.key ===
														  "seven"
														? "Antal kort ej lagda?"
														: "Hur många stick?"}
										</h2>

										<p className="mt-2 text-[1.1rem] text-slate-500">
											{modal.round.description}
										</p>
									</div>

									<div className="mt-8 space-y-5">
										{players.map((player, playerIndex) => (
											<div
												key={player.name}
												className="flex items-center justify-between gap-4"
											>
												<span className="text-[1.05rem] font-bold text-slate-900">
													{player.name}
												</span>

												<div className="flex items-center gap-3">
													<button
														type="button"
														onClick={() =>
															setCounterValue(
																playerIndex,
																modal.counts[
																	playerIndex
																] - 1,
															)
														}
														disabled={
															!canDecreaseCounter(
																playerIndex,
															)
														}
														className={`flex h-12 w-12 items-center justify-center rounded-full text-slate-900 transition ${
															canDecreaseCounter(
																playerIndex,
															)
																? "bg-[#dfe9e3] hover:bg-[#d3dfd8]"
																: "bg-[#edf3ef] text-slate-300"
														}`}
													>
														<Minus size={22} />
													</button>

													<div className="flex h-12 min-w-[52px] items-center justify-center rounded-[18px] border border-[#c9d8cf] px-4 text-[1.5rem] font-black text-slate-900">
														{
															modal.counts[
																playerIndex
															]
														}
													</div>

													<button
														type="button"
														onClick={() =>
															setCounterValue(
																playerIndex,
																modal.counts[
																	playerIndex
																] + 1,
															)
														}
														disabled={
															!canIncreaseCounter(
																playerIndex,
															)
														}
														className={`flex h-12 w-12 items-center justify-center rounded-full text-slate-900 transition ${
															canIncreaseCounter(
																playerIndex,
															)
																? "bg-[#dfe9e3] hover:bg-[#d3dfd8]"
																: "bg-[#edf3ef] text-slate-300"
														}`}
													>
														<Plus size={22} />
													</button>
												</div>
											</div>
										))}
									</div>

									{currentCounterTarget !== null && (
										<p className="mt-8 text-center text-[1.15rem] font-semibold text-red-500">
											Summa: {currentCounterSum} /{" "}
											{currentCounterTarget}
										</p>
									)}

									<div className="mt-6">
										<button
											type="button"
											onClick={saveCounterRound}
											disabled={!canConfirmCounter}
											className={`w-full rounded-[18px] px-5 py-5 text-[1.1rem] font-bold text-white transition ${
												canConfirmCounter
													? "bg-emerald-500 hover:bg-emerald-600"
													: "bg-[#93d5bf]"
											}`}
										>
											Bekräfta resultat
										</button>
									</div>
								</>
							) : (
								<>
									<div className="text-center">
										<h2 className="text-[2rem] font-black text-slate-900">
											{modal.round.label} –{" "}
											{modal.round.key === "king-of-clubs"
												? "Vem tog den?"
												: "Vem tog sista sticket?"}
										</h2>

										<p className="mt-2 text-[1.1rem] text-slate-500">
											{modal.round.description}
										</p>
									</div>

									<div className="mt-8 space-y-3">
										{players.map((player, playerIndex) => {
											const isSelected =
												modal.selectedPlayerIndex ===
												playerIndex;

											return (
												<button
													key={player.name}
													type="button"
													onClick={() =>
														setModal({
															...modal,
															selectedPlayerIndex:
																playerIndex,
														})
													}
													className="flex w-full items-center gap-4 rounded-[18px] border border-[#d8e3dc] px-5 py-5 text-left transition hover:bg-slate-50"
												>
													<span
														className={`flex h-8 w-8 items-center justify-center rounded-full border ${
															isSelected
																? "border-emerald-500 bg-emerald-500 text-white"
																: "border-[#c8d3cc] bg-white text-transparent"
														}`}
													>
														<Check size={18} />
													</span>

													<span className="text-[1.05rem] font-bold text-slate-900">
														{player.name}
													</span>
												</button>
											);
										})}
									</div>

									<div className="mt-8">
										<button
											type="button"
											onClick={saveSingleRound}
											disabled={
												modal.selectedPlayerIndex ===
												null
											}
											className={`w-full rounded-[18px] px-5 py-5 text-[1.1rem] font-bold text-white transition ${
												modal.selectedPlayerIndex !==
												null
													? "bg-emerald-500 hover:bg-emerald-600"
													: "bg-[#93d5bf]"
											}`}
										>
											Bekräfta resultat
										</button>
									</div>
								</>
							)}

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
