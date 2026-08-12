import { useEffect, useMemo, useRef, useState } from "react";

import { BookOpen, Check, Minus, Plus, X } from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import ScorecardLayout from "../components/scorecard/ScorecardLayout";

import { CustomGameService } from "../services/CustomGameService";

import type {
	CustomGameSession,
	CustomMatchScoreValue,
	CustomProtocolDefinition,
} from "../types/customProtocol";

type Toast = {
	id: number;
	text: string;
};

type EditCell = {
	rowIndex: number;
	playerIndex: number;

	/*
		Det här är värdet som visas
		i modalen.

		För en negativ kategori visar
		vi exempelvis 4, trots att
		tabellen sparar -4.
	*/
	value: number;
} | null;

function cloneValues(values: CustomMatchScoreValue[][]) {
	return values.map((row) => [...row]);
}

function createEmptyRow(playerCount: number): CustomMatchScoreValue[] {
	return Array.from(
		{
			length: playerCount,
		},
		() => "" as CustomMatchScoreValue,
	);
}

function getTotals(
	protocol: CustomProtocolDefinition,

	values: CustomMatchScoreValue[][],

	playerCount: number,
) {
	return Array.from(
		{
			length: playerCount,
		},

		(_, playerIndex) =>
			values.reduce(
				(sum, row) => {
					const value = row[playerIndex];

					return sum + (typeof value === "number" ? value : 0);
				},

				protocol.startScore,
			),
	);
}

function getWinner(
	protocol: CustomProtocolDefinition,

	players: { name: string }[],

	values: CustomMatchScoreValue[][],

	forceFinish = false,
) {
	const totals = getTotals(protocol, values, players.length);

	if (protocol.winCondition === "target") {
		const target = protocol.targetScore ?? 0;

		const candidates = totals
			.map((total, index) => ({
				total,
				index,
			}))
			.filter((item) => item.total >= target)
			.sort((a, b) => b.total - a.total);

		if (candidates.length === 0) {
			return null;
		}

		const best = candidates[0];

		return {
			name: players[best.index].name,

			total: best.total,
		};
	}

	const allFilled =
		values.length > 0 &&
		values.every((row) => row.every((cell) => cell !== ""));

	const naturallyFinished =
		protocol.layout === "categories" || !protocol.autoAddRounds;

	if (!forceFinish && (!naturallyFinished || !allFilled)) {
		return null;
	}

	const wanted =
		protocol.winCondition === "lowest"
			? Math.min(...totals)
			: Math.max(...totals);

	const indices = totals
		.map((total, index) => ({
			total,
			index,
		}))
		.filter((item) => item.total === wanted);

	return {
		name: indices.map((item) => players[item.index].name).join(" & "),

		total: wanted,
	};
}

function rowLabel(
	protocol: CustomProtocolDefinition,

	rowIndex: number,
) {
	if (protocol.layout === "categories") {
		return protocol.rows[rowIndex]?.name ?? `Rad ${rowIndex + 1}`;
	}

	return `Runda ${rowIndex + 1}`;
}

function rowHelper(
	protocol: CustomProtocolDefinition,

	rowIndex: number,
) {
	if (protocol.layout === "categories") {
		return protocol.rows[rowIndex]?.description ?? "";
	}

	return "";
}

/*
	TRUE betyder numera:

	"den här raden ska ge MINUSPOÄNG"

	Inte bara att användaren FÅR skriva minus.
*/
function isSubtractRow(
	protocol: CustomProtocolDefinition,

	rowIndex: number,
) {
	if (protocol.layout === "categories") {
		return Boolean(protocol.rows[rowIndex]?.allowNegative);
	}

	return Boolean(protocol.roundAllowNegative);
}

/*
	Användaren skriver alltid ett positivt
	antal i modalen.

	Exempel:

	positiv kategori:
	4 -> 4

	negativ kategori:
	4 -> -4
*/
function resolveStoredValue(
	protocol: CustomProtocolDefinition,

	rowIndex: number,

	inputValue: number,
) {
	const absoluteValue = Math.abs(inputValue);

	if (isSubtractRow(protocol, rowIndex)) {
		return absoluteValue * -1;
	}

	return absoluteValue;
}

/*
	Om en befintlig ruta innehåller -4
	ska redigeringsmodalen visa 4.
*/
function resolveEditableValue(value: CustomMatchScoreValue) {
	if (typeof value !== "number") {
		return 0;
	}

	return Math.abs(value);
}

export default function PlayCustomProtocol() {
	const { matchId = "" } = useParams();

	const navigate = useNavigate();

	const initialSession = useMemo(
		() => CustomGameService.getById(matchId),
		[matchId],
	);

	const [session, setSession] = useState<CustomGameSession | null>(
		initialSession,
	);

	const [values, setValues] = useState<CustomMatchScoreValue[][]>(
		() => initialSession?.values ?? [],
	);

    useEffect(() => {
		if (!session || session.finished) {
			return;
		}

		CustomGameService.setActiveGame(session.id);
    }, [session?.id, session?.finished]);
    
	const [history, setHistory] = useState<CustomMatchScoreValue[][][]>([]);

	const [editCell, setEditCell] = useState<EditCell>(null);

	const [showRules, setShowRules] = useState(false);

	const [toasts, setToasts] = useState<Toast[]>([]);

	const toastId = useRef(0);

	const protocol = session?.protocol;

	const players = session?.players ?? [];

	const totals = useMemo(
		() => (protocol ? getTotals(protocol, values, players.length) : []),
		[protocol, values, players.length],
	);

	const automaticWinner = useMemo(
		() => (protocol ? getWinner(protocol, players, values) : null),
		[protocol, players, values],
	);

	const isFinished = Boolean(session?.finished || automaticWinner);

	const showToast = (text: string) => {
		const id = ++toastId.current;

		setToasts((prev) => [
			...prev,
			{
				id,
				text,
			},
		]);

		window.setTimeout(
			() => setToasts((prev) => prev.filter((item) => item.id !== id)),
			2200,
		);
	};

	/*
		AUTOSAVE
	*/
	useEffect(() => {
		if (!session || !protocol) {
			return;
		}

		const winner = automaticWinner;

		const next: CustomGameSession = {
			...session,

			values: cloneValues(values),

			finished: session.finished || Boolean(winner),

			winnerName: session.winnerName ?? winner?.name ?? null,

			updatedAt: new Date().toISOString(),
		};

		CustomGameService.save(next);

		setSession((prev) =>
			prev
				? {
						...prev,

						finished: next.finished,

						winnerName: next.winnerName,

						values: next.values,

						updatedAt: next.updatedAt,
					}
				: prev,
		);
	}, [values, automaticWinner]);

	if (!session || !protocol) {
		return (
			<section className="min-h-screen bg-emerald-50 p-6">
				<div className="mx-auto max-w-lg rounded-3xl bg-white p-8 text-center">
					<h1 className="text-2xl font-black">
						Spelet hittades inte
					</h1>

					<button
						onClick={() => navigate("/custom-protocols")}
						className="mt-5 rounded-full bg-emerald-500 px-5 py-3 font-bold text-white"
					>
						Egna protokoll
					</button>
				</div>
			</section>
		);
	}

	const pushHistory = (snapshot: CustomMatchScoreValue[][]) => {
		setHistory((prev) => [...prev.slice(-49), cloneValues(snapshot)]);
	};

	const expectedPlayerForRow = (rowIndex: number) => {
		if (!protocol.turnOrder.enabled || protocol.layout !== "rounds") {
			return -1;
		}

		const row = values[rowIndex] ?? [];

		const baseStarter = protocol.turnOrder.rotateStartingPlayer
			? rowIndex % players.length
			: 0;

		for (let offset = 0; offset < players.length; offset++) {
			const playerIndex = (baseStarter + offset) % players.length;

			if (row[playerIndex] === "") {
				return playerIndex;
			}
		}

		return -1;
	};

	const openCell = (
		rowIndex: number,

		playerIndex: number,
	) => {
		if (isFinished) {
			return;
		}

		const expected = expectedPlayerForRow(rowIndex);

		if (
			expected >= 0 &&
			expected !== playerIndex &&
			values[rowIndex]?.[playerIndex] === ""
		) {
			showToast(`${players[expected].name} står på tur.`);

			return;
		}

		const current = values[rowIndex]?.[playerIndex];

		setEditCell({
			rowIndex,

			playerIndex,

			/*
				-4 visas som 4 i modalen.
			*/
			value: resolveEditableValue(current),
		});
	};

	const commitCell = () => {
		if (!editCell) {
			return;
		}

		const { rowIndex, playerIndex } = editCell;

		/*
				HÄR sker själva magin.

				Om raden är negativ:
				4 -> -4
			*/
		const storedValue = resolveStoredValue(
			protocol,
			rowIndex,
			editCell.value,
		);

		setValues((prev) => {
			pushHistory(prev);

			const next = cloneValues(prev);

			next[rowIndex][playerIndex] = storedValue;

			if (
				protocol.layout === "rounds" &&
				protocol.autoAddRounds &&
				rowIndex === next.length - 1
			) {
				const shouldAdd =
					protocol.roundCompletionMode === "independent"
						? true
						: next[rowIndex].every((cell) => cell !== "");

				const winner = getWinner(protocol, players, next);

				if (shouldAdd && !winner) {
					next.push(createEmptyRow(players.length));
				}
			}

			return next;
		});

		setEditCell(null);
	};

	const handleUndo = () => {
		setHistory((prev) => {
			if (!prev.length) {
				return prev;
			}

			setValues(cloneValues(prev[prev.length - 1]));

			return prev.slice(0, -1);
		});
	};

	const handleReset = () => {
		if (!window.confirm("Vill du återställa hela protokollet?")) {
			return;
		}

		pushHistory(values);

		const rowCount =
			protocol.layout === "rounds"
				? Math.max(1, protocol.initialRounds)
				: protocol.rows.length;

		setValues(
			Array.from(
				{
					length: rowCount,
				},
				() => createEmptyRow(players.length),
			),
		);

		setSession((prev) =>
			prev
				? {
						...prev,

						finished: false,

						winnerName: null,
					}
				: prev,
		);
	};

	const handleSave = () => {
		CustomGameService.save({
			...session,

			values: cloneValues(values),

			updatedAt: new Date().toISOString(),
		});

		showToast("Spelet är sparat!");
	};

	const finishManually = () => {
		const winner = getWinner(protocol, players, values, true);

		if (!winner) {
			return;
		}

		const next: CustomGameSession = {
			...session,

			values: cloneValues(values),

			finished: true,

			winnerName: winner.name,

			updatedAt: new Date().toISOString(),
		};

		CustomGameService.save(next);

		setSession(next);

		showToast(`Spelet avslutat. ${winner.name} vinner.`);
	};

	const winnerName = session.winnerName ?? automaticWinner?.name ?? null;

	return (
		<ScorecardLayout
			title={protocol.name}
			onBack={() => navigate("/custom-protocols")}
			onUndo={handleUndo}
			isUndoDisabled={history.length === 0}
			onReset={handleReset}
			onSave={handleSave}
			isSaveDisabled={false}
			toasts={toasts}
		>
			<div className="mx-auto w-full max-w-[1000px]">
				{/* INFO / RULES */}
				<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
					<div className="flex flex-wrap gap-2">
						{players.map((player, index) => (
							<div
								key={player.name}
								className="rounded-full bg-white/70 px-3 py-2 text-xs font-bold text-slate-600"
							>
								{index === 0 && protocol.turnOrder.enabled
									? "Start: "
									: ""}

								{player.name}
							</div>
						))}
					</div>

					{protocol.rules && (
						<button
							type="button"
							onClick={() => setShowRules(true)}
							className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-black text-slate-700"
						>
							<BookOpen size={17} />
							Regler
						</button>
					)}
				</div>

				{winnerName && (
					<div className="mb-4 rounded-[20px] bg-emerald-100 px-5 py-4 text-center font-black text-emerald-800">
						🏆 {winnerName} har vunnit!
					</div>
				)}

				{/* TABLE */}
				<div className="overflow-x-auto rounded-[24px] border border-white/70 bg-white/60">
					<div className="min-w-[620px]">
						<div
							className="grid bg-[#e7f1eb]"
							style={{
								gridTemplateColumns: `170px repeat(${players.length}, minmax(110px, 1fr))`,
							}}
						>
							<div className="border-r border-[#d8e3dc] px-4 py-4 text-xs font-black uppercase text-slate-700">
								{protocol.layout === "rounds"
									? "Runda"
									: "Kategori"}
							</div>

							{players.map((player, index) => (
								<div
									key={player.name}
									className="px-3 py-4 text-center"
								>
									<p className="font-black text-slate-800">
										{player.name}
									</p>

									<p className="mt-1 text-xs font-bold text-slate-400">
										{totals[index]} p
									</p>
								</div>
							))}
						</div>

						{values.map((row, rowIndex) => {
							const expected = expectedPlayerForRow(rowIndex);

							const subtract = isSubtractRow(protocol, rowIndex);

							return (
								<div
									key={rowIndex}
									className="grid"
									style={{
										gridTemplateColumns: `170px repeat(${players.length}, minmax(110px, 1fr))`,
									}}
								>
									<div
										className={`border-r border-t border-[#d8e3dc] px-4 py-4 ${
											subtract
												? "bg-rose-50/70"
												: "bg-white/75"
										}`}
									>
										<p className="font-black text-slate-800">
											{rowLabel(protocol, rowIndex)}
										</p>

										{rowHelper(protocol, rowIndex) && (
											<p className="mt-1 text-[10px] leading-4 text-slate-400">
												{rowHelper(protocol, rowIndex)}
											</p>
										)}

										{subtract && (
											<p className="mt-2 text-[10px] font-black uppercase tracking-[0.08em] text-rose-500">
												Dras av
											</p>
										)}

										{protocol.turnOrder.enabled &&
											protocol.layout === "rounds" &&
											expected >= 0 && (
												<p className="mt-2 text-[10px] font-bold text-emerald-600">
													Tur:{" "}
													{players[expected].name}
												</p>
											)}
									</div>

									{players.map((player, playerIndex) => {
										const value = row[playerIndex];

										const active = expected === playerIndex;

										return (
											<button
												key={player.name}
												type="button"
												onClick={() =>
													openCell(
														rowIndex,
														playerIndex,
													)
												}
												disabled={isFinished}
												className={`min-h-[74px] border-t border-[#d8e3dc] px-3 py-3 text-center transition ${
													subtract
														? "bg-rose-50/25 hover:bg-rose-50/70"
														: active
															? "bg-emerald-50"
															: "bg-white/60 hover:bg-emerald-50/70"
												}`}
											>
												<span
													className={`text-base font-black ${
														value === ""
															? "text-slate-300"
															: typeof value ===
																		"number" &&
																  value < 0
																? "text-rose-500"
																: "text-emerald-500"
													}`}
												>
													{value === ""
														? "—"
														: value > 0
															? `+${value}`
															: value}
												</span>
											</button>
										);
									})}
								</div>
							);
						})}

						<div
							className="grid bg-[#dff0e7]"
							style={{
								gridTemplateColumns: `170px repeat(${players.length}, minmax(110px, 1fr))`,
							}}
						>
							<div className="border-r border-t border-[#cfe0d6] px-4 py-4 font-black text-slate-900">
								Totalt
							</div>

							{totals.map((total, index) => (
								<div
									key={index}
									className="border-t border-[#cfe0d6] px-3 py-4 text-center text-xl font-black text-slate-950"
								>
									{total}
								</div>
							))}
						</div>
					</div>
				</div>

				{!isFinished &&
					protocol.winCondition !== "target" &&
					protocol.layout === "rounds" &&
					protocol.autoAddRounds && (
						<button
							type="button"
							onClick={finishManually}
							className="mt-4 w-full rounded-full bg-slate-950 px-5 py-4 font-black text-white"
						>
							Avsluta spelet och räkna vinnare
						</button>
					)}
			</div>

			{/* SCORE MODAL */}
			{editCell && (
				<div
					className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[2px]"
					onClick={() => setEditCell(null)}
				>
					<div
						className="w-full max-w-[430px] rounded-[28px] bg-white p-6 shadow-2xl"
						onClick={(event) => event.stopPropagation()}
					>
						<div className="flex justify-between gap-3">
							<div>
								<p
									className={`text-xs font-black uppercase ${
										isSubtractRow(
											protocol,
											editCell.rowIndex,
										)
											? "text-rose-500"
											: "text-emerald-600"
									}`}
								>
									{players[editCell.playerIndex].name}
								</p>

								<h2 className="mt-1 text-xl font-black text-slate-950">
									{rowLabel(protocol, editCell.rowIndex)}
								</h2>

								{isSubtractRow(protocol, editCell.rowIndex) && (
									<p className="mt-2 text-sm font-bold text-rose-500">
										Poängen dras av automatiskt.
									</p>
								)}
							</div>

							<button
								onClick={() => setEditCell(null)}
								className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100"
							>
								<X size={18} />
							</button>
						</div>

						<div className="mt-7 flex items-center justify-center gap-4">
							<button
								type="button"
								onClick={() =>
									setEditCell((prev) =>
										prev
											? {
													...prev,

													value: Math.max(
														0,
														prev.value - 1,
													),
												}
											: prev,
									)
								}
								className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100"
							>
								<Minus />
							</button>

							<div className="text-center">
								<input
									type="number"
									min={0}
									value={editCell.value}
									onChange={(e) =>
										setEditCell({
											...editCell,

											value: Math.max(
												0,
												Number(e.target.value),
											),
										})
									}
									className="w-32 rounded-[16px] border border-slate-200 px-3 py-3 text-center text-2xl font-black outline-none focus:border-emerald-400"
								/>

								{isSubtractRow(protocol, editCell.rowIndex) && (
									<p className="mt-2 text-xs font-black text-rose-500">
										Blir −{editCell.value} poäng
									</p>
								)}
							</div>

							<button
								type="button"
								onClick={() =>
									setEditCell((prev) =>
										prev
											? {
													...prev,

													value: prev.value + 1,
												}
											: prev,
									)
								}
								className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100"
							>
								<Plus />
							</button>
						</div>

						<button
							type="button"
							onClick={commitCell}
							className={`mt-7 flex w-full items-center justify-center gap-2 rounded-full px-5 py-4 font-black text-white ${
								isSubtractRow(protocol, editCell.rowIndex)
									? "bg-rose-500 hover:bg-rose-600"
									: "bg-emerald-500 hover:bg-emerald-600"
							}`}
						>
							<Check size={18} />
							Bekräfta
						</button>
					</div>
				</div>
			)}

			{/* RULES */}
			{showRules && (
				<div
					className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/35 p-4"
					onClick={() => setShowRules(false)}
				>
					<div
						className="max-h-[85dvh] w-full max-w-[560px] overflow-y-auto rounded-[28px] bg-white p-6"
						onClick={(event) => event.stopPropagation()}
					>
						<div className="flex items-start justify-between">
							<div>
								<p className="text-xs font-black uppercase text-emerald-600">
									{protocol.name}
								</p>

								<h2 className="mt-1 text-2xl font-black">
									Regler
								</h2>
							</div>

							<button
								onClick={() => setShowRules(false)}
								className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100"
							>
								<X size={18} />
							</button>
						</div>

						<p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-600">
							{protocol.rules}
						</p>
					</div>
				</div>
			)}
		</ScorecardLayout>
	);
}
