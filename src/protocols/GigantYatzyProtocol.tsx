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
	{
		key: "ones",
		label: "Ettor",
		section: "upper",
		rowIndex: 0,
		maxScore: 12,
	},
	{
		key: "twos",
		label: "Tvåor",
		section: "upper",
		rowIndex: 1,
		maxScore: 24,
	},
	{
		key: "threes",
		label: "Treor",
		section: "upper",
		rowIndex: 2,
		maxScore: 36,
	},
	{
		key: "fours",
		label: "Fyror",
		section: "upper",
		rowIndex: 3,
		maxScore: 48,
	},
	{
		key: "fives",
		label: "Femmor",
		section: "upper",
		rowIndex: 4,
		maxScore: 60,
	},
	{
		key: "sixes",
		label: "Sexor",
		section: "upper",
		rowIndex: 5,
		maxScore: 72,
	},

	{
		key: "one-pair",
		label: "1 par",
		section: "pairs",
		rowIndex: 6,
		maxScore: 12,
	},
	{
		key: "two-pair",
		label: "2 par",
		section: "pairs",
		rowIndex: 7,
		maxScore: 22,
	},
	{
		key: "three-pair",
		label: "3 par",
		section: "pairs",
		rowIndex: 8,
		maxScore: 30,
	},
	{
		key: "four-pair",
		label: "4 par",
		section: "pairs",
		rowIndex: 9,
		maxScore: 36,
	},
	{
		key: "five-pair",
		label: "5 par",
		section: "pairs",
		rowIndex: 10,
		maxScore: 40,
	},
	{
		key: "six-pair",
		label: "6 par",
		section: "pairs",
		rowIndex: 11,
		maxScore: 44,
	},

	{
		key: "three-kind",
		label: "3 ens",
		section: "same",
		rowIndex: 12,
		maxScore: 18,
	},
	{
		key: "four-kind",
		label: "4 ens",
		section: "same",
		rowIndex: 13,
		maxScore: 24,
	},
	{
		key: "five-kind",
		label: "5 ens",
		section: "same",
		rowIndex: 14,
		maxScore: 30,
	},
	{
		key: "six-kind",
		label: "6 ens",
		section: "same",
		rowIndex: 15,
		maxScore: 36,
	},
	{
		key: "seven-kind",
		label: "7 ens",
		section: "same",
		rowIndex: 16,
		maxScore: 42,
	},
	{
		key: "eight-kind",
		label: "8 ens",
		section: "same",
		rowIndex: 17,
		maxScore: 48,
	},
	{
		key: "nine-kind",
		label: "9 ens",
		section: "same",
		rowIndex: 18,
		maxScore: 54,
	},
	{
		key: "ten-kind",
		label: "10 ens",
		section: "same",
		rowIndex: 19,
		maxScore: 60,
	},
	{
		key: "eleven-kind",
		label: "11 ens",
		section: "same",
		rowIndex: 20,
		maxScore: 66,
	},

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

const sections: SectionKey[] = [
	"upper",
	"pairs",
	"same",
	"multi",
	"straights",
	"houses",
	"other",
];

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
	return (
		gigantRows.reduce((sum, row) => {
			return sum + getNumericValue(values, row.rowIndex, playerIndex);
		}, 0) + getBonusScore(values, playerIndex)
	);
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
		if (isLocked) {
			return;
		}

		setModal({
			row,

			playerIndex,

			value: getNumericValue(values, row.rowIndex, playerIndex),
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
		const row = gigantRows[rowIndex];

		const safeValue = Math.max(0, Math.min(nextValue, row.maxScore));

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

	/*
		=====================================================
		GRIDS
		=====================================================

		MOBILE

		112px category
		38px max
		remaining space split between players

		DESKTOP

		280px category
		70px max
		remaining width split between players
	*/

	const mobileTemplate = `112px 38px repeat(${players.length}, minmax(0, 1fr))`;

	const desktopTemplate = `280px 70px repeat(${players.length}, minmax(0, 1fr))`;

	/*
		=====================================================
		ROW RENDERER
		=====================================================
	*/

	const renderRow = (
		row: GigantYatzyRow,
		indexInSection: number,
		isDesktop: boolean,
	) => {
		const bg = indexInSection % 2 === 0 ? "bg-white/70" : "bg-[#f7faf8]";

		const template = isDesktop ? desktopTemplate : mobileTemplate;

		return (
			<div
				key={row.key}
				className="grid w-full"
				style={{
					gridTemplateColumns: template,
				}}
			>
				{/* CATEGORY */}

				<div
					className={`
						flex
						min-w-0
						flex-col
						justify-center
						border-r
						border-t
						border-[#d8e3dc]
						${bg}

						${isDesktop ? "min-h-[70px] px-5 py-4" : "min-h-[52px] px-2.5 py-2"}
					`}
				>
					<div
						className={`
							font-black
							leading-tight
							text-slate-900

							${isDesktop ? "text-base" : "text-[11px]"}
						`}
					>
						{row.label}
					</div>

					{row.helper && (
						<div
							className={`
								mt-0.5
								font-medium
								leading-tight
								text-slate-500

								${isDesktop ? "text-sm" : "text-[9px]"}
							`}
						>
							{row.helper}
						</div>
					)}
				</div>

				{/* MAX */}

				<div
					className={`
						flex
						items-center
						justify-center
						border-r
						border-t
						border-[#d8e3dc]
						text-center
						font-bold
						text-slate-400
						${bg}

						${
							isDesktop
								? "min-h-[70px] px-2 py-4 text-sm"
								: "min-h-[52px] px-0.5 py-2 text-[9px]"
						}
					`}
				>
					{row.maxScore}
				</div>

				{/* PLAYER CELLS */}

				{players.map((player, playerIndex) => {
					const display = getCellDisplay(row, values, playerIndex);

					const empty = display === "—";

					return (
						<button
							key={`${row.key}-${player.name}-${playerIndex}`}
							type="button"
							onClick={() => openCell(row, playerIndex)}
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
									${bg}

									${isDesktop ? "min-h-[70px] px-3 py-4" : "min-h-[52px] px-0.5 py-2"}

									${
										isLocked
											? "cursor-default"
											: "cursor-pointer hover:bg-emerald-50/70 active:bg-emerald-100/60"
									}
								`}
						>
							<span
								className={`
										font-black
										tabular-nums

										${isDesktop ? "text-base" : "text-[11px]"}

										${empty ? "text-slate-300" : "text-slate-800"}
									`}
							>
								{display}
							</span>
						</button>
					);
				})}
			</div>
		);
	};

	/*
		=====================================================
		HEADER
		=====================================================
	*/

	const renderHeader = (isDesktop: boolean) => {
		const template = isDesktop ? desktopTemplate : mobileTemplate;

		return (
			<div
				className="grid w-full bg-[#e7f1eb]"
				style={{
					gridTemplateColumns: template,
				}}
			>
				<div
					className={`
						flex
						items-center
						border-b
						border-r
						border-[#d8e3dc]
						font-bold
						text-slate-500

						${
							isDesktop
								? "min-h-[62px] px-5 py-4 text-sm"
								: "min-h-[48px] px-2.5 py-2 text-[10px]"
						}
					`}
				>
					Kategori
				</div>

				<div
					className={`
						flex
						items-center
						justify-center
						border-b
						border-r
						border-[#d8e3dc]
						text-center
						font-bold
						text-slate-500

						${
							isDesktop
								? "min-h-[62px] px-2 py-4 text-sm"
								: "min-h-[48px] px-0.5 py-2 text-[9px]"
						}
					`}
				>
					Max
				</div>

				{players.map((player, playerIndex) => (
					<div
						key={`header-${player.name}-${playerIndex}`}
						className={`
								flex
								min-w-0
								items-center
								justify-center
								border-b
								border-[#d8e3dc]
								text-center
								font-black
								text-slate-900

								${
									isDesktop
										? "min-h-[62px] px-3 py-4 text-base"
										: "min-h-[48px] px-1 py-2 text-[10px]"
								}
							`}
					>
						<span
							className="
									block
									max-w-full
									overflow-hidden
									text-ellipsis
									whitespace-nowrap
								"
						>
							{player.name}
						</span>
					</div>
				))}
			</div>
		);
	};

	/*
		=====================================================
		SECTION HEADER
		=====================================================
	*/

	const renderSectionTitle = (section: SectionKey, isDesktop: boolean) => (
		<div
			className={`
				border-t
				border-[#d8e3dc]
				bg-[#d6ebe0]
				font-black
				uppercase
				text-slate-900

				${
					isDesktop
						? "px-5 py-3 text-sm tracking-[0.08em]"
						: "px-2.5 py-2 text-[10px] tracking-[0.05em]"
				}
			`}
		>
			{sectionLabels[section]}
		</div>
	);

	/*
		=====================================================
		UPPER SUM
		=====================================================
	*/

	const renderUpperSum = (isDesktop: boolean) => {
		const template = isDesktop ? desktopTemplate : mobileTemplate;

		return (
			<div
				className="grid w-full bg-[#eef7f1]"
				style={{
					gridTemplateColumns: template,
				}}
			>
				<div
					className={`
						flex
						items-center
						border-r
						border-t
						border-[#d8e3dc]
						font-black
						text-slate-900

						${
							isDesktop
								? "min-h-[62px] px-5 py-4 text-base"
								: "min-h-[48px] px-2.5 py-2 text-[11px]"
						}
					`}
				>
					Summa
				</div>

				<div
					className={`
						flex
						items-center
						justify-center
						border-r
						border-t
						border-[#d8e3dc]
						font-bold
						text-slate-400

						${isDesktop ? "min-h-[62px] px-2 text-sm" : "min-h-[48px] px-0.5 text-[9px]"}
					`}
				>
					252
				</div>

				{players.map((player, playerIndex) => (
					<div
						key={`sum-${player.name}-${playerIndex}`}
						className={`
								flex
								min-w-0
								items-center
								justify-center
								border-t
								border-[#d8e3dc]
								font-black
								tabular-nums
								text-slate-900

								${isDesktop ? "min-h-[62px] px-3 text-lg" : "min-h-[48px] px-0.5 text-[11px]"}
							`}
					>
						{upperSums[playerIndex]}
					</div>
				))}
			</div>
		);
	};

	/*
		=====================================================
		BONUS
		=====================================================
	*/

	const renderBonus = (isDesktop: boolean) => {
		const template = isDesktop ? desktopTemplate : mobileTemplate;

		return (
			<div
				className="grid w-full bg-[#fffaf0]"
				style={{
					gridTemplateColumns: template,
				}}
			>
				<div
					className={`
						flex
						items-center
						border-r
						border-t
						border-[#d8e3dc]
						font-black
						text-amber-700

						${
							isDesktop
								? "min-h-[68px] px-5 py-4 text-base"
								: "min-h-[52px] px-2.5 py-2 text-[11px]"
						}
					`}
				>
					Bonus
				</div>

				<div
					className={`
						flex
						items-center
						justify-center
						border-r
						border-t
						border-[#d8e3dc]
						font-bold
						text-amber-500

						${isDesktop ? "min-h-[68px] px-2 text-sm" : "min-h-[52px] px-0.5 text-[9px]"}
					`}
				>
					200
				</div>

				{players.map((player, playerIndex) => {
					const bonus = getBonusScore(values, playerIndex);

					const remaining = getRemainingToBonus(values, playerIndex);

					return (
						<div
							key={`bonus-${player.name}-${playerIndex}`}
							className={`
									flex
									min-w-0
									flex-col
									items-center
									justify-center
									border-t
									border-[#d8e3dc]
									text-center

									${isDesktop ? "min-h-[68px] px-3 py-3" : "min-h-[52px] px-0.5 py-1.5"}
								`}
						>
							<span
								className={`
										font-black
										tabular-nums

										${bonus > 0 ? "text-emerald-600" : "text-slate-900"}

										${isDesktop ? "text-lg" : "text-[11px]"}
									`}
							>
								{bonus}
							</span>

							<span
								className={`
										mt-0.5
										font-bold
										leading-tight

										${bonus > 0 ? "text-emerald-500" : "text-amber-500"}

										${isDesktop ? "text-xs" : "text-[7px]"}
									`}
							>
								{bonus > 0 ? "Bonus klar" : `${remaining} kvar`}
							</span>
						</div>
					);
				})}
			</div>
		);
	};

	/*
		=====================================================
		TOTAL
		=====================================================
	*/

	const renderTotal = (isDesktop: boolean) => {
		const template = isDesktop ? desktopTemplate : mobileTemplate;

		return (
			<div
				className="grid w-full bg-[#dff0e7]"
				style={{
					gridTemplateColumns: template,
				}}
			>
				<div
					className={`
						flex
						items-center
						border-r
						border-t
						border-[#cfe0d6]
						font-black
						text-slate-950

						${
							isDesktop
								? "min-h-[72px] px-5 py-4 text-xl"
								: "min-h-[54px] px-2.5 py-2 text-[12px]"
						}
					`}
				>
					Totalt
				</div>

				<div className="border-r border-t border-[#cfe0d6]" />

				{players.map((player, playerIndex) => (
					<div
						key={`total-${player.name}-${playerIndex}`}
						className={`
								flex
								min-w-0
								items-center
								justify-center
								border-t
								border-[#cfe0d6]
								font-black
								tabular-nums
								text-slate-950

								${isDesktop ? "min-h-[72px] px-3 text-2xl" : "min-h-[54px] px-0.5 text-[12px]"}
							`}
					>
						{totals[playerIndex]}
					</div>
				))}
			</div>
		);
	};

	/*
		=====================================================
		FULL TABLE
		=====================================================
	*/

	const renderTable = (isDesktop: boolean) => (
		<>
			{renderHeader(isDesktop)}

			{sections.map((section) => {
				const rows = getRowsBySection(section);

				return (
					<div key={section}>
						{renderSectionTitle(section, isDesktop)}

						{rows.map((row, index) =>
							renderRow(row, index, isDesktop),
						)}

						{section === "upper" && (
							<>
								{renderUpperSum(isDesktop)}

								{renderBonus(isDesktop)}
							</>
						)}
					</div>
				);
			})}

			{renderTotal(isDesktop)}
		</>
	);

	return (
		<>
			{/* =================================================
			    MOBILE
			================================================= */}

			<div className="w-full sm:hidden">
				<div
					className="
						w-full
						overflow-hidden
						rounded-[20px]
						border
						border-[#dbe5df]
						bg-white/70
						shadow-[0_8px_24px_rgba(0,0,0,0.03)]
					"
				>
					{/* MOBILE TITLE */}

				

					{renderTable(false)}
				</div>
			</div>

			{/* =================================================
			    DESKTOP / TABLET
			================================================= */}

			<div className="hidden w-full overflow-x-auto sm:block">
				<div
					className="
						min-w-[760px]
						overflow-hidden
						rounded-[28px]
						border
						border-[#dbe5df]
						bg-white/70
						shadow-[0_8px_24px_rgba(0,0,0,0.03)]
					"
				>
				
					{renderTable(true)}
				</div>
			</div>

			{/* =================================================
			    SCORE MODAL
			================================================= */}

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
							py-5
							backdrop-blur-sm
						"
						onClick={closeModal}
					>
						<div
							className="
								relative
								my-auto
								w-full
								max-w-[540px]
								rounded-[24px]
								bg-white
								p-5
								shadow-[0_24px_60px_rgba(0,0,0,0.18)]

								sm:rounded-[28px]
								sm:p-8
							"
							onClick={(event) => event.stopPropagation()}
						>
							{/* MODAL HEADER */}

							<div className="pr-10 sm:pr-12">
								<p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-600">
									{players[modal.playerIndex].name}
								</p>

								<h3 className="mt-1 text-2xl font-black text-slate-950 sm:text-[1.9rem]">
									{modal.row.label}
								</h3>

								{modal.row.helper && (
									<p className="mt-2 text-sm font-medium text-slate-500 sm:text-base">
										{modal.row.helper}
									</p>
								)}

								<p className="mt-1 text-sm text-slate-400 sm:text-base">
									Max {modal.row.maxScore} poäng
								</p>
							</div>

							{/* SCORE INPUT */}

							<div className="mt-6 sm:mt-8">
								<input
									type="number"
									inputMode="numeric"
									min={0}
									max={modal.row.maxScore}
									value={modal.value}
									onChange={(event) => {
										const raw = Number(event.target.value);

										if (Number.isNaN(raw)) {
											setModal({
												...modal,

												value: 0,
											});

											return;
										}

										setModal({
											...modal,

											value: Math.max(
												0,

												Math.min(
													raw,

													modal.row.maxScore,
												),
											),
										});
									}}
									className="
										h-16
										w-full
										rounded-[18px]
										border-2
										border-emerald-400
										bg-white
										px-4
										text-center
										text-3xl
										font-black
										tabular-nums
										text-slate-950
										outline-none
										transition
										focus:ring-4
										focus:ring-emerald-100

										sm:h-[72px]
										sm:rounded-[20px]
										sm:px-6
										sm:text-[2.2rem]
									"
								/>
							</div>

							{/* PLUS / MINUS */}

							<div className="mt-4 flex items-center justify-center gap-5">
								<button
									type="button"
									onClick={() =>
										setModal({
											...modal,

											value: Math.max(
												0,

												modal.value - 1,
											),
										})
									}
									className="
										flex
										h-11
										w-11
										items-center
										justify-center
										rounded-full
										bg-slate-100
										text-slate-700
										transition
										hover:bg-slate-200
										active:scale-95
									"
									aria-label="Minska"
								>
									<Minus size={20} />
								</button>

								<span className="text-xs font-bold uppercase tracking-[0.08em] text-slate-400">
									Justera
								</span>

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
									className="
										flex
										h-11
										w-11
										items-center
										justify-center
										rounded-full
										bg-slate-100
										text-slate-700
										transition
										hover:bg-slate-200
										active:scale-95
									"
									aria-label="Öka"
								>
									<Plus size={20} />
								</button>
							</div>

							{/* ACTIONS */}

							<div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-7 sm:gap-3">
								<button
									type="button"
									onClick={() =>
										setModal({
											...modal,

											value: 0,
										})
									}
									className="
										rounded-[16px]
										border
										border-slate-200
										bg-white
										px-3
										py-3.5
										text-sm
										font-black
										text-slate-700
										transition
										hover:bg-slate-50
										sm:text-base
									"
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
									className="
										rounded-[16px]
										bg-emerald-500
										px-3
										py-3.5
										text-sm
										font-black
										text-white
										transition
										hover:bg-emerald-600
										active:scale-[0.99]
										sm:text-base
									"
								>
									Bekräfta
								</button>
							</div>

							{/* CLOSE */}

							<button
								type="button"
								onClick={closeModal}
								className="
									absolute
									right-3
									top-3
									flex
									h-9
									w-9
									items-center
									justify-center
									rounded-full
									bg-slate-100
									text-slate-400
									transition
									hover:bg-slate-200
									hover:text-slate-700

									sm:right-4
									sm:top-4
								"
								aria-label="Stäng"
							>
								<X size={20} />
							</button>
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}
