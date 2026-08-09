import { useMemo, useState } from "react";
import { X } from "lucide-react";
import type {
	ProtocolComponentProps,
	ScoreCellValue,
} from "../data/protocolRegistry";

type Contract = "red" | "black";

type ModalState = {
	contract: Contract;
	biddingSide: 0 | 1;
	tricksSideOne: number;
} | null;

function cloneValues(values: ScoreCellValue[][]) {
	return values.map((row) => [...row]);
}

function isFilledRow(row: ScoreCellValue[]) {
	return row.some((cell) => cell !== "");
}

function getNextEmptyRow(values: ScoreCellValue[][]) {
	return values.findIndex((row) => !isFilledRow(row));
}

function getSides(playerCount: number): number[][] {
	if (playerCount === 4) {
		return [
			[0, 2],
			[1, 3],
		];
	}

	return [[0], [1]];
}

function getSideScore(row: ScoreCellValue[], playerIndices: number[]) {
	const firstPlayer = playerIndices[0];
	const value = row[firstPlayer];

	return typeof value === "number" ? value : 0;
}

function getTotals(values: ScoreCellValue[][], playerCount: number) {
	const sides = getSides(playerCount);

	return sides.map((side) =>
		values.reduce((sum, row) => sum + getSideScore(row, side), 0),
	);
}

function getSideLabel(players: { name: string }[], side: number[]) {
	return side
		.map((index) => players[index]?.name ?? "")
		.filter(Boolean)
		.join(" & ");
}

function calculateRound(
	contract: Contract,
	biddingSide: 0 | 1,
	tricksSideOne: number,
) {
	const tricks = [tricksSideOne, 13 - tricksSideOne] as const;

	if (contract === "black") {
		const scoringSide: 0 | 1 = tricks[0] < 7 ? 0 : 1;

		const points = 7 - tricks[scoringSide];

		return {
			winnerSide: scoringSide,
			points,
		};
	}

	const winningSide: 0 | 1 = tricks[0] > 6 ? 0 : 1;

	const basePoints = tricks[winningSide] - 6;

	const points = winningSide === biddingSide ? basePoints : basePoints * 2;

	return {
		winnerSide: winningSide,
		points,
	};
}

export default function WhistProtocol({
	players,
	values,
	onChange,
	onBatchChange,
	isLocked = false,
}: ProtocolComponentProps) {
	const [modal, setModal] = useState<ModalState>(null);

	const sides = useMemo(() => getSides(players.length), [players.length]);

	const totals = useMemo(
		() => getTotals(values, players.length),
		[values, players.length],
	);

	const filledRows = useMemo(
		() =>
			values
				.map((row, index) => ({
					row,
					index,
				}))
				.filter(({ row }) => isFilledRow(row)),
		[values],
	);

	const labels = useMemo(
		() => sides.map((side) => getSideLabel(players, side)),
		[players, sides],
	);

	const openRound = () => {
		if (isLocked) return;

		setModal({
			contract: "red",
			biddingSide: 0,
			tricksSideOne: 7,
		});
	};

	const saveRound = () => {
		if (!modal || isLocked) return;

		const rowIndex = getNextEmptyRow(values);

		if (rowIndex === -1) {
			alert("Whistprotokollet är fullt.");
			return;
		}

		const { winnerSide, points } = calculateRound(
			modal.contract,
			modal.biddingSide,
			modal.tricksSideOne,
		);

		const update = (prev: ScoreCellValue[][]) => {
			const next = cloneValues(prev);

			const row = Array.from(
				{ length: players.length },
				() => "" as ScoreCellValue,
			);

			for (const playerIndex of sides[winnerSide]) {
				row[playerIndex] = points;
			}

			next[rowIndex] = row;

			return next;
		};

		if (onBatchChange) {
			onBatchChange(update);
		} else {
			const next = update(values);

			next[rowIndex].forEach((value, playerIndex) => {
				if (value !== "") {
					onChange(rowIndex, playerIndex, value);
				}
			});
		}

		setModal(null);
	};

	return (
		<>
			<div className="mx-auto w-full max-w-[880px] px-0 sm:px-1">
				{/* SCORE CARDS */}
				<div className="grid grid-cols-2 gap-2.5 sm:gap-4">
					{sides.map((_side, sideIndex) => (
						<div
							key={sideIndex}
							className="
									min-w-0
									rounded-[20px]
									border border-white/70
									bg-white/60
									px-2.5 py-4
									text-center
									shadow-[0_8px_22px_rgba(0,0,0,0.04)]
									sm:rounded-[24px]
									sm:px-5
									sm:py-5
								"
						>
							<p
								className="
									text-[10px]
									font-bold
									uppercase
									tracking-[0.12em]
									text-slate-400
									sm:text-xs
									sm:tracking-[0.14em]
								"
							>
								{players.length === 4
									? `Lag ${sideIndex + 1}`
									: `Spelare ${sideIndex + 1}`}
							</p>

							<p
								className="
									mt-1
									min-h-[36px]
									break-words
									text-xs
									font-bold
									leading-tight
									text-slate-700
									sm:min-h-0
									sm:text-base
									sm:leading-normal
								"
							>
								{labels[sideIndex]}
							</p>

							<div
								className="
									mt-2
									flex
									items-end
									justify-center
									gap-1
								"
							>
								<span
									className="
										text-3xl
										font-black
										leading-none
										text-slate-950
										sm:text-5xl
									"
								>
									{totals[sideIndex]}
								</span>

								<span
									className="
										pb-0.5
										text-xs
										font-bold
										text-slate-400
										sm:pb-1
										sm:text-base
									"
								>
									/ 13
								</span>
							</div>
						</div>
					))}
				</div>

				{/* ROUND HISTORY */}
				<div
					className="
						mt-4
						overflow-hidden
						rounded-[20px]
						border border-white/70
						bg-white/55
						sm:mt-5
						sm:rounded-[24px]
					"
				>
					<div
						className="
							grid
							grid-cols-[48px_minmax(0,1fr)_minmax(0,1fr)]
							items-center
							border-b
							border-slate-200/70
							px-2
							py-3
							text-center
							text-[9px]
							font-black
							uppercase
							tracking-[0.08em]
							text-slate-400
							sm:grid-cols-[74px_minmax(0,1fr)_minmax(0,1fr)]
							sm:px-5
							sm:text-xs
							sm:tracking-[0.12em]
						"
					>
						<div>Runda</div>

						<div className="min-w-0 truncate px-1">
							{players.length === 4 ? "Lag 1" : players[0]?.name}
						</div>

						<div className="min-w-0 truncate px-1">
							{players.length === 4 ? "Lag 2" : players[1]?.name}
						</div>
					</div>

					{filledRows.length === 0 ? (
						<div
							className="
								px-4
								py-7
								text-center
								text-xs
								font-medium
								text-slate-400
								sm:px-5
								sm:py-8
								sm:text-sm
							"
						>
							Ingen runda registrerad ännu.
						</div>
					) : (
						filledRows.map(({ row, index }, visibleIndex) => (
							<div
								key={index}
								className="
										grid
										grid-cols-[48px_minmax(0,1fr)_minmax(0,1fr)]
										items-center
										border-b
										border-slate-200/60
										px-2
										py-3
										text-center
										last:border-b-0
										sm:grid-cols-[74px_minmax(0,1fr)_minmax(0,1fr)]
										sm:px-5
										sm:py-3.5
									"
							>
								<div
									className="
										text-xs
										font-bold
										text-slate-400
										sm:text-sm
									"
								>
									{visibleIndex + 1}
								</div>

								{sides.map((side, sideIndex) => {
									const score = getSideScore(row, side);

									return (
										<div
											key={sideIndex}
											className="
														min-w-0
														text-sm
														font-black
														text-slate-800
														sm:text-base
													"
										>
											{score > 0 ? `+${score}` : "–"}
										</div>
									);
								})}
							</div>
						))
					)}
				</div>

				{/* ADD ROUND */}
				<button
					type="button"
					onClick={openRound}
					disabled={isLocked}
					className="
						mt-4
						w-full
						rounded-full
						bg-slate-950
						px-5
						py-3.5
						text-sm
						font-black
						text-white
						transition
						active:scale-[0.99]
						hover:bg-slate-800
						disabled:cursor-not-allowed
						disabled:opacity-45
						sm:mt-5
						sm:px-6
						sm:py-4
						sm:text-base
					"
				>
					Lägg till runda
				</button>
			</div>

			{/* ADD ROUND MODAL */}
			{modal && (
				<div
					className="
						fixed
						inset-0
						z-[80]
						flex
						items-center
						justify-center
						bg-slate-950/35
						p-3
						backdrop-blur-[2px]
						sm:p-4
					"
				>
					<div
						className="
							flex
							max-h-[92dvh]
							w-full
							max-w-[520px]
							flex-col
							overflow-hidden
							rounded-[28px]
							bg-white
							shadow-2xl
							sm:max-h-[90dvh]
                            my-auto
						"
					>
						{/* MODAL HEADER */}
						<div
							className="
								flex
								flex-shrink-0
								items-center
								justify-between
								gap-3
								border-b
								border-slate-100
								px-4
								py-4
								sm:px-6
								sm:py-5
							"
						>
							<div className="min-w-0">
								<h2
									className="
										text-lg
										font-black
										text-slate-950
										sm:text-xl
									"
								>
									Ny whistrunda
								</h2>

								<p
									className="
										mt-0.5
										text-xs
										text-slate-400
										sm:mt-1
										sm:text-sm
									"
								>
									Ange speltyp och antal stick.
								</p>
							</div>

							<button
								type="button"
								onClick={() => setModal(null)}
								className="
									flex
									h-9
									w-9
									flex-shrink-0
									items-center
									justify-center
									rounded-full
									bg-slate-100
									text-slate-600
									transition
									hover:bg-slate-200
									sm:h-10
									sm:w-10
								"
								aria-label="Stäng"
							>
								<X size={19} />
							</button>
						</div>

						{/* SCROLLABLE MODAL CONTENT */}
						<div
							className="
								flex-1
								overflow-y-auto
								overscroll-contain
								px-4
								py-4
								sm:px-6
								sm:py-5
							"
						>
							{/* GAME TYPE */}
							<div>
								<p
									className="
										mb-2
										text-xs
										font-black
										text-slate-700
										sm:text-sm
									"
								>
									Speltyp
								</p>

								<div className="grid grid-cols-2 gap-2">
									<button
										type="button"
										onClick={() =>
											setModal((prev) =>
												prev
													? {
															...prev,
															contract: "red",
														}
													: prev,
											)
										}
										className={`
											min-w-0
											rounded-2xl
											px-2
											py-3
											text-xs
											font-black
											transition
											sm:px-4
											sm:text-sm
											${
												modal.contract === "red"
													? "bg-red-500 text-white shadow-sm"
													: "bg-slate-100 text-slate-600 hover:bg-slate-200"
											}
										`}
									>
										Rött / Spel
									</button>

									<button
										type="button"
										onClick={() =>
											setModal((prev) =>
												prev
													? {
															...prev,
															contract: "black",
														}
													: prev,
											)
										}
										className={`
											min-w-0
											rounded-2xl
											px-2
											py-3
											text-xs
											font-black
											transition
											sm:px-4
											sm:text-sm
											${
												modal.contract === "black"
													? "bg-slate-900 text-white shadow-sm"
													: "bg-slate-100 text-slate-600 hover:bg-slate-200"
											}
										`}
									>
										Svart / Pass
									</button>
								</div>
							</div>

							{/* WHO CHOSE RED */}
							{modal.contract === "red" && (
								<div className="mt-5">
									<p
										className="
											mb-2
											text-xs
											font-black
											text-slate-700
											sm:text-sm
										"
									>
										Vem valde rött?
									</p>

									<div className="grid grid-cols-2 gap-2">
										{labels.map((label, sideIndex) => (
											<button
												key={sideIndex}
												type="button"
												onClick={() =>
													setModal((prev) =>
														prev
															? {
																	...prev,
																	biddingSide:
																		sideIndex as
																			| 0
																			| 1,
																}
															: prev,
													)
												}
												className={`
														min-w-0
														rounded-2xl
														px-2
														py-3
														text-xs
														font-black
														leading-tight
														transition
														sm:px-3
														sm:text-sm
														${
															modal.biddingSide ===
															sideIndex
																? "bg-emerald-500 text-white shadow-sm"
																: "bg-slate-100 text-slate-600 hover:bg-slate-200"
														}
													`}
											>
												<span className="block break-words">
													{label}
												</span>
											</button>
										))}
									</div>
								</div>
							)}

							{/* TRICKS */}
							<div className="mt-5">
								<div
									className="
										mb-2
										flex
										flex-col
										gap-0.5
										sm:flex-row
										sm:items-center
										sm:justify-between
										sm:gap-3
									"
								>
									<p
										className="
											min-w-0
											break-words
											text-xs
											font-black
											text-slate-700
											sm:text-sm
										"
									>
										Stick för {labels[0]}
									</p>

									<p
										className="
											min-w-0
											break-words
											text-[11px]
											font-bold
											text-slate-400
											sm:text-sm
										"
									>
										{labels[1]}: {13 - modal.tricksSideOne}
									</p>
								</div>

								<div
									className="
										grid
										grid-cols-7
										gap-1.5
										sm:gap-2
									"
								>
									{Array.from(
										{
											length: 14,
										},
										(_, tricks) => (
											<button
												key={tricks}
												type="button"
												onClick={() =>
													setModal((prev) =>
														prev
															? {
																	...prev,
																	tricksSideOne:
																		tricks,
																}
															: prev,
													)
												}
												className={`
													aspect-square
													min-w-0
													rounded-xl
													text-xs
													font-black
													transition
													active:scale-95
													sm:text-sm
													${
														modal.tricksSideOne ===
														tricks
															? "bg-slate-950 text-white shadow-sm"
															: "bg-slate-100 text-slate-600 hover:bg-slate-200"
													}
												`}
											>
												{tricks}
											</button>
										),
									)}
								</div>
							</div>

							{/* RESULT PREVIEW */}
							{(() => {
								const preview = calculateRound(
									modal.contract,
									modal.biddingSide,
									modal.tricksSideOne,
								);

								return (
									<div
										className="
											mt-5
											rounded-2xl
											bg-emerald-50
											px-3
											py-3
											text-center
											text-xs
											font-bold
											leading-relaxed
											text-emerald-800
											sm:px-4
											sm:text-sm
										"
									>
										<span className="break-words">
											{labels[preview.winnerSide]}
										</span>{" "}
										får <strong>+{preview.points}</strong>{" "}
										poäng
									</div>
								);
							})()}
						</div>

						{/* SAVE BUTTON */}
						<div
							className="
								flex-shrink-0
								border-t
								border-slate-100
								bg-white
								px-4
								pb-[max(16px,env(safe-area-inset-bottom))]
								pt-3
								sm:px-6
								sm:pb-5
								sm:pt-4
							"
						>
							<button
								type="button"
								onClick={saveRound}
								className="
									w-full
									rounded-full
									bg-emerald-500
									px-5
									py-3.5
									text-sm
									font-black
									text-white
									transition
									active:scale-[0.99]
									hover:bg-emerald-600
									sm:text-base
								"
							>
								Spara runda
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
