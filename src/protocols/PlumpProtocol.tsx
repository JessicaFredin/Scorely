import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Check, ChevronRight, Circle, X } from "lucide-react";

type ScoreCellValue = number | "";

type Player = {
	name: string;
};

type PlumpProtocolProps = {
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
	roundIndex: number;
	phase: "bids" | "plumps";
	bids: Array<number | null>;
	plumps: boolean[];
} | null;

type DecodedPlumpValue = {
	bid: number;
	plump: boolean;
	points: number;
};

function cloneValues(values: ScoreCellValue[][]) {
	return values.map((row) => [...row]);
}

function buildPlumpRounds(playerCount: number) {
	const descending = Array.from({ length: 10 }, (_, i) => 10 - i);
	const ones = Array.from({ length: playerCount - 1 }, () => 1);
	const ascending = Array.from({ length: 9 }, (_, i) => i + 2);

	return [...descending, ...ones, ...ascending];
}

function getBidOrder(playerCount: number, roundIndex: number) {
	const startPlayerIndex = roundIndex % playerCount;

	return Array.from({ length: playerCount }, (_, offset) => {
		return (startPlayerIndex + offset) % playerCount;
	});
}

function encodePlumpValue(bid: number, plump: boolean) {
	return plump ? 200 + bid : 100 + bid;
}

function decodePlumpValue(value: ScoreCellValue): DecodedPlumpValue | null {
	if (value === "" || typeof value !== "number") return null;

	if (value >= 200) {
		const bid = value - 200;

		return {
			bid,
			plump: true,
			points: 0,
		};
	}

	if (value >= 100) {
		const bid = value - 100;

		return {
			bid,
			plump: false,
			points: 10 + bid,
		};
	}

	return {
		bid: 0,
		plump: false,
		points: value,
	};
}

function getPlumpPlayerTotal(values: ScoreCellValue[][], playerIndex: number) {
	return values.reduce((sum, row) => {
		const decoded = decodePlumpValue(row[playerIndex]);
		return sum + (decoded ? decoded.points : 0);
	}, 0);
}

function isRowFilled(row: ScoreCellValue[]) {
	return row.every((cell) => cell !== "");
}

function getCurrentRoundIndex(values: ScoreCellValue[][], roundCount: number) {
	for (let i = 0; i < roundCount; i++) {
		if (!isRowFilled(values[i] ?? [])) return i;
	}

	return -1;
}

function getCurrentBidTurnIndex(bids: Array<number | null>, order: number[]) {
	for (let i = 0; i < order.length; i++) {
		if (bids[order[i]] === null) return i;
	}

	return -1;
}

function getBidOptions(
	cardCount: number,
	playerCount: number,
	bids: Array<number | null>,
	order: number[],
) {
	const currentTurnIndex = getCurrentBidTurnIndex(bids, order);
	if (currentTurnIndex === -1) return [];

	const currentPlayerIndex = order[currentTurnIndex];
	const isLastPlayer = currentTurnIndex === playerCount - 1;

	return Array.from({ length: cardCount + 1 }, (_, i) => i).filter(
		(option) => {
			if (!isLastPlayer) return true;

			const previousSum = bids.reduce<number>((sum, bid, index) => {
				if (index === currentPlayerIndex) return sum;
				return sum + (typeof bid === "number" ? bid : 0);
			}, 0);

			return previousSum + option !== cardCount;
		},
	);
}

export default function PlumpProtocol({
	players,
	values,
	onChange,
	onBatchChange,
	isLocked = false,
}: PlumpProtocolProps) {
	const [modal, setModal] = useState<ModalState>(null);

	const rounds = useMemo(
		() => buildPlumpRounds(players.length),
		[players.length],
	);

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
		() => players.map((_, index) => getPlumpPlayerTotal(values, index)),
		[players, values],
	);

	const currentRoundIndex = useMemo(
		() => getCurrentRoundIndex(values, rounds.length),
		[values, rounds.length],
	);

	const openRoundModal = (roundIndex: number) => {
		if (isLocked) return;
		if (roundIndex !== currentRoundIndex) return;

		setModal({
			roundIndex,
			phase: "bids",
			bids: Array.from({ length: players.length }, () => null),
			plumps: Array.from({ length: players.length }, () => false),
		});
	};

	const closeModal = () => {
		setModal(null);
	};

	const modalOrder = useMemo(() => {
		if (!modal) return [];
		return getBidOrder(players.length, modal.roundIndex);
	}, [players.length, modal]);

	const modalCardCount =
		modal?.roundIndex !== undefined ? rounds[modal.roundIndex] : 0;

	const modalCurrentTurnIndex = modal
		? getCurrentBidTurnIndex(modal.bids, modalOrder)
		: -1;

	const modalCurrentPlayerIndex =
		modal && modalCurrentTurnIndex >= 0
			? modalOrder[modalCurrentTurnIndex]
			: 0;

	const bidOptions = modal
		? getBidOptions(modalCardCount, players.length, modal.bids, modalOrder)
		: [];

	const handleSelectBid = (bid: number) => {
		if (!modal || modal.phase !== "bids" || modalCurrentTurnIndex === -1)
			return;

		const nextBids = [...modal.bids];
		nextBids[modalCurrentPlayerIndex] = bid;

		const nextTurnIndex = getCurrentBidTurnIndex(nextBids, modalOrder);

		if (nextTurnIndex === -1) {
			setModal({
				...modal,
				bids: nextBids,
				phase: "plumps",
			});
			return;
		}

		setModal({
			...modal,
			bids: nextBids,
		});
	};

	const handleTogglePlump = (playerIndex: number) => {
		if (!modal || modal.phase !== "plumps") return;

		const nextPlumps = [...modal.plumps];
		nextPlumps[playerIndex] = !nextPlumps[playerIndex];

		setModal({
			...modal,
			plumps: nextPlumps,
		});
	};

	const handleSaveRound = () => {
		if (!modal) return;

		const hasMissingBid = modal.bids.some((bid) => bid === null);
		if (hasMissingBid) return;

		const encodedRow = modal.bids.map((bid, index) =>
			encodePlumpValue(bid ?? 0, modal.plumps[index]),
		);

		if (onBatchChange) {
			onBatchChange((prev) => {
				const next = cloneValues(prev);

				for (
					let playerIndex = 0;
					playerIndex < players.length;
					playerIndex++
				) {
					next[modal.roundIndex][playerIndex] =
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
					modal.roundIndex,
					playerIndex,
					encodedRow[playerIndex],
				);
			}
		}

		closeModal();
	};

	return (
		<>
			<div className="overflow-x-auto">
				<div
					style={
						{
							"--players": players.length,
						} as React.CSSProperties
					}
					className="min-w-[620px] overflow-hidden rounded-[28px] border border-[#dbe5df] bg-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.03)]"
				>
					<div className="grid grid-cols-[76px_repeat(var(--players),minmax(110px,1fr))] bg-[#e7f1eb]">
						<div className="border-b border-r border-[#d8e3dc] px-3 py-4 text-sm font-black uppercase tracking-[0.08em] text-slate-800">
							Kort
						</div>

						{players.map((player) => (
							<div
								key={player.name}
								className="border-b border-[#d8e3dc] px-3 py-4 text-center text-sm font-black uppercase tracking-[0.08em] text-slate-800"
							>
								{player.name}
							</div>
						))}
					</div>

					{rounds.map((cardCount, roundIndex) => {
						const isCurrent = roundIndex === currentRoundIndex;

						return (
							<div
								key={`${cardCount}-${roundIndex}`}
								onClick={() => openRoundModal(roundIndex)}
								className={`grid cursor-default grid-cols-[76px_repeat(var(--players),minmax(110px,1fr))] ${
									isCurrent && !isLocked
										? "cursor-pointer bg-[#d6ebe0]"
										: "bg-transparent"
								}`}
							>
								<div
									className={`flex items-center gap-2 border-r border-t border-[#d8e3dc] px-3 py-4 text-[1rem] font-black transition ${
										isCurrent && !isLocked
											? "bg-[#c0ddd0] text-slate-900"
											: "text-slate-500"
									}`}
								>
									{isCurrent && (
										<ChevronRight
											size={16}
											className="shrink-0 text-emerald-500"
										/>
									)}
									<span>{cardCount}</span>
								</div>

								{players.map((player, playerIndex) => {
									const decoded = decodePlumpValue(
										values[roundIndex]?.[playerIndex] ?? "",
									);

									return (
										<div
											key={`${roundIndex}-${player.name}`}
											className={`flex min-h-[56px] items-center justify-center border-t border-[#d8e3dc] px-3 py-4 text-center ${
												isCurrent && !isLocked
													? "transition hover:bg-white/15"
													: ""
											}`}
										>
											{decoded ? (
												decoded.plump ? (
													<span className="inline-block h-8 w-8 rounded-full bg-[#4a5d54]" />
												) : (
													<span className="text-[1rem] font-black text-emerald-600">
														{decoded.points}
													</span>
												)
											) : (
												<span className="text-slate-300">
													–
												</span>
											)}
										</div>
									);
								})}
							</div>
						);
					})}

					<div className="grid grid-cols-[76px_repeat(var(--players),minmax(110px,1fr))] bg-[#d6ebe0]">
						<div className="border-r border-t border-[#d8e3dc] px-3 py-4 text-[1rem] font-black text-slate-900">
							Totalt
						</div>

						{players.map((player, playerIndex) => (
							<div
								key={`total-${player.name}`}
								className="flex items-center justify-center border-t border-[#d8e3dc] px-3 py-4 text-center"
							>
								<span className="text-[1rem] font-black text-emerald-600">
									{playerTotals[playerIndex]}
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
							className="relative my-auto w-full max-w-[560px] rounded-[28px] bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.18)] sm:p-8"
							onClick={(e) => e.stopPropagation()}
						>
							{modal.phase === "bids" ? (
								<>
									<div className="text-center">
										<p className="text-sm font-medium uppercase tracking-[0.08em] text-slate-500">
											Runda med {modalCardCount} kort
										</p>
										<h2 className="mt-2 text-[2rem] font-black text-slate-900">
											{
												players[modalCurrentPlayerIndex]
													.name
											}
										</h2>
										<p className="mt-1 text-[1.1rem] text-slate-500">
											Hur många stick?
										</p>
									</div>

									{modalCurrentTurnIndex > 0 && (
										<div className="mt-6 rounded-[18px] bg-[#f7faf8] px-5 py-4">
											<div className="space-y-2">
												{modalOrder
													.slice(
														0,
														modalCurrentTurnIndex,
													)
													.map((playerIndex) => (
														<div
															key={
																players[
																	playerIndex
																].name
															}
															className="flex items-center justify-between gap-4 text-[1rem]"
														>
															<span className="text-slate-500">
																{
																	players[
																		playerIndex
																	].name
																}
															</span>
															<span className="font-bold text-slate-900">
																{
																	modal.bids[
																		playerIndex
																	]
																}{" "}
																stick
															</span>
														</div>
													))}

												<div className="mt-2 border-t border-[#d8e3dc] pt-2">
													<div className="flex items-center justify-between gap-4 text-[1rem] font-semibold">
														<span className="text-slate-500">
															Totalt sagt
														</span>
														<span className="text-slate-900">
															{modal.bids.reduce<number>(
																(sum, bid) =>
																	sum +
																	(typeof bid ===
																	"number"
																		? bid
																		: 0),
																0,
															)}{" "}
															/ {modalCardCount}
														</span>
													</div>
												</div>
											</div>
										</div>
									)}

									<div className="mt-6 grid grid-cols-4 gap-3">
										{bidOptions.map((option) => (
											<button
												key={option}
												type="button"
												onClick={() =>
													handleSelectBid(option)
												}
												className="rounded-[18px] border border-[#d8e3dc] px-5 py-5 text-[1.2rem] font-black text-slate-900 transition hover:bg-slate-50"
											>
												{option}
											</button>
										))}
									</div>

									{modalCurrentTurnIndex ===
										players.length - 1 && (
										<div className="mt-6 flex items-start justify-center gap-2 text-center text-[1rem] text-slate-500">
											<AlertTriangle
												size={18}
												className="mt-0.5 shrink-0 text-amber-500"
											/>
											<p>
												Sista spelaren – summan får ej
												bli lika med antal kort
											</p>
										</div>
									)}

									<p className="mt-6 text-center text-[1rem] text-slate-500">
										Spelare {modalCurrentTurnIndex + 1} av{" "}
										{players.length}
									</p>
								</>
							) : (
								<>
									<div className="text-center">
										<h2 className="text-[2rem] font-black text-slate-900">
											Vem fick plump?
										</h2>
										<p className="mt-2 text-[1.1rem] text-slate-500">
											Välj de spelare som INTE fick sina
											stick
										</p>
									</div>

									<div className="mt-6 space-y-2 text-[1rem]">
										{players.map((player, index) => (
											<div
												key={player.name}
												className="flex items-center justify-between gap-4"
											>
												<span className="text-slate-500">
													{player.name}
												</span>
												<span className="font-semibold text-slate-900">
													Sa {modal.bids[index]} stick
												</span>
											</div>
										))}
									</div>

									<div className="mt-4 rounded-[18px] bg-[#f7faf8] px-5 py-4">
										<div className="flex items-center justify-between gap-4 text-[1rem] font-semibold">
											<span className="text-slate-500">
												Totalt sagt
											</span>
											<span className="text-slate-900">
												{modal.bids.reduce<number>(
													(sum, bid) =>
														sum +
														(typeof bid === "number"
															? bid
															: 0),
													0,
												)}{" "}
												/ {modalCardCount}
											</span>
										</div>
									</div>

									<div className="mt-6 space-y-3">
										{players.map((player, index) => {
											const bid = modal.bids[index] ?? 0;
											const isPlump = modal.plumps[index];
											const roundPoints = 10 + bid;

											return (
												<button
													key={player.name}
													type="button"
													onClick={() =>
														handleTogglePlump(index)
													}
													className={`flex w-full items-center justify-between rounded-[18px] border px-5 py-5 text-left transition ${
														isPlump
															? "border-rose-200 bg-rose-50"
															: "border-[#d8e3dc] bg-white"
													}`}
												>
													<div className="flex items-center gap-4">
														<span
															className={`flex h-8 w-8 items-center justify-center rounded-full border ${
																isPlump
																	? "border-[#4a5d54] bg-[#4a5d54] text-white"
																	: "border-emerald-300 bg-white text-emerald-500"
															}`}
														>
															{isPlump ? (
																<Circle
																	size={16}
																	className="fill-current"
																/>
															) : (
																<Check
																	size={18}
																/>
															)}
														</span>

														<span
															className={`text-[1.05rem] font-bold ${
																isPlump
																	? "text-rose-500"
																	: "text-slate-900"
															}`}
														>
															{player.name}
														</span>
													</div>

													<span
														className={`text-[1.05rem] font-black ${
															isPlump
																? "text-rose-500"
																: "text-emerald-500"
														}`}
													>
														{isPlump
															? "Plump!"
															: `${roundPoints} poäng`}
													</span>
												</button>
											);
										})}
									</div>

									<div className="mt-6">
										<button
											type="button"
											onClick={handleSaveRound}
											className="w-full rounded-[18px] bg-emerald-500 px-5 py-5 text-[1.1rem] font-bold text-white transition hover:bg-emerald-600"
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
