import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, Trash2, Users, Trophy } from "lucide-react";
import { ProtocolService } from "../services/ProtocolService";
import type { SavedProtocol } from "../types/savedProtocol";

function decodeProtocolScore(
	protocol: SavedProtocol,
	value: SavedProtocol["values"][number][number],
) {
	if (value === "" || typeof value !== "number") return 0;

	if (protocol.gameType === "plump") {
		if (value >= 200) return 0;
		if (value >= 100) return 10 + (value - 100);
	}

	if (protocol.gameType === "trebeller") {
		return (value % 100) - 50;
	}

	return value;
}

function getProtocolPlayerTotals(protocol: SavedProtocol) {
	return protocol.players.map((_, playerIndex) => {
		return protocol.values.reduce((sum, row) => {
			return sum + decodeProtocolScore(protocol, row[playerIndex]);
		}, 0);
	});
}

function formatScore(score: number) {
	return score > 0 ? `+${score}` : `${score}`;
}

function formatDate(dateString: string) {
	const date = new Date(dateString);

	if (Number.isNaN(date.getTime())) {
		return "Okänt datum";
	}

	return date.toLocaleDateString("sv-SE");
}

function getStatusColor(status: SavedProtocol["status"]) {
	return status === "Avslutad"
		? "bg-emerald-100 text-emerald-700"
		: "bg-amber-50 text-amber-700";
}

export default function SavedProtocols() {
	const navigate = useNavigate();
	const [protocols, setProtocols] = useState<SavedProtocol[]>(
		ProtocolService.getAll(),
	);

	const sortedProtocols = useMemo(
		() =>
			[...protocols].sort(
				(a, b) =>
					new Date(b.updatedAt).getTime() -
					new Date(a.updatedAt).getTime(),
			),
		[protocols],
	);

	const handleDelete = (id: string) => {
		ProtocolService.delete(id);
		setProtocols(ProtocolService.getAll());
	};

	if (!sortedProtocols.length) {
		return (
			<section className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.95)_0%,_rgba(219,239,226,0.96)_45%,_rgba(210,233,217,0.98)_100%)]">
				<div className="mx-auto flex min-h-screen max-w-[760px] flex-col px-6 py-8">
					<button
						onClick={() => navigate(-1)}
						className="mb-10 flex w-fit items-center gap-2 text-slate-500 transition hover:text-slate-800"
					>
						<ArrowLeft size={24} />
						<span className="text-[1.1rem] font-medium">
							Tillbaka
						</span>
					</button>

					<h1 className="text-[2.4rem] font-black text-slate-950">
						Sparade protokoll
					</h1>

					<div className="mt-8 rounded-[28px] bg-white/55 p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
						<p className="text-lg text-slate-600">
							Det finns inga sparade protokoll än.
						</p>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.95)_0%,_rgba(219,239,226,0.96)_45%,_rgba(210,233,217,0.98)_100%)]">
			<div className="mx-auto flex min-h-screen max-w-[760px] flex-col px-6 py-8">
				<button
					onClick={() => navigate(-1)}
					className="mb-10 flex w-fit items-center gap-2 text-slate-500 transition hover:text-slate-800"
				>
					<ArrowLeft size={24} />
					<span className="text-[1.1rem] font-medium">Tillbaka</span>
				</button>

				<h1 className="text-[2.4rem] font-black text-slate-950">
					Sparade protokoll
				</h1>

				<div className="mt-8 space-y-5">
					{sortedProtocols.map((protocol) => {
						const totals = getProtocolPlayerTotals(protocol);

						return (
							<div
								key={protocol.id}
								className="rounded-[28px] bg-white/65 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.04)] transition hover:bg-white/75"
							>
								<div className="flex items-start justify-between gap-4">
									<button
										onClick={() =>
											navigate(
												`/resume-protocol/${protocol.id}`,
											)
										}
										className="flex-1 text-left"
									>
										<div className="flex items-start justify-between gap-4">
											<div>
												<p className="text-[1.9rem] font-black text-slate-900">
													{protocol.gameName}
												</p>

												<p className="mt-1 text-[1rem] font-medium text-slate-500">
													{protocol.category
														? protocol.category
																.charAt(0)
																.toUpperCase() +
															protocol.category.slice(
																1,
															)
														: protocol.gameType}
												</p>

												<div className="mt-3 flex flex-wrap items-center gap-4 text-slate-500">
													<span className="inline-flex items-center gap-2 text-[1.05rem] font-medium">
														<CalendarDays
															size={18}
														/>
														{formatDate(
															protocol.updatedAt,
														)}
													</span>

													<span className="inline-flex items-center gap-2 text-[1.05rem] font-medium">
														<Users size={18} />
														{
															protocol.players
																.length
														}{" "}
														spelare
													</span>
												</div>
											</div>
										</div>

										<div className="mt-5 flex flex-wrap gap-3">
											{protocol.players.map(
												(player, index) => (
													<div
														key={`${protocol.id}-${player.name}`}
														className="rounded-full bg-[#eef4ef] px-4 py-2 text-[1rem] font-medium text-slate-600"
													>
														{player.name}:{" "}
														<span className="font-black text-slate-900">
															{formatScore(
																totals[index],
															)}
														</span>
													</div>
												),
											)}
										</div>

										<div className="mt-4 flex flex-wrap gap-3">
											<div
												className={`inline-flex rounded-full px-4 py-2 text-sm font-bold ${getStatusColor(
													protocol.status,
												)}`}
											>
												{protocol.status}
											</div>

											{protocol.winnerName && (
												<div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
													<Trophy size={16} />
													Vinnare:{" "}
													{protocol.winnerName}
												</div>
											)}
										</div>
									</button>

									<button
										onClick={() =>
											handleDelete(protocol.id)
										}
										className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-rose-500"
										aria-label="Ta bort protokoll"
									>
										<Trash2 size={22} />
									</button>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
