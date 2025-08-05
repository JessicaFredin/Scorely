/* eslint-disable @typescript-eslint/no-explicit-any */
// // // import { useNavigate } from "react-router-dom";
// // // import { useState, useEffect } from "react";
// // // import { ProtocolService } from "../services/ProtocolService";
// // // import type { SavedProtocol } from "../types/savedProtocol";

// // // export default function SavedProtocols() {
// // // 	const navigate = useNavigate();
// // // 	const [protocols, setProtocols] = useState<SavedProtocol[]>([]);

// // // 	useEffect(() => {
// // // 		setProtocols(ProtocolService.getAll());
// // // 	}, []);

// // // 	return (
// // // 		<div className="p-4">
// // // 			<h1 className="text-2xl font-bold mb-4">Sparade protokoll</h1>
// // // 			{protocols.length === 0 && <p>Inga sparade protokoll.</p>}
// // // 			<ul>
// // // 				{protocols.map((p) => (
// // // 					<li
// // // 						key={p.id}
// // // 						className="border p-3 mb-2 flex justify-between items-center"
// // // 					>
// // // 						<div>
// // // 							<p className="font-medium">{p.game}</p>
// // // 							<p className="text-sm text-gray-500">
// // // 								{new Date(p.date).toLocaleString()}
// // // 							</p>
// // // 						</div>
// // // 						<div className="flex gap-2">
// // // 							<button
// // // 								className="bg-blue-500 text-white px-3 py-1 rounded"
// // // 								onClick={() =>
// // // 									navigate(
// // // 										`/resume/${p.game.toLowerCase()}/${
// // // 											p.id
// // // 										}`
// // // 									)
// // // 								}
// // // 							>
// // // 								Fortsätt
// // // 							</button>
// // // 							<button
// // // 								className="bg-red-500 text-white px-3 py-1 rounded"
// // // 								onClick={() => {
// // // 									ProtocolService.delete(p.id);
// // // 									setProtocols(ProtocolService.getAll());
// // // 								}}
// // // 							>
// // // 								Ta bort
// // // 							</button>
// // // 						</div>
// // // 					</li>
// // // 				))}
// // // 			</ul>
// // // 		</div>
// // // 	);
// // // }




// // import { useNavigate } from "react-router-dom";
// // import { ProtocolService } from "../services/ProtocolService";

// // export default function SavedProtocols() {
// // 	const navigate = useNavigate();
// // 	const protocols = ProtocolService.getAll();

// // 	if (protocols.length === 0) {
// // 		return <p className="text-center mt-10">Inga sparade protokoll.</p>;
// // 	}

// // 	return (
// // 		<div className="p-4">
// // 			<h1 className="text-xl font-bold mb-4">Sparade protokoll</h1>
// // 			<div className="grid gap-4">
// // 				{protocols.map((protocol) => (
// // 					<div
// // 						key={protocol.id}
// // 						className="border p-4 rounded shadow hover:bg-gray-100 cursor-pointer"
// // 						onClick={() =>
// // 							navigate(`/resume-protocol/${protocol.id}`)
// // 						}
// // 					>
// // 						<h2 className="font-bold">{protocol.game}</h2>
// // 						<p>Datum: {new Date(protocol.date).toLocaleString()}</p>
// // 						<p>
// // 							Spelare:{" "}
// // 							{protocol.players.map((p) => p.name).join(", ")}
// // 						</p>
// // 					</div>
// // 				))}
// // 			</div>
// // 		</div>
// // 	);
// // }




// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { ProtocolService } from "../services/ProtocolService";
// import type { SavedProtocol } from "../types/savedProtocol";

// export default function SavedProtocols() {
// 	const [protocols, setProtocols] = useState<SavedProtocol[]>([]);
// 	const navigate = useNavigate();

// 	useEffect(() => {
// 		setProtocols(ProtocolService.getAll());
// 	}, []);

// 	if (!protocols.length) {
// 		return (
// 			<div className="p-4 text-center">
// 				Inga sparade protokoll hittades.
// 			</div>
// 		);
// 	}

// 	return (
// 		<div className="p-4 grid gap-4">
// 			{protocols.map((protocol) => (
// 				<div
// 					key={protocol.id}
// 					onClick={() => navigate(`/resume-protocol/${protocol.id}`)}
// 					className="cursor-pointer border rounded-lg p-4 shadow hover:bg-gray-100 transition"
// 				>
// 					<h2 className="font-bold">
// 						{protocol.name || protocol.gameType}
// 					</h2>
// 					<p>
// 						Spelare:{" "}
// 						{protocol.players.map((p) => p.name).join(", ")}
// 					</p>
// 					<p>
// 						Datum:{" "}
// 						{protocol.date
// 							? new Date(protocol.date).toLocaleString()
// 							: "Okänt"}
// 					</p>
// 				</div>
// 			))}
// 		</div>
// 	);
// }




import { useNavigate } from "react-router-dom";
import { ProtocolService } from "../services/ProtocolService";
import { ArrowLeft } from "lucide-react";

export default function SavedProtocols() {
	const navigate = useNavigate();
	const protocols = ProtocolService.getAll().filter(
		(p) => p.gameType === "discGolf"
	);

	if (!protocols.length) {
		return (
			<div className="p-4 text-center">
				Inga sparade Disc Golf-protokoll.
			</div>
		);
	}

	// Funktion för att kolla om spelet är avslutat
	const getStatus = (protocol: any) => {
		const allFilled = protocol.scores.every((playerScores: number[]) =>
			playerScores.every((score) => score > 0)
		);
		return allFilled ? "Avslutad" : "Pågående";
	};


	return (
		<div className="p-4 grid gap-4">
			<button
				onClick={() => navigate(-1)}
				className="text-gray-600 hover:text-black flex items-center gap-2"
			>
				<ArrowLeft size={24} />
				<span className="text-md font-medium">Tillbaka</span>
			</button>
			{protocols.map((protocol) => (
				<div
					key={protocol.id}
					className="cursor-pointer border rounded-lg p-4 shadow hover:bg-gray-100 transition"
					onClick={() => navigate(`/resume-protocol/${protocol.id}`)}
				>
					<h2 className="font-bold">{protocol.name}</h2>
					<span
						className={`text-xs font-semibold px-2 py-1 rounded ${
							getStatus(protocol) === "Avslutad"
								? "bg-red-200 text-red-800"
								: "bg-green-200 text-green-800"
						}`}
					>
						{getStatus(protocol)}
					</span>
					<p>
						Spelare:{" "}
						{protocol.players.map((p) => p.name).join(", ")}
					</p>
					<p>
						Datum:{" "}
						{protocol.date
							? new Date(protocol.date).toLocaleString()
							: "Okänt"}
					</p>
				</div>
			))}
		</div>
	);
}
