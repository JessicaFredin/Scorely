import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, X } from "lucide-react";
import type {
	ProtocolComponentProps,
	ScoreCellValue,
} from "../data/protocolRegistry";

const START_POINTS = 30;
const MIN_FINAL_SUM = 6;
const MAX_FINAL_SUM = 36;

type TurnModal = {
	finalSum: number;
	hitCount: number;
} | null;

type TurnHistoryItem = {
	rowIndex: number;
	actorIndex: number;
	deductions: number[];
	pointsAfter: number[];
};

function cloneValues(values: ScoreCellValue[][]) {
	return values.map((row) => [...row]);
}

function createEmptyRow(playerCount: number): ScoreCellValue[] {
	return Array.from({ length: playerCount }, () => "");
}

function isCompletedRow(row: ScoreCellValue[]) {
	return row.some((cell) => cell !== "");
}

function getNextActivePlayer(points: number[], fromPlayerIndex: number) {
	if (points.filter((point) => point > 0).length <= 1) {
		return -1;
	}

	for (let offset = 1; offset <= points.length; offset++) {
		const index = (fromPlayerIndex + offset) % points.length;

		if (points[index] > 0) {
			return index;
		}
	}

	return -1;
}

function getGameState(values: ScoreCellValue[][], playerCount: number) {
	const points = Array.from({ length: playerCount }, () => START_POINTS);

	const history: TurnHistoryItem[] = [];

	let actorIndex = 0;

	for (let rowIndex = 0; rowIndex < values.length; rowIndex++) {
		const row = values[rowIndex];

		if (!row || !isCompletedRow(row)) {
			break;
		}

		const deductions = Array.from(
			{ length: playerCount },
			(_, playerIndex) => {
				const value = row[playerIndex];

				return typeof value === "number" && value < 0
					? Math.abs(value)
					: 0;
			},
		);

		for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
			const value = row[playerIndex];

			if (typeof value === "number") {
				points[playerIndex] = Math.max(0, points[playerIndex] + value);
			}
		}

		history.push({
			rowIndex,
			actorIndex,
			deductions,
			pointsAfter: [...points],
		});

		const nextActor = getNextActivePlayer(points, actorIndex);

		if (nextActor === -1) {
			return {
				points,
				history,
				currentPlayerIndex: -1,
			};
		}

		actorIndex = nextActor;
	}

	if (points[actorIndex] <= 0) {
		actorIndex = getNextActivePlayer(points, actorIndex);
	}

	return {
		points,
		history,
		currentPlayerIndex: actorIndex,
	};
}

function clampFinalSum(value: number) {
	return Math.min(MAX_FINAL_SUM, Math.max(MIN_FINAL_SUM, value));
}

export default function ThirtyProtocol({
	players,
	values,
	onChange,
	onBatchChange,
	isLocked = false,
}: ProtocolComponentProps) {
	const [modal, setModal] = useState<TurnModal>(null);

	const safeValues = useMemo(() => {
		if (values.length > 0) {
			return values;
		}

		return [createEmptyRow(players.length)];
	}, [values, players.length]);

	const gameState = useMemo(
		() => getGameState(safeValues, players.length),
		[safeValues, players.length],
	);

	const activePlayers = gameState.points.filter((point) => point > 0).length;

	const gameFinished = activePlayers <= 1;

	const currentPlayerIndex = gameState.currentPlayerIndex;

	const currentPlayer =
		currentPlayerIndex >= 0 ? players[currentPlayerIndex] : undefined;

	useEffect(() => {
		if (!modal) {
			return;
		}

		const oldBodyOverflow = document.body.style.overflow;

		const oldHtmlOverflow = document.documentElement.style.overflow;

		document.body.style.overflow = "hidden";

		document.documentElement.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = oldBodyOverflow;

			document.documentElement.style.overflow = oldHtmlOverflow;
		};
	}, [modal]);

	const openTurn = () => {
		if (isLocked || gameFinished || currentPlayerIndex < 0) {
			return;
		}

		setModal({
			finalSum: 30,
			hitCount: 0,
		});
	};

	const closeModal = () => setModal(null);

	const saveTurn = () => {
		if (!modal || isLocked || gameFinished || currentPlayerIndex < 0) {
			return;
		}

		const actorIndex = currentPlayerIndex;

		const finalSum = clampFinalSum(modal.finalSum);

		const pointsBefore = [...gameState.points];

		const applyUpdate = (prev: ScoreCellValue[][]) => {
			const next = cloneValues(prev);

			if (next.length === 0) {
				next.push(createEmptyRow(players.length));
			}

			let rowIndex = next.findIndex((row) => !isCompletedRow(row));

			if (rowIndex === -1) {
				rowIndex = next.length;

				next.push(createEmptyRow(players.length));
			}

			const row = createEmptyRow(players.length);

			/*
				0 markerar att spelaren
				har genomfört sin tur,
				även om ingen förlorade
				poäng.
			*/
			row[actorIndex] = 0;

			if (finalSum < START_POINTS) {
				const loss = START_POINTS - finalSum;

				row[actorIndex] = -loss;
			} else if (finalSum > START_POINTS) {
				const targetNumber = finalSum - START_POINTS;

				const targetIndex = getNextActivePlayer(
					pointsBefore,
					actorIndex,
				);

				if (targetIndex >= 0) {
					const damage = targetNumber * modal.hitCount;

					if (damage > 0) {
						row[targetIndex] = -damage;
					}
				}
			}

			next[rowIndex] = row;

			const stateAfterTurn = getGameState(next, players.length);

			const winnerExists =
				stateAfterTurn.points.filter((point) => point > 0).length <= 1;

			if (!winnerExists) {
				next.push(createEmptyRow(players.length));
			}

			return next;
		};

		if (onBatchChange) {
			onBatchChange(applyUpdate);
		} else {
			const next = applyUpdate(safeValues);

			const targetRowIndex = next.findIndex((row) => isCompletedRow(row));

			const targetRow = next[targetRowIndex];

			targetRow?.forEach((value, playerIndex) => {
				if (value !== "") {
					onChange(targetRowIndex, playerIndex, value);
				}
			});
		}

		closeModal();
	};

	const preview = useMemo(() => {
		if (!modal || currentPlayerIndex < 0) {
			return null;
		}

		if (modal.finalSum < START_POINTS) {
			return {
				kind: "self" as const,
				loss: START_POINTS - modal.finalSum,
				targetIndex: currentPlayerIndex,
			};
		}

		if (modal.finalSum === START_POINTS) {
			return {
				kind: "none" as const,
				loss: 0,
				targetIndex: -1,
			};
		}

		const targetIndex = getNextActivePlayer(
			gameState.points,
			currentPlayerIndex,
		);

		const targetNumber = modal.finalSum - START_POINTS;

		return {
			kind: "opponent" as const,

			loss: targetNumber * modal.hitCount,

			targetIndex,
			targetNumber,
		};
	}, [modal, currentPlayerIndex, gameState.points]);

	return (
		<>
			<div className="mx-auto w-full max-w-[900px]">
				{/* PLAYER CARDS */}

				<div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4">
					{players.map((player, playerIndex) => {
						const points = gameState.points[playerIndex];

						const eliminated = points <= 0;

						const isCurrent = playerIndex === currentPlayerIndex;

						return (
							<div
								key={`${player.name}-${playerIndex}`}
								className={`min-w-0 rounded-[20px] border px-3 py-4 text-center shadow-[0_8px_22px_rgba(0,0,0,0.04)] sm:rounded-[24px] sm:px-5 sm:py-5 ${
									isCurrent
										? "border-emerald-300 bg-emerald-50/90"
										: eliminated
											? "border-slate-200 bg-white/35 opacity-60"
											: "border-white/70 bg-white/60"
								}`}
							>
								<p className="truncate text-xs font-bold text-slate-600 sm:text-sm">
									{player.name}
								</p>

								<div className="mt-2 flex items-end justify-center gap-1">
									<span
										className={`text-3xl font-black leading-none sm:text-5xl ${
											eliminated
												? "text-slate-400"
												: "text-slate-950"
										}`}
									>
										{points}
									</span>

									<span className="pb-0.5 text-xs font-bold text-slate-400 sm:pb-1 sm:text-sm">
										/ 30
									</span>
								</div>

								<p
									className={`mt-2 text-[10px] font-black uppercase tracking-[0.1em] sm:text-xs ${
										eliminated
											? "text-rose-500"
											: isCurrent
												? "text-emerald-600"
												: "text-slate-400"
									}`}
								>
									{eliminated
										? "Ute"
										: isCurrent
											? "Din tur"
											: "Kvar"}
								</p>
							</div>
						);
					})}
				</div>

				{/* CURRENT TURN */}

				{!gameFinished && currentPlayer && (
					<div className="mt-4 rounded-[20px] border border-emerald-200/80 bg-emerald-50/75 px-4 py-4 text-center sm:mt-5 sm:rounded-[24px] sm:px-5">
						<p className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-600 sm:text-xs">
							Nästa tur
						</p>

						<p className="mt-1 text-lg font-black text-slate-900 sm:text-xl">
							{currentPlayer.name}
						</p>
					</div>
				)}

				{/* HISTORY */}

				<div className="mt-4 overflow-hidden rounded-[20px] border border-white/70 bg-white/55 sm:mt-5 sm:rounded-[24px]">
					<div className="grid grid-cols-[58px_minmax(90px,1fr)_minmax(0,2fr)] items-center border-b border-slate-200/70 px-3 py-3 text-[9px] font-black uppercase tracking-[0.08em] text-slate-400 sm:grid-cols-[74px_minmax(130px,1fr)_minmax(0,2fr)] sm:px-5 sm:text-xs">
						<div>Tur</div>
						<div>Spelare</div>
						<div>Poängförlust</div>
					</div>

					{gameState.history.length === 0 ? (
						<div className="px-4 py-7 text-center text-xs font-medium text-slate-400 sm:py-8 sm:text-sm">
							Ingen tur registrerad ännu.
						</div>
					) : (
						gameState.history.map((turn, visibleIndex) => {
							const affected = turn.deductions
								.map((loss, playerIndex) => ({
									loss,
									playerIndex,
								}))
								.filter((item) => item.loss > 0);

							return (
								<div
									key={turn.rowIndex}
									className="grid grid-cols-[58px_minmax(90px,1fr)_minmax(0,2fr)] items-center border-b border-slate-200/60 px-3 py-3 text-sm last:border-b-0 sm:grid-cols-[74px_minmax(130px,1fr)_minmax(0,2fr)] sm:px-5"
								>
									<div className="font-bold text-slate-400">
										{visibleIndex + 1}
									</div>

									<div className="truncate pr-2 font-bold text-slate-700">
										{players[turn.actorIndex]?.name}
									</div>

									<div className="min-w-0 font-bold text-slate-700">
										{affected.length === 0
											? "Ingen"
											: affected
													.map(
														({
															loss,
															playerIndex,
														}) =>
															`${players[playerIndex]?.name} −${loss}`,
													)
													.join(", ")}
									</div>
								</div>
							);
						})
					)}
				</div>

				<button
					type="button"
					onClick={openTurn}
					disabled={isLocked || gameFinished}
					className="mt-4 w-full rounded-full bg-slate-950 px-5 py-3.5 text-sm font-black text-white transition active:scale-[0.99] hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45 sm:mt-5 sm:px-6 sm:py-4 sm:text-base"
				>
					{gameFinished
						? "Spelet är avslutat"
						: `Registrera ${currentPlayer?.name ?? "tur"}`}
				</button>
			</div>

			{/* MODAL */}

			{modal &&
				currentPlayerIndex >= 0 &&
				createPortal(
					<div
						className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/35 p-3 backdrop-blur-[2px] sm:p-4"
						onClick={closeModal}
					>
						<div
							className="relative my-auto w-full max-w-[520px] rounded-[28px] bg-white p-5 shadow-2xl sm:p-6"
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
									{players[currentPlayerIndex]?.name}s tur
								</p>

								<h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
									Vad blev slutsumman?
								</h2>

								<p className="mt-2 text-sm leading-6 text-slate-500">
									Summera de sex tärningarna efter att du lagt
									undan minst en tärning per kast.
								</p>
							</div>

							<div className="mt-6 flex items-center justify-center gap-4">
								<button
									type="button"
									onClick={() =>
										setModal((prev) =>
											prev
												? {
														...prev,
														finalSum: clampFinalSum(
															prev.finalSum - 1,
														),
														hitCount: 0,
													}
												: prev,
										)
									}
									className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
								>
									<Minus size={21} />
								</button>

								<div className="min-w-[120px] text-center">
									<div className="text-4xl font-black text-slate-950">
										{modal.finalSum}
									</div>

									<div className="mt-1 text-xs font-bold text-slate-400">
										summa
									</div>
								</div>

								<button
									type="button"
									onClick={() =>
										setModal((prev) =>
											prev
												? {
														...prev,
														finalSum: clampFinalSum(
															prev.finalSum + 1,
														),
														hitCount: 0,
													}
												: prev,
										)
									}
									className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200"
								>
									<Plus size={21} />
								</button>
							</div>

							<input
								type="range"
								min={MIN_FINAL_SUM}
								max={MAX_FINAL_SUM}
								value={modal.finalSum}
								onChange={(event) =>
									setModal((prev) =>
										prev
											? {
													...prev,
													finalSum: Number(
														event.target.value,
													),
													hitCount: 0,
												}
											: prev,
									)
								}
								className="mt-5 w-full accent-emerald-500"
							/>

							{modal.finalSum > START_POINTS &&
								preview?.kind === "opponent" && (
									<div className="mt-6 rounded-[20px] bg-slate-50 p-4">
										<p className="text-sm font-black text-slate-800">
											Du fick {modal.finalSum}. Nu gäller
											det att få så många {preview.targetNumber}:or som
											möjligt.
										</p>

										<p className="mt-1 text-xs leading-5 text-slate-500">
											Hur många {preview.targetNumber}
											:or fick du innan ett kast inte gav
											någon ny 4:a?
										</p>

										<div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2">
											{Array.from(
												{
													length: 7,
												},
												(_, count) => (
													<button
														key={count}
														type="button"
														onClick={() =>
															setModal((prev) =>
																prev
																	? {
																			...prev,
																			hitCount:
																				count,
																		}
																	: prev,
															)
														}
														className={`aspect-square rounded-xl text-sm font-black transition ${
															modal.hitCount ===
															count
																? "bg-slate-950 text-white"
																: "bg-white text-slate-600 shadow-sm"
														}`}
													>
														{count}
													</button>
												),
											)}
										</div>
									</div>
								)}

							{preview && (
								<div className="mt-5 rounded-[18px] bg-emerald-50 px-4 py-3 text-center text-sm font-bold text-emerald-800">
									{preview.kind === "none" &&
										"Exakt 30 – ingen förlorar poäng."}

									{preview.kind === "self" &&
										`${players[currentPlayerIndex]?.name} förlorar ${preview.loss} poäng.`}

									{preview.kind === "opponent" &&
										(preview.targetIndex >= 0
											? `${players[preview.targetIndex]?.name} förlorar ${preview.loss} poäng.`
											: "Ingen motspelare finns kvar.")}
								</div>
							)}

							<button
								type="button"
								onClick={saveTurn}
								className="mt-5 w-full rounded-full bg-emerald-500 px-5 py-3.5 text-sm font-black text-white transition hover:bg-emerald-600 sm:text-base"
							>
								Spara tur
							</button>
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}
