import { useMemo, useState } from "react";

import { ArrowLeft, Minus, Plus, User } from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import { CustomGameService } from "../services/CustomGameService";

import { CustomProtocolService } from "../services/CustomProtocolService";

import type { CustomMatchScoreValue } from "../types/customProtocol";

function createValues(
	rowCount: number,
	playerCount: number,
): CustomMatchScoreValue[][] {
	return Array.from(
		{
			length: rowCount,
		},
		() =>
			Array.from(
				{
					length: playerCount,
				},
				() => "" as CustomMatchScoreValue,
			),
	);
}

export default function CustomProtocolPlayers() {
	const { id = "" } = useParams();

	const navigate = useNavigate();

	const protocol = useMemo(() => CustomProtocolService.getById(id), [id]);

	const [count, setCount] = useState(protocol?.playerMin ?? 2);

	const [names, setNames] = useState<string[]>(() =>
		Array.from(
			{
				length: protocol?.playerMin ?? 2,
			},
			() => "",
		),
	);

	const [selectedStarter, setSelectedStarter] = useState(0);

	const [error, setError] = useState("");

	if (!protocol) {
		return <Missing onBack={() => navigate("/custom-protocols")} />;
	}

	const updateCount = (nextCount: number) => {
		setCount(nextCount);

		setNames((prev) =>
			Array.from(
				{
					length: nextCount,
				},
				(_, index) => prev[index] ?? "",
			),
		);

		setSelectedStarter((prev) => Math.min(prev, nextCount - 1));
	};

	const handleStart = () => {
		const trimmed = names.map((name) => name.trim());

		if (trimmed.some((name) => !name)) {
			setError("Fyll i ett namn för alla spelare.");

			return;
		}

		if (
			new Set(trimmed.map((name) => name.toLowerCase())).size !==
			trimmed.length
		) {
			setError("Spelarna behöver ha olika namn.");

			return;
		}

		let startingPlayerIndex = 0;

		if (protocol.turnOrder.enabled) {
			if (protocol.turnOrder.firstPlayerMode === "select") {
				startingPlayerIndex = selectedStarter;
			}

			if (protocol.turnOrder.firstPlayerMode === "random") {
				startingPlayerIndex = Math.floor(Math.random() * count);
			}
		}

		const orderedPlayers = trimmed.map((name) => ({
			name,
		}));

		if (protocol.turnOrder.enabled && startingPlayerIndex > 0) {
			const rotated = [
				...orderedPlayers.slice(startingPlayerIndex),

				...orderedPlayers.slice(0, startingPlayerIndex),
			];

			orderedPlayers.splice(0, orderedPlayers.length, ...rotated);

			startingPlayerIndex = 0;
		}

		const rowCount =
			protocol.layout === "rounds"
				? Math.max(1, protocol.initialRounds)
				: protocol.rows.length;

		const now = new Date().toISOString();

		const matchId = crypto.randomUUID();

		const newGame = CustomGameService.save({
			id: matchId,

			protocolId: protocol.id,

			protocol,

			players: orderedPlayers,

			startingPlayerIndex,

			values: createValues(rowCount, count),

			createdAt: now,

			updatedAt: now,

			finished: false,

			winnerName: null,
		});

		CustomGameService.setActiveGame(newGame.id);

		navigate(`/custom-match/${newGame.id}`);
	};

	return (
		<section className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.95)_0%,_rgba(219,239,226,0.96)_45%,_rgba(210,233,217,0.98)_100%)]">
			<div className="mx-auto flex min-h-screen max-w-[640px] flex-col px-6 py-10">
				<button
					onClick={() => navigate(-1)}
					className="mb-8 flex w-fit items-center gap-2 text-slate-500"
				>
					<ArrowLeft size={22} />
					Tillbaka
				</button>

				<div className="rounded-[30px] bg-white/65 px-6 py-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)] sm:px-9">
					<h1 className="text-center text-3xl font-black text-slate-950">
						{protocol.name}
					</h1>

					<p className="mt-2 text-center text-sm text-slate-500">
						Välj spelare
					</p>

					<div className="mt-8 flex items-center justify-center gap-5">
						<button
							type="button"
							onClick={() =>
								updateCount(
									Math.max(protocol.playerMin, count - 1),
								)
							}
							disabled={count <= protocol.playerMin}
							className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 disabled:opacity-40"
						>
							<Minus />
						</button>

						<div className="flex h-20 w-20 items-center justify-center rounded-[20px] bg-emerald-500 text-3xl font-black text-white">
							{count}
						</div>

						<button
							type="button"
							onClick={() =>
								updateCount(
									Math.min(protocol.playerMax, count + 1),
								)
							}
							disabled={count >= protocol.playerMax}
							className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 disabled:opacity-40"
						>
							<Plus />
						</button>
					</div>

					<div className="mt-8 space-y-3">
						{names.map((name, index) => (
							<div
								key={index}
								className="flex items-center gap-3 rounded-[18px] border border-[#d6e1da] bg-white/80 px-4 py-4"
							>
								<User size={18} className="text-slate-300" />

								<input
									value={name}
									onChange={(e) =>
										setNames((prev) =>
											prev.map((item, currentIndex) =>
												currentIndex === index
													? e.target.value
													: item,
											),
										)
									}
									placeholder={`Spelare ${index + 1}`}
									className="w-full bg-transparent outline-none"
								/>
							</div>
						))}
					</div>

					{protocol.turnOrder.enabled &&
						protocol.turnOrder.firstPlayerMode === "select" && (
							<div className="mt-7">
								<p className="text-sm font-black text-slate-700">
									Vem börjar?
								</p>

								<div className="mt-3 grid grid-cols-2 gap-2">
									{names.map((name, index) => (
										<button
											key={index}
											type="button"
											onClick={() =>
												setSelectedStarter(index)
											}
											className={`rounded-[16px] border px-3 py-3 text-sm font-black ${
												selectedStarter === index
													? "border-emerald-400 bg-emerald-50 text-emerald-700"
													: "border-slate-200 bg-white text-slate-600"
											}`}
										>
											{name.trim() ||
												`Spelare ${index + 1}`}
										</button>
									))}
								</div>
							</div>
						)}

					{error && (
						<p className="mt-4 text-center text-sm font-bold text-rose-600">
							{error}
						</p>
					)}

					<button
						type="button"
						onClick={handleStart}
						className="mt-8 w-full rounded-full bg-emerald-500 px-5 py-4 font-black text-white"
					>
						Starta spelet
					</button>
				</div>
			</div>
		</section>
	);
}

function Missing({ onBack }: { onBack: () => void }) {
	return (
		<section className="min-h-screen bg-emerald-50 p-6">
			<div className="mx-auto max-w-lg rounded-3xl bg-white p-8 text-center">
				<h1 className="text-2xl font-black">
					Protokollet hittades inte
				</h1>

				<button
					onClick={onBack}
					className="mt-5 rounded-full bg-emerald-500 px-5 py-3 font-bold text-white"
				>
					Tillbaka
				</button>
			</div>
		</section>
	);
}