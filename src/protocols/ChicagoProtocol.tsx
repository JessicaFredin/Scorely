// import { useMemo, useState, useEffect } from "react";
// import { createPortal } from "react-dom";
// import { Crown, X } from "lucide-react";
// import TallyMarks from "../components/chicago/TallyMarks";

// type ScoreCellValue = number | "";

// type Player = {
// 	name: string;
// };

// type ChicagoProtocolProps = {
// 	gameName: string;
// 	players: Player[];
// 	values: ScoreCellValue[][];
// 	onChange: (
// 		rowIndex: number,
// 		playerIndex: number,
// 		value: ScoreCellValue,
// 	) => void;
// 	onBatchChange?: (
// 		updater: (prev: ScoreCellValue[][]) => ScoreCellValue[][],
// 	) => void;
// 	isLocked?: boolean;
// };

// type ModalState = {
// 	type: "score" | "chicago";
// 	playerIndex: number;
// } | null;

// type ScoreOption = {
// 	label: string;
// 	value: number;
// 	variant?: "default" | "accent";
// };

// // type PointSlot = {
// // 	struck: boolean;
// // };

// const scoreOptions: ScoreOption[] = [
// 	{ label: "1 par", value: 1 },
// 	{ label: "2 par", value: 2 },
// 	{ label: "Triss", value: 3 },
// 	{ label: "Stege", value: 4 },
// 	{ label: "Färg", value: 5 },
// 	{ label: "Kåk", value: 6 },
// 	{ label: "Fyrtal", value: 8, variant: "accent" },
// 	{ label: "Straight Flush", value: 25 },
// 	{ label: "Royal Flush", value: 52 },
// 	{ label: "Utspel", value: 5 },
// 	{ label: "Utspel med två", value: 10 },
// ];

// function cloneValues(values: ScoreCellValue[][]) {
// 	return values.map((row) => [...row]);
// }

// function getPlayerEvents(
// 	values: ScoreCellValue[][],
// 	playerIndex: number,
// ): number[] {
// 	return values
// 		.map((row) => row[playerIndex])
// 		.filter(
// 			(value): value is number =>
// 				value !== "" && !Number.isNaN(Number(value)),
// 		)
// 		.map(Number)
// 		.filter((value) => value !== 0);
// }

// function getPlayerTotal(values: ScoreCellValue[][], playerIndex: number) {
// 	return getPlayerEvents(values, playerIndex).reduce(
// 		(sum, value) => sum + value,
// 		0,
// 	);
// }

// function hasSaidChicago(events: number[]) {
// 	return events.includes(15) || events.includes(-15);
// }

// function getPlayerStatusMessage(
// 	playerName: string,
// 	total: number,
// 	hasChicago: boolean,
// ) {
// 	if (total >= 52 && hasChicago) {
// 		return `Grattis! ${playerName} har vunnit spelet, 52 poäng.`;
// 	}

// 	if (total >= 52 && !hasChicago) {
// 		return `${playerName} måste säga Chicago innan han kan vinna.`;
// 	}

// 	if (total >= 47) {
// 		return `${playerName} har köpstopp.`;
// 	}

// 	return "";
// }

// function findNextEmptyRow(values: ScoreCellValue[][], playerIndex: number) {
// 	return values.findIndex((row) => row[playerIndex] === "");
// }

// function applyDeltaToValues(
// 	values: ScoreCellValue[][],
// 	playerIndex: number,
// 	delta: number,
// ) {
// 	const next = cloneValues(values);
// 	const rowIndex = findNextEmptyRow(next, playerIndex);

// 	if (rowIndex === -1) {
// 		return null;
// 	}

// 	next[rowIndex][playerIndex] = delta;
// 	return next;
// }

// function pushPositiveChunks(
// 	chunks: { count: number; striked: number; closed: boolean }[],
// 	points: number,
// ) {
// 	let remaining = points;

// 	while (remaining > 0) {
// 		const lastChunk = chunks[chunks.length - 1];
// 		const canAppendToLast =
// 			lastChunk &&
// 			!lastChunk.closed &&
// 			lastChunk.striked === 0 &&
// 			lastChunk.count < 5;

// 		if (canAppendToLast) {
// 			const addNow = Math.min(5 - lastChunk.count, remaining);
// 			lastChunk.count += addNow;
// 			remaining -= addNow;
// 			continue;
// 		}

// 		const newChunkSize = Math.min(5, remaining);
// 		chunks.push({
// 			count: newChunkSize,
// 			striked: 0,
// 			closed: false,
// 		});
// 		remaining -= newChunkSize;
// 	}
// }

// function strikeEarliestChunks(
// 	chunks: { count: number; striked: number; closed: boolean }[],
// 	pointsToStrike: number,
// ) {
// 	let remaining = pointsToStrike;

// 	for (let i = 0; i < chunks.length && remaining > 0; i++) {
// 		const activePoints = chunks[i].count - chunks[i].striked;

// 		if (activePoints <= 0) continue;

// 		const strikeNow = Math.min(activePoints, remaining);
// 		chunks[i].striked += strikeNow;
// 		chunks[i].closed = true;
// 		remaining -= strikeNow;
// 	}
// }

// function buildVisualChunks(events: number[]) {
// 	const chunks: { count: number; striked: number; closed: boolean }[] = [];

// 	for (const event of events) {
// 		if (event > 0) {
// 			pushPositiveChunks(chunks, event);
// 		} else {
// 			strikeEarliestChunks(chunks, Math.abs(event));
// 		}
// 	}

// 	return chunks;
// }

// function groupChunksIntoRows(
// 	chunks: { count: number; striked: number; closed: boolean }[],
// 	maxPointsPerRow = 15,
// ) {
// 	const rows: { count: number; striked: number; closed: boolean }[][] = [];
// 	let currentRow: { count: number; striked: number; closed: boolean }[] = [];
// 	let currentPoints = 0;

// 	for (const chunk of chunks) {
// 		if (
// 			currentRow.length > 0 &&
// 			currentPoints + chunk.count > maxPointsPerRow
// 		) {
// 			rows.push(currentRow);
// 			currentRow = [chunk];
// 			currentPoints = chunk.count;
// 		} else {
// 			currentRow.push(chunk);
// 			currentPoints += chunk.count;
// 		}
// 	}

// 	if (currentRow.length > 0) {
// 		rows.push(currentRow);
// 	}

// 	return rows;
// }

// function PlayerTallyBoard({ events }: { events: number[] }) {
// 	if (events.length === 0) {
// 		return (
// 			<div className="flex min-h-[110px] items-center justify-center sm:min-h-[130px]">
// 				<span className="text-sm text-slate-300">
// 					Tryck för att lägga poäng
// 				</span>
// 			</div>
// 		);
// 	}

// 	const chunks = buildVisualChunks(events);
// 	const rows = groupChunksIntoRows(chunks, 15);

// 	return (
// 		<div className="flex min-h-[110px] flex-col items-center gap-y-2.5 sm:min-h-[130px] sm:gap-y-3">
// 			{rows.map((row, rowIndex) => (
// 				<div
// 					key={`row-${rowIndex}`}
// 					className="flex items-center justify-center gap-x-1.5"
// 				>
// 					{row.map((chunk, chunkIndex) => (
// 						<TallyMarks
// 							key={`${rowIndex}-${chunkIndex}-${chunk.count}-${chunk.striked}-${chunk.closed}`}
// 							count={chunk.count}
// 							striked={chunk.striked}
// 						/>
// 					))}
// 				</div>
// 			))}
// 		</div>
// 	);
// }

// export default function ChicagoProtocol({
// 	players,
// 	values,
// 	onChange,
// 	onBatchChange,
// 	isLocked = false,
// }: ChicagoProtocolProps) {
// 	const [modal, setModal] = useState<ModalState>(null);

// 	useEffect(() => {
// 		if (!modal) return;

// 		const previousOverflow = document.body.style.overflow;
// 		document.body.style.overflow = "hidden";

// 		return () => {
// 			document.body.style.overflow = previousOverflow;
// 		};
// 	}, [modal]);

// 	const playerTotals = useMemo(
// 		() => players.map((_, index) => getPlayerTotal(values, index)),
// 		[players, values],
// 	);

// 	const playerEvents = useMemo(
// 		() => players.map((_, index) => getPlayerEvents(values, index)),
// 		[players, values],
// 	);

// 	const playerHasChicago = useMemo(
// 		() => playerEvents.map((events) => hasSaidChicago(events)),
// 		[playerEvents],
// 	);

// 	const playerStatusMessages = useMemo(
// 		() =>
// 			players.map((player, index) =>
// 				getPlayerStatusMessage(
// 					player.name,
// 					playerTotals[index],
// 					playerHasChicago[index],
// 				),
// 			),
// 		[players, playerTotals, playerHasChicago],
// 	);

// 	const addNormalScore = (playerIndex: number, delta: number) => {
// 		if (isLocked) return;

// 		if (onBatchChange) {
// 			onBatchChange((prev) => {
// 				const next = applyDeltaToValues(prev, playerIndex, delta);
// 				if (!next) {
// 					alert(
// 						"Chicago-protokollet är fullt. Öka antalet rader i protocolRegistry.",
// 					);
// 					return prev;
// 				}
// 				return next;
// 			});
// 		} else {
// 			const rowIndex = findNextEmptyRow(values, playerIndex);
// 			if (rowIndex === -1) {
// 				alert(
// 					"Chicago-protokollet är fullt. Öka antalet rader i protocolRegistry.",
// 				);
// 				return;
// 			}
// 			onChange(rowIndex, playerIndex, delta);
// 		}

// 		setModal(null);
// 	};

// 	const handleFourOfAKind = (playerIndex: number) => {
// 		if (isLocked) return;

// 		if (onBatchChange) {
// 			onBatchChange((prev) => {
// 				let next = cloneValues(prev);

// 				for (let index = 0; index < players.length; index++) {
// 					if (index === playerIndex) continue;

// 					const total = getPlayerTotal(next, index);
// 					if (total > 0) {
// 						const struckValues = applyDeltaToValues(
// 							next,
// 							index,
// 							-total,
// 						);
// 						if (struckValues) {
// 							next = struckValues;
// 						}
// 					}
// 				}

// 				const winnerValues = applyDeltaToValues(next, playerIndex, 8);
// 				if (!winnerValues) {
// 					alert(
// 						"Chicago-protokollet är fullt. Öka antalet rader i protocolRegistry.",
// 					);
// 					return prev;
// 				}

// 				return winnerValues;
// 			});
// 		} else {
// 			players.forEach((_, index) => {
// 				if (index === playerIndex) return;

// 				const total = playerTotals[index];
// 				if (total > 0) {
// 					const rowIndex = findNextEmptyRow(values, index);
// 					if (rowIndex !== -1) {
// 						onChange(rowIndex, index, -total);
// 					}
// 				}
// 			});

// 			const rowIndex = findNextEmptyRow(values, playerIndex);
// 			if (rowIndex !== -1) {
// 				onChange(rowIndex, playerIndex, 8);
// 			}
// 		}

// 		setModal(null);
// 	};

// 	const handleChicagoResult = (playerIndex: number, success: boolean) => {
// 		if (isLocked) return;

// 		const currentTotal = playerTotals[playerIndex];

// 		if (currentTotal < 15) {
// 			return;
// 		}

// 		const delta = success ? 15 : -15;

// 		if (onBatchChange) {
// 			onBatchChange((prev) => {
// 				const next = applyDeltaToValues(prev, playerIndex, delta);
// 				if (!next) {
// 					alert(
// 						"Chicago-protokollet är fullt. Öka antalet rader i protocolRegistry.",
// 					);
// 					return prev;
// 				}
// 				return next;
// 			});
// 		} else {
// 			const rowIndex = findNextEmptyRow(values, playerIndex);
// 			if (rowIndex === -1) {
// 				alert(
// 					"Chicago-protokollet är fullt. Öka antalet rader i protocolRegistry.",
// 				);
// 				return;
// 			}
// 			onChange(rowIndex, playerIndex, delta);
// 		}

// 		setModal(null);
// 	};

// 	const openScoreModal = (playerIndex: number) => {
// 		if (isLocked) return;

// 		setModal({
// 			type: "score",
// 			playerIndex,
// 		});
// 	};

// 	const openChicagoModal = (playerIndex: number) => {
// 		if (isLocked) return;

// 		setModal({
// 			type: "chicago",
// 			playerIndex,
// 		});
// 	};

// 	const activePlayerIndex = modal?.playerIndex ?? 0;
// 	const activePlayerName = players[activePlayerIndex]?.name ?? "";
// 	const activePlayerScore = playerTotals[activePlayerIndex] ?? 0;
// 	const activeHasChicago = playerHasChicago[activePlayerIndex];
// 	const activeStatusMessage = playerStatusMessages[activePlayerIndex];

// 	return (
// 		<>
// 			<div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
// 				{players.map((player, playerIndex) => {
// 					const total = playerTotals[playerIndex];
// 					const hasChicago = playerHasChicago[playerIndex];
// 					const canCallChicago = total >= 15;
// 					const statusMessage = playerStatusMessages[playerIndex];

// 					return (
// 						<div
// 							key={player.name}
// 							className="flex min-h-[360px] flex-col overflow-hidden rounded-[26px] border border-[#dbe5df] bg-white/72 shadow-[0_8px_24px_rgba(0,0,0,0.03)]"
// 						>
// 							<div className="flex items-start justify-between gap-4 border-b border-[#d8e3dc] bg-[#e7f1eb] p-5">
// 								<div className="min-w-0">
// 									<button
// 										type="button"
// 										onClick={() =>
// 											openScoreModal(playerIndex)
// 										}
// 										disabled={isLocked}
// 										className="text-left text-[1.2rem] font-black text-slate-900 transition hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-100"
// 									>
// 										{player.name}
// 									</button>

// 									<div className="mt-2 h-6">
// 										{hasChicago && (
// 											<span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-emerald-600">
// 												Chicago!
// 											</span>
// 										)}
// 									</div>
// 								</div>

// 								<div
// 									className={`shrink-0 text-[1.05rem] font-black sm:text-[1.15rem] ${
// 										total < 0
// 											? "text-rose-500"
// 											: "text-emerald-600"
// 									}`}
// 								>
// 									{total}p
// 								</div>
// 							</div>

// 							<button
// 								type="button"
// 								onClick={() => openScoreModal(playerIndex)}
// 								disabled={isLocked}
// 								className="block w-full flex-1 px-5 py-4 text-left transition hover:bg-white/35 disabled:cursor-not-allowed disabled:opacity-100"
// 							>
// 								<PlayerTallyBoard
// 									events={playerEvents[playerIndex]}
// 								/>

// 								{statusMessage && (
// 									<p className="mt-4 text-center text-sm font-semibold text-slate-600">
// 										{statusMessage}
// 									</p>
// 								)}
// 							</button>

// 							<div className="mt-auto px-4 pb-4 pt-2">
// 								<button
// 									type="button"
// 									onClick={() =>
// 										openChicagoModal(playerIndex)
// 									}
// 									disabled={!canCallChicago || isLocked}
// 									className={`inline-flex w-full items-center justify-center gap-2 rounded-[18px] px-5 py-4 text-[1rem] font-bold transition ${
// 										!canCallChicago || isLocked
// 											? "bg-white/40 text-slate-400"
// 											: hasChicago
// 												? "bg-emerald-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.22)] hover:bg-emerald-600"
// 												: "bg-white/80 text-slate-900 shadow-[0_6px_18px_rgba(0,0,0,0.03)] hover:-translate-y-0.5"
// 									}`}
// 								>
// 									<Crown size={17} />
// 									{hasChicago
// 										? "Har sagt Chicago"
// 										: "Säg Chicago"}
// 								</button>
// 							</div>
// 						</div>
// 					);
// 				})}
// 			</div>

// 			{/* {modal && !isLocked && (
// 				<div
// 					className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 px-4 py-8 backdrop-blur-[3px]"
// 					onClick={() => setModal(null)}
// 				>
// 					<div
// 						className="w-full max-w-[560px] rounded-[28px] bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.18)] sm:p-7"
// 						onClick={(e) => e.stopPropagation()}
// 					>
// 						<div className="mb-5 flex items-start justify-between gap-4">
// 							<div>
// 								<h2 className="text-[1.55rem] font-black text-slate-900 sm:text-[1.9rem]">
// 									{modal.type === "score"
// 										? `Poäng till ${activePlayerName}`
// 										: `Chicago för ${activePlayerName}`}
// 								</h2>

// 								<p className="mt-1 text-[1rem] text-slate-500">
// 									Nuvarande: {activePlayerScore}p
// 								</p>

// 								{modal.type === "chicago" &&
// 									activeHasChicago && (
// 										<p className="mt-1 text-sm font-semibold text-emerald-600">
// 											Spelaren har sagt Chicago tidigare,
// 											men måste fortfarande ha minst 15
// 											poäng för att säga det igen.
// 										</p>
// 									)}

// 								{modal.type === "chicago" &&
// 									activeStatusMessage && (
// 										<p className="mt-1 text-sm font-semibold text-slate-600">
// 											{activeStatusMessage}
// 										</p>
// 									)}
// 							</div>

// 							<button
// 								type="button"
// 								onClick={() => setModal(null)}
// 								className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
// 								aria-label="Stäng"
// 							>
// 								<X size={24} />
// 							</button>
// 						</div>

// 						{modal.type === "score" ? (
// 							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
// 								{scoreOptions.map((option) => (
// 									<button
// 										key={option.label}
// 										type="button"
// 										onClick={() =>
// 											option.label === "Fyrtal"
// 												? handleFourOfAKind(
// 														activePlayerIndex,
// 													)
// 												: addNormalScore(
// 														activePlayerIndex,
// 														option.value,
// 													)
// 										}
// 										className={`rounded-[18px] border px-5 py-4 text-[1.05rem] font-semibold transition sm:text-[1.1rem] ${
// 											option.variant === "accent"
// 												? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
// 												: "border-[#d8e3dc] bg-white text-slate-800 hover:bg-slate-50"
// 										}`}
// 									>
// 										{option.label} (+{option.value}p)
// 									</button>
// 								))}

// 								<button
// 									type="button"
// 									onClick={() => setModal(null)}
// 									className="rounded-[18px] border border-transparent px-5 py-4 text-[1.05rem] font-medium text-slate-500 transition hover:bg-slate-50 sm:col-span-2"
// 								>
// 									Avbryt
// 								</button>
// 							</div>
// 						) : (
// 							<div className="space-y-3">
// 								<p className="text-[1rem] leading-7 text-slate-500">
// 									Chicago kan bara sägas när spelaren har
// 									minst 15 poäng, även om spelaren redan har
// 									sagt Chicago tidigare.
// 								</p>

// 								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
// 									<button
// 										type="button"
// 										onClick={() =>
// 											handleChicagoResult(
// 												activePlayerIndex,
// 												true,
// 											)
// 										}
// 										className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-[1.05rem] font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:text-[1.1rem]"
// 									>
// 										Chicago! (+15p)
// 									</button>

// 									<button
// 										type="button"
// 										onClick={() =>
// 											handleChicagoResult(
// 												activePlayerIndex,
// 												false,
// 											)
// 										}
// 										className="rounded-[18px] border border-rose-200 bg-rose-50 px-5 py-4 text-[1.05rem] font-semibold text-rose-600 transition hover:bg-rose-100 sm:text-[1.1rem]"
// 									>
// 										Missad Chicago (-15p)
// 									</button>
// 								</div>

// 								<button
// 									type="button"
// 									onClick={() => setModal(null)}
// 									className="mt-2 w-full rounded-[18px] px-5 py-4 text-[1.05rem] font-medium text-slate-500 transition hover:bg-slate-50"
// 								>
// 									Avbryt
// 								</button>
// 							</div>
// 						)}
// 					</div>
// 				</div>
// 			)} */}

// 			{modal &&
// 				!isLocked &&
// 				createPortal(
// 					<div
// 						className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/35 px-4 py-4 backdrop-blur-[6px] sm:px-6 sm:py-6"
// 						onClick={() => setModal(null)}
// 					>
// 						<div
// 							className="max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-[28px] bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.22)] sm:p-7"
// 							onClick={(e) => e.stopPropagation()}
// 						>
// 							<div className="mb-5 flex items-start justify-between gap-4">
// 								<div>
// 									<h2 className="text-[1.55rem] font-black text-slate-900 sm:text-[1.9rem]">
// 										{modal.type === "score"
// 											? `Poäng till ${activePlayerName}`
// 											: `Chicago för ${activePlayerName}`}
// 									</h2>

// 									<p className="mt-1 text-[1rem] text-slate-500">
// 										Nuvarande: {activePlayerScore}p
// 									</p>

// 									{modal.type === "chicago" &&
// 										activeHasChicago && (
// 											<p className="mt-1 text-sm font-semibold text-emerald-600">
// 												Spelaren har sagt Chicago
// 												tidigare, men måste fortfarande
// 												ha minst 15 poäng för att säga
// 												det igen.
// 											</p>
// 										)}

// 									{modal.type === "chicago" &&
// 										activeStatusMessage && (
// 											<p className="mt-1 text-sm font-semibold text-slate-600">
// 												{activeStatusMessage}
// 											</p>
// 										)}
// 								</div>

// 								<button
// 									type="button"
// 									onClick={() => setModal(null)}
// 									className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
// 									aria-label="Stäng"
// 								>
// 									<X size={24} />
// 								</button>
// 							</div>

// 							{modal.type === "score" ? (
// 								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
// 									{scoreOptions.map((option) => (
// 										<button
// 											key={option.label}
// 											type="button"
// 											onClick={() =>
// 												option.label === "Fyrtal"
// 													? handleFourOfAKind(
// 															activePlayerIndex,
// 														)
// 													: addNormalScore(
// 															activePlayerIndex,
// 															option.value,
// 														)
// 											}
// 											className={`rounded-[18px] border px-5 py-4 text-[1.05rem] font-semibold transition sm:text-[1.1rem] ${
// 												option.variant === "accent"
// 													? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
// 													: "border-[#d8e3dc] bg-white text-slate-800 hover:bg-slate-50"
// 											}`}
// 										>
// 											{option.label} (+{option.value}p)
// 										</button>
// 									))}

// 									<button
// 										type="button"
// 										onClick={() => setModal(null)}
// 										className="rounded-[18px] border border-transparent px-5 py-4 text-[1.05rem] font-medium text-slate-500 transition hover:bg-slate-50 sm:col-span-2"
// 									>
// 										Avbryt
// 									</button>
// 								</div>
// 							) : (
// 								<div className="space-y-3">
// 									<p className="text-[1rem] leading-7 text-slate-500">
// 										Chicago kan bara sägas när spelaren har
// 										minst 15 poäng, även om spelaren redan
// 										har sagt Chicago tidigare.
// 									</p>

// 									<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
// 										<button
// 											type="button"
// 											onClick={() =>
// 												handleChicagoResult(
// 													activePlayerIndex,
// 													true,
// 												)
// 											}
// 											className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-[1.05rem] font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:text-[1.1rem]"
// 										>
// 											Chicago! (+15p)
// 										</button>

// 										<button
// 											type="button"
// 											onClick={() =>
// 												handleChicagoResult(
// 													activePlayerIndex,
// 													false,
// 												)
// 											}
// 											className="rounded-[18px] border border-rose-200 bg-rose-50 px-5 py-4 text-[1.05rem] font-semibold text-rose-600 transition hover:bg-rose-100 sm:text-[1.1rem]"
// 										>
// 											Missad Chicago (-15p)
// 										</button>
// 									</div>

// 									<button
// 										type="button"
// 										onClick={() => setModal(null)}
// 										className="mt-2 w-full rounded-[18px] px-5 py-4 text-[1.05rem] font-medium text-slate-500 transition hover:bg-slate-50"
// 									>
// 										Avbryt
// 									</button>
// 								</div>
// 							)}
// 						</div>
// 					</div>,
// 					document.body,
// 				)}
// 		</>
// 	);
// }

import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Crown, X } from "lucide-react";
import TallyMarks from "../components/chicago/TallyMarks";

type ScoreCellValue = number | "";

type Player = {
	name: string;
};

type ChicagoProtocolProps = {
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
	type: "score" | "chicago";
	playerIndex: number;
} | null;

type ScoreOption = {
	label: string;
	value: number;
	variant?: "default" | "accent";
};

const scoreOptions: ScoreOption[] = [
	{ label: "1 par", value: 1 },
	{ label: "2 par", value: 2 },
	{ label: "Triss", value: 3 },
	{ label: "Stege", value: 4 },
	{ label: "Färg", value: 5 },
	{ label: "Kåk", value: 6 },
	{ label: "Fyrtal", value: 8, variant: "accent" },
	{ label: "Straight Flush", value: 25 },
	{ label: "Royal Flush", value: 52 },
	{ label: "Utspel", value: 5 },
	{ label: "Utspel med två", value: 10 },
];

function cloneValues(values: ScoreCellValue[][]) {
	return values.map((row) => [...row]);
}

function getPlayerEvents(
	values: ScoreCellValue[][],
	playerIndex: number,
): number[] {
	return values
		.map((row) => row[playerIndex])
		.filter(
			(value): value is number =>
				value !== "" && !Number.isNaN(Number(value)),
		)
		.map(Number)
		.filter((value) => value !== 0);
}

function getPlayerTotal(values: ScoreCellValue[][], playerIndex: number) {
	return getPlayerEvents(values, playerIndex).reduce(
		(sum, value) => sum + value,
		0,
	);
}

function hasSaidChicago(events: number[]) {
	return events.includes(15) || events.includes(-15);
}

function getPlayerStatusMessage(
	playerName: string,
	total: number,
	hasChicago: boolean,
) {
	if (total >= 52 && hasChicago) {
		return `Grattis! ${playerName} har vunnit spelet, 52 poäng.`;
	}

	if (total >= 52 && !hasChicago) {
		return `${playerName} måste säga Chicago innan han kan vinna.`;
	}

	if (total >= 47) {
		return `${playerName} har köpstopp.`;
	}

	return "";
}

function findNextEmptyRow(values: ScoreCellValue[][], playerIndex: number) {
	return values.findIndex((row) => row[playerIndex] === "");
}

function applyDeltaToValues(
	values: ScoreCellValue[][],
	playerIndex: number,
	delta: number,
) {
	const next = cloneValues(values);
	const rowIndex = findNextEmptyRow(next, playerIndex);

	if (rowIndex === -1) {
		return null;
	}

	next[rowIndex][playerIndex] = delta;
	return next;
}

function pushPositiveChunks(
	chunks: { count: number; striked: number; closed: boolean }[],
	points: number,
) {
	let remaining = points;

	while (remaining > 0) {
		const lastChunk = chunks[chunks.length - 1];
		const canAppendToLast =
			lastChunk &&
			!lastChunk.closed &&
			lastChunk.striked === 0 &&
			lastChunk.count < 5;

		if (canAppendToLast) {
			const addNow = Math.min(5 - lastChunk.count, remaining);
			lastChunk.count += addNow;
			remaining -= addNow;
			continue;
		}

		const newChunkSize = Math.min(5, remaining);
		chunks.push({
			count: newChunkSize,
			striked: 0,
			closed: false,
		});
		remaining -= newChunkSize;
	}
}

function strikeEarliestChunks(
	chunks: { count: number; striked: number; closed: boolean }[],
	pointsToStrike: number,
) {
	let remaining = pointsToStrike;

	for (let i = 0; i < chunks.length && remaining > 0; i++) {
		const activePoints = chunks[i].count - chunks[i].striked;

		if (activePoints <= 0) continue;

		const strikeNow = Math.min(activePoints, remaining);
		chunks[i].striked += strikeNow;
		chunks[i].closed = true;
		remaining -= strikeNow;
	}
}

function buildVisualChunks(events: number[]) {
	const chunks: { count: number; striked: number; closed: boolean }[] = [];

	for (const event of events) {
		if (event > 0) {
			pushPositiveChunks(chunks, event);
		} else {
			strikeEarliestChunks(chunks, Math.abs(event));
		}
	}

	return chunks;
}

function groupChunksIntoRows(
	chunks: { count: number; striked: number; closed: boolean }[],
	maxPointsPerRow = 15,
) {
	const rows: { count: number; striked: number; closed: boolean }[][] = [];
	let currentRow: { count: number; striked: number; closed: boolean }[] = [];
	let currentPoints = 0;

	for (const chunk of chunks) {
		if (
			currentRow.length > 0 &&
			currentPoints + chunk.count > maxPointsPerRow
		) {
			rows.push(currentRow);
			currentRow = [chunk];
			currentPoints = chunk.count;
		} else {
			currentRow.push(chunk);
			currentPoints += chunk.count;
		}
	}

	if (currentRow.length > 0) {
		rows.push(currentRow);
	}

	return rows;
}

function PlayerTallyBoard({ events }: { events: number[] }) {
	if (events.length === 0) {
		return (
			<div className="flex min-h-[110px] items-center justify-center sm:min-h-[130px]">
				<span className="text-center text-sm text-slate-300">
					Tryck för att lägga poäng
				</span>
			</div>
		);
	}

	const chunks = buildVisualChunks(events);
	const rows = groupChunksIntoRows(chunks, 15);

	return (
		<div className="flex min-h-[110px] flex-col items-center gap-y-2.5 sm:min-h-[130px] sm:gap-y-3">
			{rows.map((row, rowIndex) => (
				<div
					key={`row-${rowIndex}`}
					className="flex items-center justify-center gap-x-1.5"
				>
					{row.map((chunk, chunkIndex) => (
						<TallyMarks
							key={`${rowIndex}-${chunkIndex}-${chunk.count}-${chunk.striked}-${chunk.closed}`}
							count={chunk.count}
							striked={chunk.striked}
						/>
					))}
				</div>
			))}
		</div>
	);
}

export default function ChicagoProtocol({
	players,
	values,
	onChange,
	onBatchChange,
	isLocked = false,
}: ChicagoProtocolProps) {
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

	const playerTotals = useMemo(
		() => players.map((_, index) => getPlayerTotal(values, index)),
		[players, values],
	);

	const playerEvents = useMemo(
		() => players.map((_, index) => getPlayerEvents(values, index)),
		[players, values],
	);

	const playerHasChicago = useMemo(
		() => playerEvents.map((events) => hasSaidChicago(events)),
		[playerEvents],
	);

	const playerStatusMessages = useMemo(
		() =>
			players.map((player, index) =>
				getPlayerStatusMessage(
					player.name,
					playerTotals[index],
					playerHasChicago[index],
				),
			),
		[players, playerTotals, playerHasChicago],
	);

	const addNormalScore = (playerIndex: number, delta: number) => {
		if (isLocked) return;

		if (onBatchChange) {
			onBatchChange((prev) => {
				const next = applyDeltaToValues(prev, playerIndex, delta);
				if (!next) {
					alert(
						"Chicago-protokollet är fullt. Öka antalet rader i protocolRegistry.",
					);
					return prev;
				}
				return next;
			});
		} else {
			const rowIndex = findNextEmptyRow(values, playerIndex);
			if (rowIndex === -1) {
				alert(
					"Chicago-protokollet är fullt. Öka antalet rader i protocolRegistry.",
				);
				return;
			}
			onChange(rowIndex, playerIndex, delta);
		}

		setModal(null);
	};

	const handleFourOfAKind = (playerIndex: number) => {
		if (isLocked) return;

		if (onBatchChange) {
			onBatchChange((prev) => {
				let next = cloneValues(prev);

				for (let index = 0; index < players.length; index++) {
					if (index === playerIndex) continue;

					const total = getPlayerTotal(next, index);
					if (total > 0) {
						const struckValues = applyDeltaToValues(
							next,
							index,
							-total,
						);
						if (struckValues) {
							next = struckValues;
						}
					}
				}

				const winnerValues = applyDeltaToValues(next, playerIndex, 8);
				if (!winnerValues) {
					alert(
						"Chicago-protokollet är fullt. Öka antalet rader i protocolRegistry.",
					);
					return prev;
				}

				return winnerValues;
			});
		} else {
			players.forEach((_, index) => {
				if (index === playerIndex) return;

				const total = playerTotals[index];
				if (total > 0) {
					const rowIndex = findNextEmptyRow(values, index);
					if (rowIndex !== -1) {
						onChange(rowIndex, index, -total);
					}
				}
			});

			const rowIndex = findNextEmptyRow(values, playerIndex);
			if (rowIndex !== -1) {
				onChange(rowIndex, playerIndex, 8);
			}
		}

		setModal(null);
	};

	const handleChicagoResult = (playerIndex: number, success: boolean) => {
		if (isLocked) return;

		const currentTotal = playerTotals[playerIndex];

		if (currentTotal < 15) {
			return;
		}

		const delta = success ? 15 : -15;

		if (onBatchChange) {
			onBatchChange((prev) => {
				const next = applyDeltaToValues(prev, playerIndex, delta);
				if (!next) {
					alert(
						"Chicago-protokollet är fullt. Öka antalet rader i protocolRegistry.",
					);
					return prev;
				}
				return next;
			});
		} else {
			const rowIndex = findNextEmptyRow(values, playerIndex);
			if (rowIndex === -1) {
				alert(
					"Chicago-protokollet är fullt. Öka antalet rader i protocolRegistry.",
				);
				return;
			}
			onChange(rowIndex, playerIndex, delta);
		}

		setModal(null);
	};

	const openScoreModal = (playerIndex: number) => {
		if (isLocked) return;

		setModal({
			type: "score",
			playerIndex,
		});
	};

	const openChicagoModal = (playerIndex: number) => {
		if (isLocked) return;

		setModal({
			type: "chicago",
			playerIndex,
		});
	};

	const activePlayerIndex = modal?.playerIndex ?? 0;
	const activePlayerName = players[activePlayerIndex]?.name ?? "";
	const activePlayerScore = playerTotals[activePlayerIndex] ?? 0;
	const activeHasChicago = playerHasChicago[activePlayerIndex];
	const activeStatusMessage = playerStatusMessages[activePlayerIndex];

	return (
		<>
			<div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
				{players.map((player, playerIndex) => {
					const total = playerTotals[playerIndex];
					const hasChicago = playerHasChicago[playerIndex];
					const canCallChicago = total >= 15;
					const statusMessage = playerStatusMessages[playerIndex];

					return (
						<div
							key={player.name}
							className="flex min-w-0 min-h-[360px] flex-col overflow-hidden rounded-[26px] border border-[#dbe5df] bg-white/72 shadow-[0_8px_24px_rgba(0,0,0,0.03)]"
						>
							<div className="flex items-start justify-between gap-4 border-b border-[#d8e3dc] bg-[#e7f1eb] p-5">
								<div className="min-w-0">
									<button
										type="button"
										onClick={() =>
											openScoreModal(playerIndex)
										}
										disabled={isLocked}
										className="text-left text-[1.2rem] font-black text-slate-900 transition hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-100"
									>
										{player.name}
									</button>

									<div className="mt-2 h-6">
										{hasChicago && (
											<span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-emerald-600">
												Chicago!
											</span>
										)}
									</div>
								</div>

								<div
									className={`shrink-0 text-[1.05rem] font-black sm:text-[1.15rem] ${
										total < 0
											? "text-rose-500"
											: "text-emerald-600"
									}`}
								>
									{total}p
								</div>
							</div>

							<button
								type="button"
								onClick={() => openScoreModal(playerIndex)}
								disabled={isLocked}
								className="block w-full min-w-0 flex-1 px-4 py-4 text-left transition hover:bg-white/35 disabled:cursor-not-allowed disabled:opacity-100 sm:px-5"
							>
								<PlayerTallyBoard
									events={playerEvents[playerIndex]}
								/>

								{statusMessage && (
									<p className="mt-4 text-center text-sm font-semibold text-slate-600">
										{statusMessage}
									</p>
								)}
							</button>

							<div className="mt-auto px-4 pb-4 pt-2">
								<button
									type="button"
									onClick={() =>
										openChicagoModal(playerIndex)
									}
									disabled={!canCallChicago || isLocked}
									className={`inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-[18px] px-4 py-4 text-[1rem] font-bold transition ${
										!canCallChicago || isLocked
											? "bg-white/40 text-slate-400"
											: hasChicago
												? "bg-emerald-500 text-white shadow-[0_10px_24px_rgba(16,185,129,0.22)] hover:bg-emerald-600"
												: "bg-white/80 text-slate-900 shadow-[0_6px_18px_rgba(0,0,0,0.03)] hover:-translate-y-0.5"
									}`}
								>
									<Crown size={17} className="shrink-0" />
									<span className="truncate">
										{hasChicago
											? "Har sagt Chicago"
											: "Säg Chicago"}
									</span>
								</button>
							</div>
						</div>
					);
				})}
			</div>

			{modal &&
				!isLocked &&
				createPortal(
					<div
						className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/20 px-4 py-6 backdrop-blur-sm"
						onClick={() => setModal(null)}
					>
						<div
							className="relative my-auto w-full max-w-[560px] rounded-[28px] bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.18)] sm:p-7"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="mb-5 flex items-start justify-between gap-4">
								<div className="min-w-0">
									<h2 className="text-[1.4rem] font-black text-slate-900 sm:text-[1.9rem]">
										{modal.type === "score"
											? `Poäng till ${activePlayerName}`
											: `Chicago för ${activePlayerName}`}
									</h2>

									<p className="mt-1 text-[1rem] text-slate-500">
										Nuvarande: {activePlayerScore}p
									</p>

									{modal.type === "chicago" &&
										activeHasChicago && (
											<p className="mt-1 text-sm font-semibold text-emerald-600">
												Spelaren har sagt Chicago
												tidigare, men måste fortfarande
												ha minst 15 poäng för att säga
												det igen.
											</p>
										)}

									{modal.type === "chicago" &&
										activeStatusMessage && (
											<p className="mt-1 text-sm font-semibold text-slate-600">
												{activeStatusMessage}
											</p>
										)}
								</div>

								<button
									type="button"
									onClick={() => setModal(null)}
									className="shrink-0 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
									aria-label="Stäng"
								>
									<X size={24} />
								</button>
							</div>

							{modal.type === "score" ? (
								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
									{scoreOptions.map((option) => (
										<button
											key={option.label}
											type="button"
											onClick={() =>
												option.label === "Fyrtal"
													? handleFourOfAKind(
															activePlayerIndex,
														)
													: addNormalScore(
															activePlayerIndex,
															option.value,
														)
											}
											className={`w-full rounded-[18px] border px-5 py-4 text-[1.05rem] font-semibold transition sm:text-[1.1rem] ${
												option.variant === "accent"
													? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
													: "border-[#d8e3dc] bg-white text-slate-800 hover:bg-slate-50"
											}`}
										>
											{option.label} (+{option.value}p)
										</button>
									))}

									<button
										type="button"
										onClick={() => setModal(null)}
										className="rounded-[18px] border border-transparent px-5 py-4 text-[1.05rem] font-medium text-slate-500 transition hover:bg-slate-50 sm:col-span-2"
									>
										Avbryt
									</button>
								</div>
							) : (
								<div className="space-y-3">
									<p className="text-[1rem] leading-7 text-slate-500">
										Chicago kan bara sägas när spelaren har
										minst 15 poäng, även om spelaren redan
										har sagt Chicago tidigare.
									</p>

									<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
										<button
											type="button"
											onClick={() =>
												handleChicagoResult(
													activePlayerIndex,
													true,
												)
											}
											className="w-full rounded-[18px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-[1.05rem] font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:text-[1.1rem]"
										>
											Chicago! (+15p)
										</button>

										<button
											type="button"
											onClick={() =>
												handleChicagoResult(
													activePlayerIndex,
													false,
												)
											}
											className="w-full rounded-[18px] border border-rose-200 bg-rose-50 px-5 py-4 text-[1.05rem] font-semibold text-rose-600 transition hover:bg-rose-100 sm:text-[1.1rem]"
										>
											Missad Chicago (-15p)
										</button>
									</div>

									<button
										type="button"
										onClick={() => setModal(null)}
										className="mt-2 w-full rounded-[18px] px-5 py-4 text-[1.05rem] font-medium text-slate-500 transition hover:bg-slate-50"
									>
										Avbryt
									</button>
								</div>
							)}
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}