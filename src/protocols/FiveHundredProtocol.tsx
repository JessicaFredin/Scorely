import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

type ScoreCellValue = number | "";

type Player = {
	name: string;
};

type FiveHundredProtocolProps = {
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
	playerIndex: number;
} | null;

function cloneValues(values: ScoreCellValue[][]) {
	return values.map((row) => [...row]);
}

function getPlayerScores(
	values: ScoreCellValue[][],
	playerIndex: number,
): number[] {
	return values
		.map((row) => row[playerIndex])
		.filter(
			(value): value is number =>
				value !== "" && !Number.isNaN(Number(value)),
		)
		.map(Number);
}

function getPlayerTotal(values: ScoreCellValue[][], playerIndex: number) {
	return getPlayerScores(values, playerIndex).reduce(
		(sum, value) => sum + value,
		0,
	);
}

function findNextEmptyRow(values: ScoreCellValue[][], playerIndex: number) {
	return values.findIndex((row) => row[playerIndex] === "");
}

function applyScoreToValues(
	values: ScoreCellValue[][],
	playerIndex: number,
	score: number,
) {
	const next = cloneValues(values);
	const rowIndex = findNextEmptyRow(next, playerIndex);

	if (rowIndex === -1) {
		return null;
	}

	next[rowIndex][playerIndex] = score;
	return next;
}

export default function FiveHundredProtocol({
	players,
	values,
	onChange,
	onBatchChange,
	isLocked = false,
}: FiveHundredProtocolProps) {
	const [modal, setModal] = useState<ModalState>(null);
	const [scoreInput, setScoreInput] = useState("");

	const playerTotals = useMemo(
		() => players.map((_, index) => getPlayerTotal(values, index)),
		[players, values],
	);

	const playerScores = useMemo(
		() => players.map((_, index) => getPlayerScores(values, index)),
		[players, values],
	);

	const winnerName =
		players.find((_, index) => playerTotals[index] >= 500)?.name ?? null;

	const openModal = (playerIndex: number) => {
		if (isLocked) return;

		setScoreInput("");
		setModal({ playerIndex });
	};

	const closeModal = () => {
		setModal(null);
		setScoreInput("");
	};

	const handleAddScore = () => {
		if (!modal || isLocked) return;

		const parsed = Number(scoreInput.trim());

		if (!Number.isFinite(parsed)) {
			return;
		}

		if (onBatchChange) {
			onBatchChange((prev) => {
				const next = applyScoreToValues(
					prev,
					modal.playerIndex,
					parsed,
				);

				if (!next) {
					alert(
						"500-protokollet är fullt. Öka antalet rader i protocolRegistry.",
					);
					return prev;
				}

				return next;
			});
		} else {
			const rowIndex = findNextEmptyRow(values, modal.playerIndex);

			if (rowIndex === -1) {
				alert(
					"500-protokollet är fullt. Öka antalet rader i protocolRegistry.",
				);
				return;
			}

			onChange(rowIndex, modal.playerIndex, parsed);
		}

		closeModal();
	};

	const activePlayerIndex = modal?.playerIndex ?? 0;
	const activePlayerName = players[activePlayerIndex]?.name ?? "";
	const activePlayerTotal = playerTotals[activePlayerIndex] ?? 0;

	return (
		<>
			<div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
				{players.map((player, playerIndex) => {
					const total = playerTotals[playerIndex];
					const scores = playerScores[playerIndex];
					const isWinner = total >= 500;

					return (
						<div
							key={player.name}
							className="flex min-h-[360px] min-w-0 flex-col overflow-hidden rounded-[26px] border border-[#dbe5df] bg-white/72 shadow-[0_8px_24px_rgba(0,0,0,0.03)]"
						>
							<div className="flex items-start justify-between gap-4 border-b border-[#d8e3dc] bg-[#e7f1eb] p-5">
								<div className="min-w-0">
									<button
										type="button"
										onClick={() => openModal(playerIndex)}
										disabled={isLocked}
										className="text-left text-[1.2rem] font-black text-slate-900 transition hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-100"
									>
										{player.name}
									</button>

									<div className="mt-2 h-6">
										{isWinner && (
											<span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-black uppercase tracking-[0.08em] text-emerald-600">
												Vinnare!
											</span>
										)}
									</div>
								</div>

								<div className="shrink-0 text-[1.05rem] font-black text-emerald-600 sm:text-[1.15rem]">
									{total}p
								</div>
							</div>

							<button
								type="button"
								onClick={() => openModal(playerIndex)}
								disabled={isLocked}
								className="block w-full min-w-0 flex-1 px-4 py-4 text-left transition hover:bg-white/35 disabled:cursor-not-allowed disabled:opacity-100 sm:px-5"
							>
								{scores.length === 0 ? (
									<div className="flex min-h-[110px] items-center justify-center sm:min-h-[130px]">
										<span className="text-center text-sm text-slate-300">
											Tryck för att lägga poäng
										</span>
									</div>
								) : (
									<div className="flex flex-wrap justify-center gap-2">
										{scores.map((score, index) => (
											<div
												key={`${player.name}-${index}-${score}`}
												className={`rounded-full px-4 py-2 text-sm font-bold ${
													score >= 0
														? "bg-[#eef4ef] text-slate-900"
														: "bg-rose-50 text-rose-600"
												}`}
											>
												{score > 0
													? `+${score}`
													: score}
											</div>
										))}
									</div>
								)}

								{total >= 500 && winnerName === player.name && (
									<p className="mt-4 text-center text-sm font-semibold text-slate-600">
										Grattis! {player.name} har vunnit spelet
										med {total} poäng.
									</p>
								)}
							</button>

							<div className="mt-auto px-4 pb-4 pt-2">
								<button
									type="button"
									onClick={() => openModal(playerIndex)}
									disabled={isLocked}
									className={`inline-flex w-full min-w-0 items-center justify-center gap-2 rounded-[18px] px-4 py-4 text-[1rem] font-bold transition ${
										isLocked
											? "bg-white/40 text-slate-400"
											: "bg-white/80 text-slate-900 shadow-[0_6px_18px_rgba(0,0,0,0.03)] hover:-translate-y-0.5"
									}`}
								>
									<Plus size={17} className="shrink-0" />
									<span className="truncate">
										Lägg till poäng
									</span>
								</button>
							</div>
						</div>
					);
				})}
			</div>

			{modal && !isLocked && (
				<div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/20 px-4 py-6 backdrop-blur-sm">
					<div
						className="relative my-auto w-full max-w-[520px] rounded-[28px] bg-white p-5 shadow-[0_24px_60px_rgba(0,0,0,0.18)] sm:p-7"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="mb-5 flex items-start justify-between gap-4">
							<div className="min-w-0">
								<h2 className="text-[1.4rem] font-black text-slate-900 sm:text-[1.9rem]">
									Poäng till {activePlayerName}
								</h2>

								<p className="mt-1 text-[1rem] text-slate-500">
									Nuvarande: {activePlayerTotal}p
								</p>
							</div>

							<button
								type="button"
								onClick={closeModal}
								className="shrink-0 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
								aria-label="Stäng"
							>
								<X size={24} />
							</button>
						</div>

						<div className="space-y-4">
							<label className="block">
								<span className="mb-2 block text-sm font-semibold text-slate-600">
									Ange poäng
								</span>

								<input
									type="number"
									inputMode="numeric"
									value={scoreInput}
									onChange={(e) =>
										setScoreInput(e.target.value)
									}
									className="w-full rounded-[18px] border border-[#d8e3dc] bg-white px-4 py-4 text-[1.05rem] font-semibold text-slate-900 outline-none transition focus:border-emerald-400"
									placeholder="Till exempel 40 eller -50"
									autoFocus
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											handleAddScore();
										}
									}}
								/>
							</label>

							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<button
									type="button"
									onClick={handleAddScore}
									className="rounded-[18px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-[1.05rem] font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:text-[1.1rem]"
								>
									Spara poäng
								</button>

								<button
									type="button"
									onClick={closeModal}
									className="rounded-[18px] border border-transparent px-5 py-4 text-[1.05rem] font-medium text-slate-500 transition hover:bg-slate-50"
								>
									Avbryt
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
