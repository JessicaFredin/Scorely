// /* eslint-disable @typescript-eslint/no-explicit-any */
// // // // import { useNavigate } from "react-router-dom";
// // // // import { useState, useEffect } from "react";
// // // // import { ProtocolService } from "../services/ProtocolService";
// // // // import type { SavedProtocol } from "../types/savedProtocol";

// // // // export default function SavedProtocols() {
// // // // 	const navigate = useNavigate();
// // // // 	const [protocols, setProtocols] = useState<SavedProtocol[]>([]);

// // // // 	useEffect(() => {
// // // // 		setProtocols(ProtocolService.getAll());
// // // // 	}, []);

// // // // 	return (
// // // // 		<div className="p-4">
// // // // 			<h1 className="text-2xl font-bold mb-4">Sparade protokoll</h1>
// // // // 			{protocols.length === 0 && <p>Inga sparade protokoll.</p>}
// // // // 			<ul>
// // // // 				{protocols.map((p) => (
// // // // 					<li
// // // // 						key={p.id}
// // // // 						className="border p-3 mb-2 flex justify-between items-center"
// // // // 					>
// // // // 						<div>
// // // // 							<p className="font-medium">{p.game}</p>
// // // // 							<p className="text-sm text-gray-500">
// // // // 								{new Date(p.date).toLocaleString()}
// // // // 							</p>
// // // // 						</div>
// // // // 						<div className="flex gap-2">
// // // // 							<button
// // // // 								className="bg-blue-500 text-white px-3 py-1 rounded"
// // // // 								onClick={() =>
// // // // 									navigate(
// // // // 										`/resume/${p.game.toLowerCase()}/${
// // // // 											p.id
// // // // 										}`
// // // // 									)
// // // // 								}
// // // // 							>
// // // // 								Fortsätt
// // // // 							</button>
// // // // 							<button
// // // // 								className="bg-red-500 text-white px-3 py-1 rounded"
// // // // 								onClick={() => {
// // // // 									ProtocolService.delete(p.id);
// // // // 									setProtocols(ProtocolService.getAll());
// // // // 								}}
// // // // 							>
// // // // 								Ta bort
// // // // 							</button>
// // // // 						</div>
// // // // 					</li>
// // // // 				))}
// // // // 			</ul>
// // // // 		</div>
// // // // 	);
// // // // }

// // // import { useNavigate } from "react-router-dom";
// // // import { ProtocolService } from "../services/ProtocolService";

// // // export default function SavedProtocols() {
// // // 	const navigate = useNavigate();
// // // 	const protocols = ProtocolService.getAll();

// // // 	if (protocols.length === 0) {
// // // 		return <p className="text-center mt-10">Inga sparade protokoll.</p>;
// // // 	}

// // // 	return (
// // // 		<div className="p-4">
// // // 			<h1 className="text-xl font-bold mb-4">Sparade protokoll</h1>
// // // 			<div className="grid gap-4">
// // // 				{protocols.map((protocol) => (
// // // 					<div
// // // 						key={protocol.id}
// // // 						className="border p-4 rounded shadow hover:bg-gray-100 cursor-pointer"
// // // 						onClick={() =>
// // // 							navigate(`/resume-protocol/${protocol.id}`)
// // // 						}
// // // 					>
// // // 						<h2 className="font-bold">{protocol.game}</h2>
// // // 						<p>Datum: {new Date(protocol.date).toLocaleString()}</p>
// // // 						<p>
// // // 							Spelare:{" "}
// // // 							{protocol.players.map((p) => p.name).join(", ")}
// // // 						</p>
// // // 					</div>
// // // 				))}
// // // 			</div>
// // // 		</div>
// // // 	);
// // // }

// // import React, { useEffect, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { ProtocolService } from "../services/ProtocolService";
// // import type { SavedProtocol } from "../types/savedProtocol";

// // export default function SavedProtocols() {
// // 	const [protocols, setProtocols] = useState<SavedProtocol[]>([]);
// // 	const navigate = useNavigate();

// // 	useEffect(() => {
// // 		setProtocols(ProtocolService.getAll());
// // 	}, []);

// // 	if (!protocols.length) {
// // 		return (
// // 			<div className="p-4 text-center">
// // 				Inga sparade protokoll hittades.
// // 			</div>
// // 		);
// // 	}

// // 	return (
// // 		<div className="p-4 grid gap-4">
// // 			{protocols.map((protocol) => (
// // 				<div
// // 					key={protocol.id}
// // 					onClick={() => navigate(`/resume-protocol/${protocol.id}`)}
// // 					className="cursor-pointer border rounded-lg p-4 shadow hover:bg-gray-100 transition"
// // 				>
// // 					<h2 className="font-bold">
// // 						{protocol.name || protocol.gameType}
// // 					</h2>
// // 					<p>
// // 						Spelare:{" "}
// // 						{protocol.players.map((p) => p.name).join(", ")}
// // 					</p>
// // 					<p>
// // 						Datum:{" "}
// // 						{protocol.date
// // 							? new Date(protocol.date).toLocaleString()
// // 							: "Okänt"}
// // 					</p>
// // 				</div>
// // 			))}
// // 		</div>
// // 	);
// // }

// import { useNavigate } from "react-router-dom";
// import { ProtocolService } from "../services/ProtocolService";
// import { ArrowLeft } from "lucide-react";

// export default function SavedProtocols() {
// 	const navigate = useNavigate();
// 	const protocols = ProtocolService.getAll().filter(
// 		(p) => p.gameType === "discGolf"
// 	);

// 	if (!protocols.length) {
// 		return (
// 			<div className="p-4 text-center">
// 				Inga sparade Disc Golf-protokoll.
// 			</div>
// 		);
// 	}

// 	// Funktion för att kolla om spelet är avslutat
// 	const getStatus = (protocol: any) => {
// 		const allFilled = protocol.values.every((playerScores: number[]) =>
// 			playerScores.every((score) => score > 0)
// 		);
// 		return allFilled ? "Avslutad" : "Pågående";
// 	};

// 	return (
// 		<div className="p-4 grid gap-4">
// 			<button
// 				onClick={() => navigate(-1)}
// 				className="text-gray-600 hover:text-black flex items-center gap-2"
// 			>
// 				<ArrowLeft size={24} />
// 				<span className="text-md font-medium">Tillbaka</span>
// 			</button>
// 			{protocols.map((protocol) => (
// 				<div
// 					key={protocol.id}
// 					className="cursor-pointer border rounded-lg p-4 shadow hover:bg-gray-100 transition"
// 					onClick={() => navigate(`/resume-protocol/${protocol.id}`)}
// 				>
// 					<h2 className="font-bold">{protocol.gameName}</h2>
// 					<span
// 						className={`text-xs font-semibold px-2 py-1 rounded ${
// 							getStatus(protocol) === "Avslutad"
// 								? "bg-red-200 text-red-800"
// 								: "bg-green-200 text-green-800"
// 						}`}
// 					>
// 						{getStatus(protocol)}
// 					</span>
// 					<p>
// 						Spelare:{" "}
// 						{protocol.players.map((p) => p.name).join(", ")}
// 					</p>
// 					<p>
// 						Datum:{" "}
// 						{protocol.updatedAt
// 							? new Date(protocol.updatedAt).toLocaleString()
// 							: "Okänt"}
// 					</p>
// 				</div>
// 			))}
// 		</div>
// 	);
// }

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarDays, Trash2, Users, Trophy } from "lucide-react";
import { ProtocolService } from "../services/ProtocolService";
import type { SavedProtocol } from "../types/savedProtocol";

function getPlayerTotal(protocol: SavedProtocol, playerIndex: number) {
	return protocol.values.reduce((sum, row) => {
		const value = row[playerIndex];
		return sum + (typeof value === "number" ? value : 0);
	}, 0);
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
					{sortedProtocols.map((protocol) => (
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
													<CalendarDays size={18} />
													{formatDate(
														protocol.updatedAt,
													)}
												</span>

												<span className="inline-flex items-center gap-2 text-[1.05rem] font-medium">
													<Users size={18} />
													{
														protocol.players.length
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
														{getPlayerTotal(
															protocol,
															index,
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
												Vinnare: {protocol.winnerName}
											</div>
										)}
									</div>
								</button>

								<button
									onClick={() => handleDelete(protocol.id)}
									className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-rose-500"
									aria-label="Ta bort protokoll"
								>
									<Trash2 size={22} />
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}