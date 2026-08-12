import { useEffect, useState } from "react";

import { ChevronLeft, Copy, Pencil, Play, Plus, Trash2 } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { CustomProtocolService } from "../services/CustomProtocolService";

import type { CustomProtocolDefinition } from "../types/customProtocol";

const categoryNames: Record<CustomProtocolDefinition["category"], string> = {
	kortspel: "Kortspel",

	tärningsspel: "Tärningsspel",

	golf: "Golf",

	sport: "Sport",

	annat: "Annat",
};

export default function CustomProtocols() {
	const navigate = useNavigate();

	const [protocols, setProtocols] = useState<CustomProtocolDefinition[]>([]);

	const reload = () => {
		setProtocols(CustomProtocolService.getAll());
	};

	useEffect(() => {
		reload();
	}, []);

	const deleteProtocol = (id: string) => {
		const confirmed = window.confirm(
			"Vill du verkligen ta bort detta protokoll?",
		);

		if (!confirmed) {
			return;
		}

		CustomProtocolService.delete(id);

		reload();
	};

	const duplicateProtocol = (id: string) => {
		CustomProtocolService.duplicate(id);

		reload();
	};

	return (
		<section className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.95)_0%,_rgba(219,239,226,0.96)_45%,_rgba(210,233,217,0.98)_100%)]">
			<div className="mx-auto w-full max-w-[760px] px-4 py-8 sm:px-6 sm:py-12">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => navigate("/")}
						className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-slate-700"
					>
						<ChevronLeft size={20} />
					</button>

					<div>
						<p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-600">
							Anpassat
						</p>

						<h1 className="text-2xl font-black text-slate-950">
							Egna protokoll
						</h1>
					</div>
				</div>

				<button
					type="button"
					onClick={() => navigate("/create-custom-protocol")}
					className="mt-8 flex w-full items-center justify-center gap-2 rounded-[20px] bg-emerald-500 px-5 py-4 font-black text-white transition hover:bg-emerald-600"
				>
					<Plus size={19} />
					Skapa nytt protokoll
				</button>

				{protocols.length === 0 ? (
					<div className="mt-6 rounded-[24px] border border-white/70 bg-white/60 p-8 text-center">
						<p className="font-black text-slate-800">
							Inga egna protokoll ännu
						</p>

						<p className="mt-2 text-sm leading-6 text-slate-500">
							Här hamnar protokollen du skapar.
						</p>
					</div>
				) : (
					<div className="mt-6 space-y-4">
						{protocols.map((protocol) => (
							<div
								key={protocol.id}
								className="rounded-[24px] border border-white/70 bg-white/75 p-5 shadow-[0_8px_22px_rgba(0,0,0,0.04)]"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="min-w-0">
										<p className="truncate text-lg font-black text-slate-950">
											{protocol.name}
										</p>

										<p className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-emerald-600">
											{categoryNames[protocol.category]} ·{" "}
											{protocol.playerMin}–
											{protocol.playerMax} spelare
										</p>

										{protocol.description && (
											<p className="mt-2 text-sm leading-6 text-slate-500">
												{protocol.description}
											</p>
										)}
									</div>

									<div className="flex shrink-0 gap-1">
										{/* DUPLICERA */}
										<button
											type="button"
											onClick={() =>
												duplicateProtocol(protocol.id)
											}
											className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
											title="Duplicera"
										>
											<Copy size={17} />
										</button>

										{/* REDIGERA */}
										<button
											type="button"
											onClick={() =>
												navigate(
													`/custom-protocol/${protocol.id}/edit`,
												)
											}
											className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
											title="Redigera"
										>
											<Pencil size={17} />
										</button>

										{/* TA BORT */}
										<button
											type="button"
											onClick={() =>
												deleteProtocol(protocol.id)
											}
											className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 text-rose-500 transition hover:bg-rose-100"
											title="Ta bort"
										>
											<Trash2 size={17} />
										</button>
									</div>
								</div>

								<button
									type="button"
									onClick={() =>
										navigate(
											`/custom-protocol/${protocol.id}/players`,
										)
									}
									className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-3.5 text-sm font-black text-white transition hover:bg-slate-800"
								>
									<Play size={17} fill="currentColor" />
									Spela
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
