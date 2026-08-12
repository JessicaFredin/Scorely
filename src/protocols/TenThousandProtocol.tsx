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

	/*
		MOBILE:
		- whole protocol fills available width
		- round column stays compact
		- player columns share the remaining width equally

		DESKTOP:
		- same idea, but larger round column
	*/
	const mobileGridTemplateColumns = `76px repeat(${players.length}, minmax(0, 1fr))`;

	const desktopGridTemplateColumns = `100px repeat(${players.length}, minmax(0, 1fr))`;

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

				if (rowIndex === lastRowIndex && !winnerExists) {
					next.push(createEmptyRow(players.length));
				}

				return next;
			});

			return;
		}

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

	const renderHeader = (gridTemplateColumns: string, isDesktop: boolean) => (
		<div
			className="grid w-full bg-[#e7f1eb]"
			style={{
				gridTemplateColumns,
			}}
		>
			<div
				className={`
					flex
					items-center
					justify-center
					whitespace-nowrap
					border-b
					border-r
					border-[#d8e3dc]
					text-center
					font-black
					uppercase
					text-slate-800
					${
						isDesktop
							? "min-h-[62px] px-4 py-4 text-sm tracking-[0.05em]"
							: "min-h-[52px] px-2 py-2 text-[10px] tracking-[0.02em]"
					}
				`}
			>
				{gameName}
			</div>

			{players.map((player) => (
				<div
					key={player.name}
					className={`
						flex
						min-w-0
						items-center
						justify-center
						border-b
						border-[#d8e3dc]
						text-center
						${isDesktop ? "min-h-[62px] px-4 py-4" : "min-h-[52px] px-1.5 py-2"}
					`}
				>
					<span
						className={`
							whitespace-nowrap
							font-black
							text-slate-800
							${isDesktop ? "text-base" : "text-[11px]"}
						`}
					>
						{player.name}
					</span>
				</div>
			))}
		</div>
	);

	const renderStatus = (gridTemplateColumns: string, isDesktop: boolean) => (
		<div
			className="grid w-full bg-[#eef7f1]"
			style={{
				gridTemplateColumns,
			}}
		>
			<div
				className={`
					flex
					items-center
					justify-center
					whitespace-nowrap
					border-b
					border-r
					border-[#d8e3dc]
					text-center
					font-black
					text-slate-900
					${
						isDesktop
							? "min-h-[62px] px-4 py-4 text-base"
							: "min-h-[48px] px-2 py-2 text-[11px]"
					}
				`}
			>
				Status
			</div>

			{players.map((player, playerIndex) => (
				<div
					key={`status-${player.name}`}
					className={`
							flex
							min-w-0
							items-center
							justify-center
							border-b
							border-[#d8e3dc]
							text-center
							${isDesktop ? "min-h-[62px] px-4 py-4" : "min-h-[48px] px-1 py-2"}
						`}
				>
					<span
						className={`
								whitespace-nowrap
								font-black
								${getStatusClass(totals[playerIndex])}
								${isDesktop ? "text-base" : "text-[10px]"}
							`}
					>
						{getStatusLabel(totals[playerIndex])}
					</span>
				</div>
			))}
		</div>
	);

	const renderRounds = (gridTemplateColumns: string, isDesktop: boolean) =>
		safeValues.map((_, rowIndex) => {
			const rowBg = rowIndex % 2 === 0 ? "bg-white/70" : "bg-[#f7faf8]";

			return (
				<div
					key={`row-${rowIndex}`}
					className="grid w-full"
					style={{
						gridTemplateColumns,
					}}
				>
					<div
						className={`
							flex
							items-center
							justify-center
							whitespace-nowrap
							border-r
							border-t
							border-[#d8e3dc]
							text-center
							${rowBg}
							${isDesktop ? "min-h-[110px] px-4 py-5" : "min-h-[58px] px-2 py-2"}
						`}
					>
						<span
							className={`
								whitespace-nowrap
								font-black
								text-slate-900
								${isDesktop ? "text-base" : "text-[11px]"}
							`}
						>
							Runda {rowIndex + 1}
						</span>
					</div>

					{players.map((player, playerIndex) => {
						const rawValue = safeValues[rowIndex]?.[playerIndex];

						const shownValue =
							typeof rawValue === "number" ? rawValue : 0;

						return (
							<button
								key={`cell-${rowIndex}-${player.name}`}
								type="button"
								onClick={() => openCell(rowIndex, playerIndex)}
								disabled={isLocked}
								className={`
										flex
										min-w-0
										items-center
										justify-center
										border-t
										border-[#d8e3dc]
										text-center
										transition
										${rowBg}
										${isDesktop ? "min-h-[110px] px-4 py-5" : "min-h-[58px] px-1.5 py-2"}
										${
											isLocked
												? "cursor-default"
												: "cursor-pointer hover:bg-emerald-50/70 active:bg-emerald-100/60"
										}
									`}
							>
								<span
									className={`
											whitespace-nowrap
											font-black
											tabular-nums
											${
												shownValue >= ENTRY_TARGET
													? "text-emerald-600"
													: shownValue > 0
														? "text-slate-700"
														: "text-slate-400"
											}
											${isDesktop ? "text-[1.1rem]" : "text-[12px]"}
										`}
								>
									{shownValue}
								</span>
							</button>
						);
					})}
				</div>
			);
		});

	const renderTotal = (gridTemplateColumns: string, isDesktop: boolean) => (
		<div
			className="grid w-full bg-[#dff0e7]"
			style={{
				gridTemplateColumns,
			}}
		>
			<div
				className={`
					flex
					items-center
					justify-center
					whitespace-nowrap
					border-r
					border-t
					border-[#cfe0d6]
					font-black
					text-slate-900
					${
						isDesktop
							? "min-h-[62px] px-4 py-4 text-[1.1rem]"
							: "min-h-[50px] px-2 py-2 text-[11px]"
					}
				`}
			>
				Totalt
			</div>

			{players.map((player, playerIndex) => (
				<div
					key={`total-${player.name}`}
					className={`
							flex
							min-w-0
							items-center
							justify-center
							border-t
							border-[#cfe0d6]
							${isDesktop ? "min-h-[62px] px-4 py-4" : "min-h-[50px] px-1.5 py-2"}
						`}
				>
					<span
						className={`
								whitespace-nowrap
								font-black
								tabular-nums
								${totals[playerIndex] >= WIN_TARGET ? "text-emerald-600" : "text-slate-900"}
								${isDesktop ? "text-[1.35rem]" : "text-[13px]"}
							`}
					>
						{totals[playerIndex]}
					</span>
				</div>
			))}
		</div>
	);

	return (
		<>
			{/* =====================================================
			    MOBILE
			===================================================== */}

			<div className="w-full sm:hidden">
				<div
					className="
						w-full
						overflow-hidden
						rounded-[22px]
						border
						border-[#dbe5df]
						bg-white/70
						shadow-[0_8px_24px_rgba(0,0,0,0.03)]
					"
				>
					{renderHeader(mobileGridTemplateColumns, false)}

					{renderStatus(mobileGridTemplateColumns, false)}

					{renderRounds(mobileGridTemplateColumns, false)}

					{renderTotal(mobileGridTemplateColumns, false)}
				</div>
			</div>

			{/* =====================================================
			    DESKTOP
			===================================================== */}

			<div className="hidden w-full sm:block">
				<div
					className="
						w-full
						overflow-hidden
						rounded-[28px]
						border
						border-[#dbe5df]
						bg-white/70
						shadow-[0_8px_24px_rgba(0,0,0,0.03)]
					"
				>
					{renderHeader(desktopGridTemplateColumns, true)}

					{renderStatus(desktopGridTemplateColumns, true)}

					{renderRounds(desktopGridTemplateColumns, true)}

					{renderTotal(desktopGridTemplateColumns, true)}
				</div>
			</div>

			{/* =====================================================
			    SCORE MODAL
			===================================================== */}

			{modal &&
				createPortal(
					<div
						className="
							fixed
							inset-0
							z-[9999]
							flex
							items-center
							justify-center
							overflow-y-auto
							bg-black/30
							px-4
							py-6
							backdrop-blur-sm
						"
						onClick={closeModal}
					>
						<div
							className="
								relative
								my-auto
								w-full
								max-w-[520px]
								rounded-[28px]
								bg-white
								p-6
								shadow-[0_24px_60px_rgba(0,0,0,0.18)]
								sm:p-8
							"
							onClick={(event) => event.stopPropagation()}
						>
							<div className="text-center">
								<h2 className="pr-8 text-2xl font-black text-slate-900 sm:text-[2rem]">
									Runda {modal.rowIndex + 1} –{" "}
									{players[modal.playerIndex].name}
								</h2>

								<p className="mt-2 text-sm text-slate-500 sm:text-[1.05rem]">
									Skriv poängen för rundan
								</p>

								{!modalPlayerIsOnBoard && (
									<p className="mt-2 text-sm font-semibold text-amber-600">
										För att komma in måste rundan vara minst
										1000 poäng.
									</p>
								)}
							</div>

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
									className="
										flex
										h-12
										w-12
										items-center
										justify-center
										rounded-full
										bg-[#dfe9e3]
										text-slate-900
										transition
										hover:bg-[#d3dfd8]
										active:scale-95
									"
								>
									<Minus size={22} />
								</button>

								<div className="min-w-[140px] text-center">
									<div className="text-[2rem] font-black tabular-nums text-slate-900">
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
									className="
										flex
										h-12
										w-12
										items-center
										justify-center
										rounded-full
										bg-[#dfe9e3]
										text-slate-900
										transition
										hover:bg-[#d3dfd8]
										active:scale-95
									"
								>
									<Plus size={22} />
								</button>
							</div>

							<div className="mt-8 grid grid-cols-4 gap-2 sm:gap-3">
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
											className={`
												rounded-[14px]
												border
												px-2
												py-3
												text-center
												text-sm
												font-bold
												tabular-nums
												transition
												sm:rounded-[16px]
												sm:px-3
												${
													modal.value === score
														? "border-emerald-400 bg-emerald-50 text-slate-900"
														: "border-[#d8e3dc] bg-white text-slate-700 hover:bg-slate-50"
												}
												${disabled ? "cursor-not-allowed opacity-35 hover:bg-white" : ""}
											`}
										>
											{score}
										</button>
									);
								})}
							</div>

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
									className={`
										w-full
										rounded-[18px]
										px-5
										py-4
										text-base
										font-black
										text-white
										transition
										sm:py-5
										sm:text-[1.1rem]
										${
											modalValueIsValid
												? "bg-emerald-500 hover:bg-emerald-600"
												: "cursor-not-allowed bg-[#93d5bf]"
										}
									`}
								>
									Bekräfta resultat
								</button>
							</div>

							<button
								type="button"
								onClick={closeModal}
								className="
									absolute
									right-4
									top-4
									rounded-full
									p-2
									text-slate-400
									transition
									hover:bg-slate-100
									hover:text-slate-700
								"
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
