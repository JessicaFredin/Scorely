import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Minus, Plus, X } from "lucide-react";

export type ScoreCellValue = number | "";

type Player = {
	name: string;
};

type GigantYatzyProtocolProps = {
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

type SectionKey =
	| "upper"
	| "pairs"
	| "same"
	| "multi"
	| "straights"
	| "houses"
	| "other";

type GigantYatzyRow = {
	key: string;
	label: string;
	section: SectionKey;
	rowIndex: number;
	maxScore: number;
	helper?: string;
	isCalculated?: boolean;
};

type ModalState = {
	row: GigantYatzyRow;
	playerIndex: number;
	value: number;
} | null;

const BONUS_THRESHOLD = 190;
const BONUS_SCORE = 200;

const gigantRows: GigantYatzyRow[] = [
	{ key: "ones", label: "Ettor", section: "upper", rowIndex: 0, maxScore: 12 },
	{ key: "twos", label: "Tvåor", section: "upper", rowIndex: 1, maxScore: 24 },
	{ key: "threes", label: "Treor", section: "upper", rowIndex: 2, maxScore: 36 },
	{ key: "fours", label: "Fyror", section: "upper", rowIndex: 3, maxScore: 48 },
	{ key: "fives", label: "Femmor", section: "upper", rowIndex: 4, maxScore: 60 },
	{ key: "sixes", label: "Sexor", section: "upper", rowIndex: 5, maxScore: 72 },

	{ key: "one-pair", label: "1 par", section: "pairs", rowIndex: 6, maxScore: 12 },
	{ key: "two-pair", label: "2 par", section: "pairs", rowIndex: 7, maxScore: 22 },
	{ key: "three-pair", label: "3 par", section: "pairs", rowIndex: 8, maxScore: 30 },
	{ key: "four-pair", label: "4 par", section: "pairs", rowIndex: 9, maxScore: 36 },
	{ key: "five-pair", label: "5 par", section: "pairs", rowIndex: 10, maxScore: 40 },
	{ key: "six-pair", label: "6 par", section: "pairs", rowIndex: 11, maxScore: 44 },

	{ key: "three-kind", label: "3 ens", section: "same", rowIndex: 12, maxScore: 18 },
	{ key: "four-kind", label: "4 ens", section: "same", rowIndex: 13, maxScore: 24 },
	{ key: "five-kind", label: "5 ens", section: "same", rowIndex: 14, maxScore: 30 },
	{ key: "six-kind", label: "6 ens", section: "same", rowIndex: 15, maxScore: 36 },
	{ key: "seven-kind", label: "7 ens", section: "same", rowIndex: 16, maxScore: 42 },
	{ key: "eight-kind", label: "8 ens", section: "same", rowIndex: 17, maxScore: 48 },
	{ key: "nine-kind", label: "9 ens", section: "same", rowIndex: 18, maxScore: 54 },
	{ key: "ten-kind", label: "10 ens", section: "same", rowIndex: 19, maxScore: 60 },
	{ key: "eleven-kind", label: "11 ens", section: "same", rowIndex: 20, maxScore: 66 },

	{
		key: "two-times-three",
		label: "2 x 3 ens",
		section: "multi",
		rowIndex: 21,
		maxScore: 33,
	},
	{
		key: "two-times-four",
		label: "2 x 4 ens",
		section: "multi",
		rowIndex: 22,
		maxScore: 44,
	},
	{
		key: "two-times-five",
		label: "2 x 5 ens",
		section: "multi",
		rowIndex: 23,
		maxScore: 55,
	},
	{
		key: "two-times-six",
		label: "2 x 6 ens",
		section: "multi",
		rowIndex: 24,
		maxScore: 66,
	},
	{
		key: "three-times-three",
		label: "3 x 3 ens",
		section: "multi",
		rowIndex: 25,
		maxScore: 45,
	},
	{
		key: "three-times-four",
		label: "3 x 4 ens",
		section: "multi",
		rowIndex: 26,
		maxScore: 60,
	},

	{
		key: "small-straight",
		label: "Liten stege",
		section: "straights",
		rowIndex: 27,
		maxScore: 15,
		helper: "1-2-3-4-5",
	},
	{
		key: "large-straight",
		label: "Stor stege",
		section: "straights",
		rowIndex: 28,
		maxScore: 20,
		helper: "2-3-4-5-6",
	},
	{
		key: "cameron",
		label: "Cameron",
		section: "straights",
		rowIndex: 29,
		maxScore: 21,
		helper: "1-2-3-4-5-6",
	},
	{
		key: "little-claus",
		label: "Lille Claus",
		section: "straights",
		rowIndex: 30,
		maxScore: 33,
		helper: "1-2-3-4-5-6 + 2st",
	},
	{
		key: "big-claus",
		label: "Store Claus",
		section: "straights",
		rowIndex: 31,
		maxScore: 39,
		helper: "1-2-3-4-5-6 + 3st",
	},
	{
		key: "knansen",
		label: "Knansen",
		section: "straights",
		rowIndex: 32,
		maxScore: 45,
		helper: "1-2-3-4-5-6 + 4st",
	},
	{
		key: "totansen",
		label: "Totansen",
		section: "straights",
		rowIndex: 33,
		maxScore: 51,
		helper: "1-2-3-4-5-6 + 5st",
	},
	{
		key: "kaptenen",
		label: "Kaptenen",
		section: "straights",
		rowIndex: 34,
		maxScore: 57,
		helper: "1-2-3-4-5-6 + 6st",
	},

	{
		key: "lillemor",
		label: "Lillemor",
		section: "houses",
		rowIndex: 35,
		maxScore: 28,
		helper: "3 + 2 ens",
	},
	{
		key: "poeten",
		label: "Poeten",
		section: "houses",
		rowIndex: 36,
		maxScore: 34,
		helper: "4 + 2 ens",
	},
	{
		key: "mammsen",
		label: "Mammsen",
		section: "houses",
		rowIndex: 37,
		maxScore: 40,
		helper: "5 + 2 ens",
	},
	{
		key: "skepparn",
		label: "Skepparn",
		section: "houses",
		rowIndex: 38,
		maxScore: 46,
		helper: "6 + 2 ens",
	},
	{
		key: "radiserna",
		label: "Radiserna",
		section: "houses",
		rowIndex: 39,
		maxScore: 39,
		helper: "4 + 3 ens",
	},
	{
		key: "bassarna",
		label: "Bassarna",
		section: "houses",
		rowIndex: 40,
		maxScore: 45,
		helper: "5 + 3 ens",
	},
	{
		key: "gyllene",
		label: "Gyllene",
		section: "houses",
		rowIndex: 41,
		maxScore: 51,
		helper: "6 + 3 ens",
	},
	{
		key: "kasket-karl",
		label: "Kasket Karl",
		section: "houses",
		rowIndex: 42,
		maxScore: 50,
		helper: "5 + 4 ens",
	},
	{
		key: "klaus-kansen",
		label: "Klaus Kansen",
		section: "houses",
		rowIndex: 43,
		maxScore: 56,
		helper: "6 + 4 ens",
	},
	{
		key: "jansen",
		label: "Jansen",
		section: "houses",
		rowIndex: 44,
		maxScore: 61,
		helper: "6 + 5 ens",
	},

	{
		key: "chance",
		label: "Chans",
		section: "other",
		rowIndex: 45,
		maxScore: 72,
	},
	{
		key: "yatzy",
		label: "YATZY",
		section: "other",
		rowIndex: 46,
		maxScore: 322,
		helper: "12 ens + 250",
	},
];

const sectionLabels: Record<SectionKey, string> = {
	upper: "ÖVRE DELEN",
	pairs: "PAR",
	same: "ENS",
	multi: "MULTIPELKOMBINATIONER",
	straights: "STEGAR",
	houses: "HUS",
	other: "ÖVRIGT",
};

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
	return getUpperSum(values, playerIndex) > 189 ? BONUS_SCORE : 0;
}

function getRemainingToBonus(values: ScoreCellValue[][], playerIndex: number) {
	return Math.max(0, BONUS_THRESHOLD - getUpperSum(values, playerIndex));
}

function getTotalScore(values: ScoreCellValue[][], playerIndex: number) {
	return gigantRows.reduce((sum, row) => {
		return sum + getNumericValue(values, row.rowIndex, playerIndex);
	}, 0) + getBonusScore(values, playerIndex);
}

function getCellDisplay(
	row: GigantYatzyRow,
	values: ScoreCellValue[][],
	playerIndex: number,
) {
	const value = values[row.rowIndex]?.[playerIndex];

	if (value === "" || typeof value !== "number") {
		return "—";
	}

	return String(value);
}

function getRowsBySection(section: SectionKey) {
	return gigantRows.filter((row) => row.section === section);
}

export default function GigantYatzyProtocol({
	players,
	values,
	onChange,
	onBatchChange,
	isLocked = false,
}: GigantYatzyProtocolProps) {
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

	const openCell = (row: GigantYatzyRow, playerIndex: number) => {
		if (isLocked) return;

		setModal({
			row,
			playerIndex,
			value: getNumericValue(values, row.rowIndex, playerIndex),
		});
	};

	const closeModal = () => setModal(null);

	const commitValue = (
		rowIndex: number,
		playerIndex: number,
		nextValue: number,
	) => {
		const safeValue = Math.max(0, Math.min(nextValue, gigantRows[rowIndex].maxScore));

		if (onBatchChange) {
			onBatchChange((prev) => {
				const next = cloneValues(prev);
				next[rowIndex][playerIndex] = safeValue;
				return next;
			});
			return;
		}

		onChange(rowIndex, playerIndex, safeValue);
	};

	const mobileFirstCol = players.length >= 4 ? "104px" : "118px";
	const mobileMaxCol = "48px";
	const desktopFirstCol = "320px";
	const desktopMaxCol = "70px";

	const mobileTemplate = `${mobileFirstCol} ${mobileMaxCol} repeat(${players.length}, minmax(0, 1fr))`;
	const desktopTemplate = `${desktopFirstCol} ${desktopMaxCol} repeat(${players.length}, minmax(0, 1fr))`;

	const renderRow = (row: GigantYatzyRow, indexInSection: number) => {
		const bg = indexInSection % 2 === 0 ? "bg-white/55" : "bg-[#f7faf8]";

		return (
			<div
				key={row.key}
				className="grid"
				style={{
					gridTemplateColumns: mobileTemplate,
				}}
			>
				<div
					className={`border-r border-t border-[#d8e3dc] px-3 py-3 text-[0.8rem] font-semibold text-slate-900 sm:px-4 sm:py-4 sm:text-[1rem] ${bg}`}
				>
					<div>{row.label}</div>
					{row.helper && (
						<div className="mt-0.5 text-[0.68rem] font-medium text-slate-500 sm:text-[0.9rem]">
							{row.helper}
						</div>
					)}
				</div>

				<div
					className={`border-r border-t border-[#d8e3dc] px-2 py-3 text-center text-[0.76rem] font-medium text-slate-500 sm:px-4 sm:py-4 sm:text-[0.95rem] ${bg}`}
				>
					{row.maxScore}
				</div>

				{players.map((player, playerIndex) => (
					<button
						key={`${row.key}-${player.name}`}
						type="button"
						onClick={() => openCell(row, playerIndex)}
						disabled={isLocked}
						className={`flex min-h-[48px] items-center justify-center border-t border-[#d8e3dc] px-1 py-3 text-center transition sm:min-h-[58px] sm:px-4 sm:py-4 ${
							isLocked ? bg : `${bg} hover:bg-emerald-50/50`
						}`}
					>
						<span
							className={`text-[0.9rem] font-black sm:text-[1rem] ${
								getCellDisplay(row, values, playerIndex) === "—"
									? "text-slate-300"
									: "text-slate-700"
							}`}
						>
							{getCellDisplay(row, values, playerIndex)}
						</span>
					</button>
				))}
			</div>
		);
	};

	return (
		<>
			<div className="w-full overflow-x-auto">
				<div className="min-w-[900px] overflow-hidden rounded-[28px] border border-[#dbe5df] bg-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
					<div className="px-6 py-6 text-center sm:px-8 sm:py-8">
						<h2 className="text-[2rem] font-black text-slate-900 sm:text-[2.2rem]">
							Gigant Yatzy
						</h2>
						<p className="mt-2 text-[1rem] text-slate-500 sm:text-[1.1rem]">
							12 tärningar · 3 slag · Övre summa &gt; 189 = 200 bonus
						</p>
					</div>

					<div
						className="grid bg-[#e7f1eb]"
						style={{
							gridTemplateColumns: mobileTemplate,
						}}
					>
						<div className="border-b border-r border-[#d8e3dc] px-3 py-4 text-left text-[0.95rem] font-medium text-slate-500 sm:px-4 sm:text-[1rem]">
							Kategori
						</div>
						<div className="border-b border-r border-[#d8e3dc] px-2 py-4 text-center text-[0.9rem] font-medium text-slate-500 sm:px-4 sm:text-[1rem]">
							Max
						</div>

						{players.map((player) => (
							<div
								key={player.name}
								className="border-b border-[#d8e3dc] px-2 py-4 text-center text-[0.95rem] font-black text-slate-900 sm:px-4 sm:text-[1rem]"
							>
								{player.name}
							</div>
						))}
					</div>

					{(["upper", "pairs", "same", "multi", "straights", "houses", "other"] as SectionKey[]).map(
						(section) => {
							const rows = getRowsBySection(section);

							return (
								<div key={section}>
									<div
										className="grid bg-[#d6ebe0]"
										style={{
											gridTemplateColumns: mobileTemplate,
										}}
									>
										<div className="col-span-full border-t border-[#d8e3dc] px-3 py-3 text-[0.95rem] font-black uppercase tracking-[0.04em] text-slate-900 sm:px-4 sm:text-[1rem]">
											{sectionLabels[section]}
										</div>
									</div>

									{section === "upper" &&
										rows.map((row, index) => renderRow(row, index))}

									{section === "upper" && (
										<>
											<div
												className="grid bg-[#eef7f1]"
												style={{
													gridTemplateColumns: mobileTemplate,
												}}
											>
												<div className="border-r border-t border-[#d8e3dc] px-3 py-4 text-[0.95rem] font-black text-slate-900 sm:px-4">
													Summa
												</div>
												<div className="border-r border-t border-[#d8e3dc] px-2 py-4 text-center text-[0.85rem] font-medium text-slate-500 sm:px-4">
													252
												</div>

												{players.map((player, playerIndex) => (
													<div
														key={`sum-${player.name}`}
														className="flex items-center justify-center border-t border-[#d8e3dc] px-2 py-4"
													>
														<span className="text-[1rem] font-black text-slate-900 sm:text-[1.1rem]">
															{upperSums[playerIndex]}
														</span>
													</div>
												))}
											</div>

											<div
												className="grid bg-[#fffdf7]"
												style={{
													gridTemplateColumns: mobileTemplate,
												}}
											>
												<div className="border-r border-t border-[#d8e3dc] px-3 py-4 text-[0.95rem] font-medium text-slate-500 sm:px-4">
													Bonus
												</div>
												<div className="border-r border-t border-[#d8e3dc] px-2 py-4 text-center text-[0.85rem] font-medium text-slate-500 sm:px-4">
													200
												</div>

												{players.map((player, playerIndex) => {
													const bonus = getBonusScore(values, playerIndex);
													const remaining = getRemainingToBonus(values, playerIndex);

													return (
														<div
															key={`bonus-${player.name}`}
															className="flex flex-col items-center justify-center border-t border-[#d8e3dc] px-2 py-4 text-center"
														>
															<span className="text-[1rem] font-black text-slate-900 sm:text-[1.1rem]">
																{bonus}
															</span>
															<span className="mt-1 text-[0.78rem] font-semibold text-amber-500">
																{bonus > 0 ? "Bonus klar" : `${remaining} kvar`}
															</span>
														</div>
													);
												})}
											</div>
										</>
									)}

									{section !== "upper" &&
										rows.map((row, index) => renderRow(row, index))}
								</div>
							);
						},
					)}

					<div
						className="grid bg-[#dff0e7]"
						style={{
							gridTemplateColumns: mobileTemplate,
						}}
					>
						<div className="border-r border-t border-[#cfe0d6] px-3 py-4 text-[1rem] font-black text-slate-900 sm:px-4 sm:text-[1.1rem]">
							Totalt
						</div>
						<div className="border-r border-t border-[#cfe0d6] px-2 py-4" />

						{players.map((player, playerIndex) => (
							<div
								key={`total-${player.name}`}
								className="flex items-center justify-center border-t border-[#cfe0d6] px-2 py-4"
							>
								<span className="text-[1.2rem] font-black text-slate-900 sm:text-[1.35rem]">
									{totals[playerIndex]}
								</span>
							</div>
						))}
					</div>

					<style>{`
						@media (min-width: 640px) {
							.grid[style*="${mobileFirstCol} ${mobileMaxCol}"] {
								grid-template-columns: ${desktopTemplate} !important;
							}
						}
					`}</style>
				</div>
			</div>

			{modal &&
				createPortal(
					<div
						className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/30 px-4 py-6 backdrop-blur-sm"
						onClick={closeModal}
					>
						<div
							className="relative my-auto w-full max-w-[540px] rounded-[28px] bg-white p-6 shadow-[0_24px_60px_rgba(0,0,0,0.18)] sm:p-8"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="pr-12">
								<h3 className="text-[1.9rem] font-black text-slate-900">
									{modal.row.label}
								</h3>
								<p className="mt-3 text-[1rem] text-slate-500">
									{players[modal.playerIndex].name}
								</p>
								{modal.row.helper && (
									<p className="mt-1 text-[1rem] text-slate-500">
										{modal.row.helper}
									</p>
								)}
								<p className="mt-1 text-[1rem] text-slate-500">
									Max: {modal.row.maxScore} poäng
								</p>
							</div>

							<div className="mt-8">
								<input
									type="number"
									inputMode="numeric"
									min={0}
									max={modal.row.maxScore}
									value={modal.value}
									onChange={(e) => {
										const raw = Number(e.target.value);
										if (Number.isNaN(raw)) {
											setModal({ ...modal, value: 0 });
											return;
										}
										setModal({
											...modal,
											value: Math.max(
												0,
												Math.min(raw, modal.row.maxScore),
											),
										});
									}}
									className="h-18 w-full rounded-[20px] border-2 border-emerald-400 bg-white px-6 text-center text-[2.2rem] font-black text-slate-900 outline-none"
								/>
							</div>

							<div className="mt-5 flex gap-3">
								<button
									type="button"
									onClick={() => setModal({ ...modal, value: 0 })}
									className="flex-1 rounded-[16px] border-2 border-emerald-200 bg-white px-4 py-3 text-[1rem] font-black text-slate-900 transition hover:bg-slate-50"
								>
									Streck (0)
								</button>

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
									className="flex-1 rounded-[16px] bg-amber-300 px-4 py-3 text-[1rem] font-black text-slate-700 transition hover:bg-amber-400"
								>
									Bekräfta
								</button>
							</div>

							<div className="mt-4 flex justify-center gap-4">
								<button
									type="button"
									onClick={() =>
										setModal({
											...modal,
											value: Math.max(0, modal.value - 1),
										})
									}
									className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dfe9e3] text-slate-900 transition hover:bg-[#d3dfd8]"
								>
									<Minus size={20} />
								</button>

								<button
									type="button"
									onClick={() =>
										setModal({
											...modal,
											value: Math.min(
												modal.row.maxScore,
												modal.value + 1,
											),
										})
									}
									className="flex h-11 w-11 items-center justify-center rounded-full bg-[#dfe9e3] text-slate-900 transition hover:bg-[#d3dfd8]"
								>
									<Plus size={20} />
								</button>
							</div>

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