import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, X } from "lucide-react";

type ScoreCellValue = number | "";

type Player = {
	name: string;
};

type TrebellerProtocolProps = {
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

type CategoryKey = "hearts" | "diamonds" | "clubs" | "spades" | "pass" | "play";

type Category = {
	key: CategoryKey;
	label: string;
};

type DecodedCell = {
	categoryKey: CategoryKey;
	categoryLabel: string;
	chooserIndex: number;
	score: number;
};

type RoundSummary = {
	rowIndex: number;
	categoryKey: CategoryKey;
	categoryLabel: string;
	chooserIndex: number;
	scores: number[];
};

type ModalState = {
	categoryKey: CategoryKey;
	chooserIndex: number;
	tricksTaken: number[];
} | null;

const categories: Category[] = [
	{ key: "hearts", label: "Hjärter" },
	{ key: "diamonds", label: "Ruter" },
	{ key: "clubs", label: "Klöver" },
	{ key: "spades", label: "Spader" },
	{ key: "pass", label: "Pass" },
	{ key: "play", label: "Spel" },
];

const CATEGORY_MULTIPLIER = 1000;
const CHOOSER_MULTIPLIER = 100;
const SCORE_OFFSET = 50;
const TOTAL_ROUNDS = 18;

function cloneValues(values: ScoreCellValue[][]) {
	return values.map((row) => [...row]);
}

function getCategoryIndex(categoryKey: CategoryKey) {
	return categories.findIndex((category) => category.key === categoryKey);
}

function getCategoryByIndex(index: number) {
	return categories[index] ?? null;
}

function encodeCellValue(
	categoryKey: CategoryKey,
	chooserIndex: number,
	score: number,
): number {
	const categoryIndex = getCategoryIndex(categoryKey);

	return (
		categoryIndex * CATEGORY_MULTIPLIER +
		chooserIndex * CHOOSER_MULTIPLIER +
		(score + SCORE_OFFSET)
	);
}

function decodeCellValue(value: ScoreCellValue): DecodedCell | null {
	if (typeof value !== "number") return null;

	const categoryIndex = Math.floor(value / CATEGORY_MULTIPLIER);
	const remainderAfterCategory = value % CATEGORY_MULTIPLIER;
	const chooserIndex = Math.floor(
		remainderAfterCategory / CHOOSER_MULTIPLIER,
	);
	const score = (remainderAfterCategory % CHOOSER_MULTIPLIER) - SCORE_OFFSET;
	const category = getCategoryByIndex(categoryIndex);

	if (!category) return null;

	return {
		categoryKey: category.key,
		categoryLabel: category.label,
		chooserIndex,
		score,
	};
}

function isRowFilled(row: ScoreCellValue[]) {
	return row.every((cell) => cell !== "");
}

function getCurrentRoundIndex(values: ScoreCellValue[][]) {
	return values.findIndex((row) => !isRowFilled(row));
}

function getCurrentChooserIndex(roundIndex: number) {
	return roundIndex % 3;
}

function getRequiredTricks(
	categoryKey: CategoryKey,
	chooserIndex: number,
	playerIndex: number,
) {
	const relativeSeat = (playerIndex - chooserIndex + 3) % 3;

	if (categoryKey === "pass") {
		if (relativeSeat === 0) return 2;
		if (relativeSeat === 1) return 4;
		return 7;
	}

	if (relativeSeat === 0) return 7;
	if (relativeSeat === 1) return 4;
	return 2;
}

function getScoreFromTricks(
	categoryKey: CategoryKey,
	chooserIndex: number,
	playerIndex: number,
	tricksTaken: number,
) {
	const target = getRequiredTricks(categoryKey, chooserIndex, playerIndex);

	if (categoryKey === "pass") {
		return target - tricksTaken;
	}

	return tricksTaken - target;
}

function getRoundScores(
	categoryKey: CategoryKey,
	chooserIndex: number,
	tricksTaken: number[],
) {
	return tricksTaken.map((tricks, playerIndex) =>
		getScoreFromTricks(categoryKey, chooserIndex, playerIndex, tricks),
	);
}

function getRoundSummaries(values: ScoreCellValue[][]): RoundSummary[] {
	return values
		.map((row, rowIndex) => {
			const firstCell = decodeCellValue(row[0]);
			if (!firstCell) return null;

			return {
				rowIndex,
				categoryKey: firstCell.categoryKey,
				categoryLabel: firstCell.categoryLabel,
				chooserIndex: firstCell.chooserIndex,
				scores: row.map((cell) => decodeCellValue(cell)?.score ?? 0),
			};
		})
		.filter((round): round is RoundSummary => round !== null);
}

function getChosenMap(rounds: RoundSummary[]) {
	const chosen = new Map<string, boolean>();

	for (const round of rounds) {
		chosen.set(`${round.chooserIndex}:${round.categoryKey}`, true);
	}

	return chosen;
}

function getTotals(rounds: RoundSummary[], playerCount: number) {
	return Array.from({ length: playerCount }, (_, playerIndex) =>
		rounds.reduce((sum, round) => sum + round.scores[playerIndex], 0),
	);
}

function getShortName(name: string) {
	return name.slice(0, 3);
}

function getRemainingTricks(tricksTaken: number[]) {
	return 13 - tricksTaken.reduce((sum, value) => sum + value, 0);
}

export default function TrebellerProtocol({
	players,
	values,
	onChange,
	onBatchChange,
	isLocked = false,
}: TrebellerProtocolProps) {
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

	const roundSummaries = useMemo(() => getRoundSummaries(values), [values]);
	const chosenMap = useMemo(
		() => getChosenMap(roundSummaries),
		[roundSummaries],
	);
	const totals = useMemo(
		() => getTotals(roundSummaries, players.length),
		[roundSummaries, players.length],
	);

	const currentRoundIndex = useMemo(
		() => getCurrentRoundIndex(values),
		[values],
	);
	const finishedRoundCount = roundSummaries.length;
	const isFinished = finishedRoundCount >= TOTAL_ROUNDS;

	const currentChooserIndex =
		currentRoundIndex === -1 || isFinished
			? null
			: getCurrentChooserIndex(currentRoundIndex);

	const openRowModal = (categoryKey: CategoryKey) => {
		if (isLocked || isFinished) return;
		if (currentRoundIndex === -1 || currentChooserIndex === null) return;

		const alreadyChosenByCurrentPlayer = chosenMap.has(
			`${currentChooserIndex}:${categoryKey}`,
		);

		if (alreadyChosenByCurrentPlayer) return;

		setModal({
			categoryKey,
			chooserIndex: currentChooserIndex,
			tricksTaken: [0, 0, 0],
		});
	};

	const closeModal = () => {
		setModal(null);
	};

	const modalCategory = modal
		? (categories.find((category) => category.key === modal.categoryKey) ??
			null)
		: null;

	const modalRemaining = modal ? getRemainingTricks(modal.tricksTaken) : 13;
	const canConfirmRound = modal ? modalRemaining === 0 : false;

	const setPlayerTricks = (playerIndex: number, nextValue: number) => {
		if (!modal) return;

		const safeValue = Math.max(0, nextValue);
		const next = [...modal.tricksTaken];
		const usedByOthers = modal.tricksTaken.reduce(
			(sum, tricks, index) =>
				index === playerIndex ? sum : sum + tricks,
			0,
		);
		const maxAllowed = 13 - usedByOthers;

		next[playerIndex] = Math.min(safeValue, maxAllowed);

		setModal({
			...modal,
			tricksTaken: next,
		});
	};

	const saveRound = () => {
		if (!modal) return;
		if (currentRoundIndex === -1) return;
		if (!canConfirmRound) return;

		const scores = getRoundScores(
			modal.categoryKey,
			modal.chooserIndex,
			modal.tricksTaken,
		);

		const encodedRow = scores.map((score) =>
			encodeCellValue(modal.categoryKey, modal.chooserIndex, score),
		);

		if (onBatchChange) {
			onBatchChange((prev) => {
				const next = cloneValues(prev);

				for (
					let playerIndex = 0;
					playerIndex < players.length;
					playerIndex++
				) {
					next[currentRoundIndex][playerIndex] =
						encodedRow[playerIndex];
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
					currentRoundIndex,
					playerIndex,
					encodedRow[playerIndex],
				);
			}
		}

		closeModal();
	};

	return (
		<>
			<div className="space-y-4 sm:space-y-6">
				<div className="text-center">
					<h2 className="text-[1.8rem] font-black text-slate-900 sm:text-[2.5rem]">
						Trebeller
					</h2>

					{!isFinished &&
						currentRoundIndex !== -1 &&
						currentChooserIndex !== null && (
							<p className="mt-1 text-[0.95rem] text-slate-500 sm:mt-2 sm:text-[1.1rem]">
								Runda {currentRoundIndex + 1}/{TOTAL_ROUNDS} —{" "}
								<span className="font-bold text-emerald-500">
									{players[currentChooserIndex].name}
								</span>{" "}
								väljer
							</p>
						)}

					{isFinished && (
						<p className="mt-1 text-[0.95rem] font-bold text-emerald-500 sm:mt-2 sm:text-[1.1rem]">
							Alla 18 rundor är spelade
						</p>
					)}
				</div>

				<div className="overflow-hidden rounded-[18px] border border-[#dbe5df] bg-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.03)] sm:rounded-[26px]">
					<div className="grid grid-cols-[86px_repeat(3,1fr)] bg-white/85 sm:grid-cols-[150px_repeat(3,1fr)]">
						<div className="border-b border-r border-[#d8e3dc] px-3 py-3 text-left text-[0.92rem] font-medium text-slate-500 sm:px-5 sm:py-4 sm:text-[1rem]">
							Typ
						</div>

						{players.map((player) => (
							<div
								key={player.name}
								className="border-b border-[#d8e3dc] px-2 py-3 text-center text-[0.95rem] font-black text-slate-900 sm:px-5 sm:py-4 sm:text-[1rem]"
							>
								<span className="block truncate">
									{player.name}
								</span>
							</div>
						))}
					</div>

					{categories.map((category, rowIndex) => {
						const baseBg =
							rowIndex % 2 === 0
								? "bg-[#d6ebe0]"
								: "bg-[#d9ede3]";

						const currentChooserHasChosen =
							currentChooserIndex !== null &&
							chosenMap.has(
								`${currentChooserIndex}:${category.key}`,
							);

						const chooserCanPickThis =
							!isFinished &&
							!isLocked &&
							currentRoundIndex !== -1 &&
							currentChooserIndex !== null &&
							!currentChooserHasChosen;

						return (
							<button
								key={category.key}
								type="button"
								onClick={() => openRowModal(category.key)}
								disabled={!chooserCanPickThis}
								className={`grid w-full grid-cols-[86px_repeat(3,1fr)] text-left transition sm:grid-cols-[150px_repeat(3,1fr)] ${
									currentChooserHasChosen
										? "bg-white"
										: baseBg
								} ${
									chooserCanPickThis
										? "cursor-pointer hover:bg-emerald-500/10"
										: "cursor-default"
								}`}
							>
								<div className="border-r border-t border-[#d8e3dc] px-3 py-4 text-[0.95rem] font-black text-slate-900 sm:px-5 sm:py-5 sm:text-[1rem]">
									{category.label}
								</div>

								{players.map((player, playerIndex) => {
									const isChosenByThisPlayer = chosenMap.has(
										`${playerIndex}:${category.key}`,
									);

									return (
										<div
											key={`${category.key}-${player.name}`}
											className="flex items-center justify-center border-t border-[#d8e3dc] px-2 py-3 sm:px-4 sm:py-4"
										>
											{isChosenByThisPlayer ? (
												<span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-500 sm:h-10 sm:w-10">
													<X
														size={18}
														strokeWidth={3}
														className="sm:h-[22px] sm:w-[22px]"
													/>
												</span>
											) : (
												<span className="text-[1.15rem] text-slate-400 sm:text-[1.4rem]">
													–
												</span>
											)}
										</div>
									);
								})}
							</button>
						);
					})}
				</div>

				<div className="overflow-hidden rounded-[18px] border border-[#dbe5df] bg-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.03)] sm:rounded-[26px]">
					<div className="grid grid-cols-[42px_96px_repeat(3,1fr)] bg-white/85 sm:grid-cols-[80px_200px_repeat(3,1fr)]">
						<div className="border-b border-r border-[#d8e3dc] px-2 py-3 text-left text-[0.9rem] font-medium text-slate-500 sm:px-4 sm:py-4 sm:text-[1rem]">
							#
						</div>
						<div className="border-b border-r border-[#d8e3dc] px-2 py-3 text-left text-[0.9rem] font-medium text-slate-500 sm:px-4 sm:py-4 sm:text-[1rem]">
							Typ
						</div>

						{players.map((player) => (
							<div
								key={`header-${player.name}`}
								className="border-b border-[#d8e3dc] px-2 py-3 text-center text-[0.92rem] font-black text-slate-900 sm:px-4 sm:py-4 sm:text-[1rem]"
							>
								<span className="block truncate">
									{player.name}
								</span>
							</div>
						))}
					</div>

					{roundSummaries.map((round, index) => {
						const rowBg =
							index % 2 === 0 ? "bg-[#f6faf8]" : "bg-white/70";

						return (
							<div
								key={`history-${round.rowIndex}`}
								className={`grid grid-cols-[42px_96px_repeat(3,1fr)] sm:grid-cols-[80px_200px_repeat(3,1fr)] ${rowBg}`}
							>
								<div className="border-r border-t border-[#d8e3dc] px-2 py-3 text-[0.9rem] text-slate-500 sm:px-4 sm:py-4 sm:text-[1rem]">
									{index + 1}
								</div>

								<div className="border-r border-t border-[#d8e3dc] px-2 py-3 text-[0.92rem] font-semibold text-slate-900 sm:px-4 sm:py-4 sm:text-[1rem]">
									{round.categoryLabel}{" "}
									<span className="text-slate-500">
										(
										{getShortName(
											players[round.chooserIndex].name,
										)}
										)
									</span>
								</div>

								{players.map((player, playerIndex) => {
									const score = round.scores[playerIndex];

									return (
										<div
											key={`score-${round.rowIndex}-${player.name}`}
											className="border-t border-[#d8e3dc] px-2 py-3 text-center sm:px-4 sm:py-4"
										>
											<span
												className={`text-[0.95rem] font-black sm:text-[1.05rem] ${
													score > 0
														? "text-emerald-500"
														: score < 0
															? "text-red-500"
															: "text-slate-500"
												}`}
											>
												{score > 0
													? `+${score}`
													: score}
											</span>
										</div>
									);
								})}
							</div>
						);
					})}

					<div className="grid grid-cols-[42px_96px_repeat(3,1fr)] bg-[#dff0e7] sm:grid-cols-[80px_200px_repeat(3,1fr)]">
						<div className="border-r border-t border-[#cfe0d6] px-2 py-3 sm:px-4 sm:py-4" />
						<div className="border-r border-t border-[#cfe0d6] px-2 py-3 text-[0.95rem] font-black text-slate-900 sm:px-4 sm:py-4 sm:text-[1.05rem]">
							Totalt
						</div>

						{players.map((player, playerIndex) => (
							<div
								key={`total-${player.name}`}
								className="flex items-center justify-center border-t border-[#cfe0d6] px-2 py-3 sm:px-4 sm:py-4"
							>
								<span
									className={`text-[1rem] font-black sm:text-[1.2rem] ${
										totals[playerIndex] > 0
											? "text-emerald-500"
											: totals[playerIndex] < 0
												? "text-slate-900"
												: "text-slate-700"
									}`}
								>
									{totals[playerIndex] > 0
										? `+${totals[playerIndex]}`
										: totals[playerIndex]}
								</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{modal &&
				createPortal(
					<div
						className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/25 px-3 py-4 backdrop-blur-sm sm:px-4 sm:py-6"
						onClick={closeModal}
					>
						<div
							className="max-h-[90vh] w-full max-w-[480px] overflow-y-auto rounded-[22px] bg-white/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.18)] sm:rounded-[28px] sm:p-8"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="mb-5 flex items-start justify-between gap-3 sm:mb-6 sm:gap-4">
								<div className="min-w-0">
									<h3 className="text-[1.35rem] font-black text-slate-900 sm:text-[1.9rem]">
										{modalCategory?.label} —{" "}
										{players[modal.chooserIndex].name}
									</h3>
									<p className="mt-1 text-[0.95rem] text-slate-500 sm:mt-2 sm:text-[1.05rem]">
										{modal.categoryKey === "pass"
											? "Ta så få stick som möjligt — Totalt 13 stick"
											: "Ta så många stick som möjligt — Totalt 13 stick"}
									</p>
								</div>

								<button
									type="button"
									onClick={closeModal}
									className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#dfe9e3] text-slate-500 transition hover:bg-[#d3dfd8] sm:h-12 sm:w-12"
									aria-label="Stäng"
								>
									<X
										size={20}
										className="sm:h-[22px] sm:w-[22px]"
									/>
								</button>
							</div>

							<div className="space-y-4 sm:space-y-5">
								{players.map((player, playerIndex) => {
									const required = getRequiredTricks(
										modal.categoryKey,
										modal.chooserIndex,
										playerIndex,
									);

									const currentValue =
										modal.tricksTaken[playerIndex];
									const usedByOthers =
										modal.tricksTaken.reduce(
											(sum, tricks, index) =>
												index === playerIndex
													? sum
													: sum + tricks,
											0,
										);
									const maxAllowed = 13 - usedByOthers;
									const score = getScoreFromTricks(
										modal.categoryKey,
										modal.chooserIndex,
										playerIndex,
										currentValue,
									);

									return (
										<div key={player.name}>
											<div className="flex items-center justify-between gap-3">
												<div className="min-w-0">
													<div className="flex flex-wrap items-center gap-2">
														<p className="text-[0.95rem] font-black text-slate-900 sm:text-[1rem]">
															{player.name}
														</p>

														{playerIndex ===
															modal.chooserIndex && (
															<span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold text-emerald-500 sm:px-3 sm:text-xs">
																Valde
															</span>
														)}
													</div>

													<p className="mt-1 text-[12px] text-slate-500 sm:mt-2 sm:text-sm">
														{modal.categoryKey ===
														"pass"
															? `Får ta högst ${required} för plus`
															: `Behöver ${required} för plus`}
													</p>
												</div>

												<div className="flex items-center gap-2 sm:gap-3">
													<button
														type="button"
														onClick={() =>
															setPlayerTricks(
																playerIndex,
																currentValue -
																	1,
															)
														}
														disabled={
															currentValue === 0
														}
														className={`flex h-9 w-9 items-center justify-center rounded-full transition sm:h-10 sm:w-10 ${
															currentValue > 0
																? "bg-[#dfe9e3] text-slate-900 hover:bg-[#d3dfd8]"
																: "bg-[#edf3ef] text-slate-300"
														}`}
													>
														<Minus
															size={18}
															className="sm:h-5 sm:w-5"
														/>
													</button>

													<div className="flex min-w-[24px] items-center justify-center text-[1.2rem] font-black text-slate-900 sm:min-w-[34px] sm:text-[1.5rem]">
														{currentValue}
													</div>

													<button
														type="button"
														onClick={() =>
															setPlayerTricks(
																playerIndex,
																currentValue +
																	1,
															)
														}
														disabled={
															currentValue >=
															maxAllowed
														}
														className={`flex h-9 w-9 items-center justify-center rounded-full transition sm:h-10 sm:w-10 ${
															currentValue <
															maxAllowed
																? "bg-[#dfe9e3] text-slate-900 hover:bg-[#d3dfd8]"
																: "bg-[#edf3ef] text-slate-300"
														}`}
													>
														<Plus
															size={18}
															className="sm:h-5 sm:w-5"
														/>
													</button>

													<div
														className={`min-w-[34px] text-right text-[1.1rem] font-black sm:min-w-[44px] sm:text-[1.5rem] ${
															score > 0
																? "text-emerald-500"
																: score < 0
																	? "text-red-500"
																	: "text-slate-700"
														}`}
													>
														{score > 0
															? `+${score}`
															: score}
													</div>
												</div>
											</div>
										</div>
									);
								})}
							</div>

							<p className="mt-6 text-center text-[1rem] font-semibold text-slate-500 sm:mt-8 sm:text-[1.15rem]">
								Summa: {13 - modalRemaining} / 13
							</p>

							<div className="mt-5 sm:mt-6">
								<button
									type="button"
									onClick={saveRound}
									disabled={!canConfirmRound}
									className={`w-full rounded-[16px] px-5 py-3.5 text-[1rem] font-bold transition sm:rounded-[18px] sm:py-4 sm:text-[1.1rem] ${
										canConfirmRound
											? "bg-amber-300 text-slate-700 hover:bg-amber-400"
											: "bg-amber-200 text-slate-400"
									}`}
								>
									Bekräfta resultat
								</button>
							</div>
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}
