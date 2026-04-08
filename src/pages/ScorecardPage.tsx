// // import { useEffect, useMemo, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import ScorecardLayout from "../components/scorecard/ScorecardLayout";
// // import { useGameSession } from "../context/GameSessionContext";
// // import { protocolRegistry } from "../data/protocolRegistry";

// // type ScoreCellValue = number | "";

// // function cloneValues(values: ScoreCellValue[][]) {
// // 	return values.map((row) => [...row]);
// // }

// // export default function ScorecardPage() {
// // 	const { session } = useGameSession();
// // 	const navigate = useNavigate();

// // 	const game = session?.game;
// // 	const players = session?.players ?? [];

// // 	const gameId = String(game?.id ?? "").toLowerCase();
// // 	const protocolEntry = protocolRegistry[gameId];

// // 	const storageKey = useMemo(() => {
// // 		if (!game) return "";

// // 		const playerKey = players
// // 			.map((player) => player.name.trim().toLowerCase())
// // 			.join("|");

// // 		return `scorely:${String(game.id).toLowerCase()}:${playerKey}`;
// // 	}, [game, players]);

// // 	const [values, setValues] = useState<ScoreCellValue[][]>([]);
// // 	const [history, setHistory] = useState<ScoreCellValue[][][]>([]);
// // 	const [saveLabel, setSaveLabel] = useState("Spara");

// // 	useEffect(() => {
// // 		if (!game || !protocolEntry || players.length === 0) {
// // 			setValues([]);
// // 			setHistory([]);
// // 			return;
// // 		}

// // 		const fallbackValues = protocolEntry.createInitialValues(
// // 			players.length,
// // 		);

// // 		if (!storageKey) {
// // 			setValues(fallbackValues);
// // 			setHistory([]);
// // 			return;
// // 		}

// // 		const raw = localStorage.getItem(storageKey);

// // 		if (!raw) {
// // 			setValues(fallbackValues);
// // 			setHistory([]);
// // 			return;
// // 		}

// // 		try {
// // 			const parsed = JSON.parse(raw);

// // 			if (
// // 				Array.isArray(parsed) &&
// // 				parsed.length === fallbackValues.length &&
// // 				parsed.every(
// // 					(row) =>
// // 						Array.isArray(row) && row.length === players.length,
// // 				)
// // 			) {
// // 				setValues(parsed);
// // 				setHistory([]);
// // 				return;
// // 			}
// // 		} catch {
// // 			// ignore broken localStorage data
// // 		}

// // 		setValues(fallbackValues);
// // 		setHistory([]);
// // 	}, [game, players.length, protocolEntry, storageKey]);

// // 	useEffect(() => {
// // 		if (saveLabel !== "Sparat!") return;

// // 		const timeout = setTimeout(() => {
// // 			setSaveLabel("Spara");
// // 		}, 1800);

// // 		return () => clearTimeout(timeout);
// // 	}, [saveLabel]);

// // 	if (!game || players.length === 0) {
// // 		return (
// // 			<section className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.95)_0%,_rgba(219,239,226,0.96)_45%,_rgba(210,233,217,0.98)_100%)]">
// // 				<div className="mx-auto max-w-[720px] px-6 py-12">
// // 					<div className="rounded-[28px] bg-white/45 p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
// // 						<h1 className="text-2xl font-black text-slate-900">
// // 							Ingen spelomgång hittades
// // 						</h1>
// // 						<p className="mt-3 text-slate-500">
// // 							Välj spel och spelare först.
// // 						</p>

// // 						<button
// // 							type="button"
// // 							onClick={() => navigate("/")}
// // 							className="mt-6 rounded-full bg-emerald-500 px-6 py-3 font-bold text-white transition hover:bg-emerald-600"
// // 						>
// // 							Till startsidan
// // 						</button>
// // 					</div>
// // 				</div>
// // 			</section>
// // 		);
// // 	}

// // 	if (!protocolEntry) {
// // 		return (
// // 			<section className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.95)_0%,_rgba(219,239,226,0.96)_45%,_rgba(210,233,217,0.98)_100%)]">
// // 				<div className="mx-auto max-w-[720px] px-6 py-12">
// // 					<div className="rounded-[28px] bg-white/45 p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
// // 						<h1 className="text-2xl font-black text-slate-900">
// // 							Protokoll saknas
// // 						</h1>
// // 						<p className="mt-3 text-slate-500">
// // 							Det finns inget registrerat protokoll för{" "}
// // 							{game.name} än.
// // 						</p>

// // 						<button
// // 							type="button"
// // 							onClick={() => navigate(-1)}
// // 							className="mt-6 rounded-full bg-emerald-500 px-6 py-3 font-bold text-white transition hover:bg-emerald-600"
// // 						>
// // 							Tillbaka
// // 						</button>
// // 					</div>
// // 				</div>
// // 			</section>
// // 		);
// // 	}

// // 	const ProtocolComponent = protocolEntry.component;

// // 	const pushHistory = (snapshot: ScoreCellValue[][]) => {
// // 		setHistory((prev) => [...prev.slice(-49), cloneValues(snapshot)]);
// // 		setSaveLabel("Spara");
// // 	};

// // 	const handleCellChange = (
// // 		rowIndex: number,
// // 		playerIndex: number,
// // 		value: ScoreCellValue,
// // 	) => {
// // 		setValues((prev) => {
// // 			const prevClone = cloneValues(prev);
// // 			pushHistory(prevClone);

// // 			return prev.map((row, currentRowIndex) => {
// // 				if (currentRowIndex !== rowIndex) return row;

// // 				return row.map((cell, currentPlayerIndex) =>
// // 					currentPlayerIndex === playerIndex ? value : cell,
// // 				);
// // 			});
// // 		});
// // 	};

// // 	const handleBatchChange = (
// // 		updater: (prev: ScoreCellValue[][]) => ScoreCellValue[][],
// // 	) => {
// // 		setValues((prev) => {
// // 			const prevClone = cloneValues(prev);
// // 			pushHistory(prevClone);
// // 			return updater(cloneValues(prev));
// // 		});
// // 	};

// // 	const handleUndo = () => {
// // 		setHistory((prevHistory) => {
// // 			if (prevHistory.length === 0) {
// // 				return prevHistory;
// // 			}

// // 			const previousValues = prevHistory[prevHistory.length - 1];
// // 			setValues(cloneValues(previousValues));
// // 			setSaveLabel("Spara");

// // 			return prevHistory.slice(0, -1);
// // 		});
// // 	};

// // 	const handleReset = () => {
// // 		const resetValues = protocolEntry.createInitialValues(players.length);

// // 		if (values.length > 0) {
// // 			pushHistory(values);
// // 		}

// // 		setValues(resetValues);

// // 		if (storageKey) {
// // 			localStorage.removeItem(storageKey);
// // 		}

// // 		setSaveLabel("Spara");
// // 	};

// // 	const handleSave = () => {
// // 		if (!storageKey) return;

// // 		localStorage.setItem(storageKey, JSON.stringify(values));
// // 		setSaveLabel("Sparat!");
// // 	};

// // 	return (
// // 		<ScorecardLayout
// // 			title={game.name}
// // 			onBack={() => navigate(-1)}
// // 			onUndo={handleUndo}
// // 			isUndoDisabled={history.length === 0}
// // 			onReset={handleReset}
// // 			onSave={handleSave}
// // 			saveLabel={saveLabel}
// // 		>
// // 			<ProtocolComponent
// // 				gameName={game.name}
// // 				players={players}
// // 				values={values}
// // 				onChange={handleCellChange}
// // 				onBatchChange={handleBatchChange}
// // 			/>
// // 		</ScorecardLayout>
// // 	);
// // }

// import { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import ScorecardLayout from "../components/scorecard/ScorecardLayout";
// import { useGameSession } from "../context/GameSessionContext";
// import { protocolRegistry } from "../data/protocolRegistry";

// type ScoreCellValue = number | "";

// type ToastMessage = {
// 	id: number;
// 	text: string;
// };

// function cloneValues(values: ScoreCellValue[][]) {
// 	return values.map((row) => [...row]);
// }

// function getPlayerEvents(
// 	values: ScoreCellValue[][],
// 	playerIndex: number,
// ): number[] {
// 	return values
// 		.map((row) => row[playerIndex])
// 		.filter(
// 			(value): value is number =>
// 				value !== "" && !Number.isNaN(Number(value)),
// 		)
// 		.map(Number)
// 		.filter((value) => value !== 0);
// }

// function getPlayerTotal(values: ScoreCellValue[][], playerIndex: number) {
// 	return getPlayerEvents(values, playerIndex).reduce(
// 		(sum, value) => sum + value,
// 		0,
// 	);
// }

// function hasSaidChicago(events: number[]) {
// 	return events.includes(15) || events.includes(-15);
// }

// function getChicagoWinnerMessage(
// 	playerName: string,
// 	total: number,
// 	playerEvents: number[],
// ) {
// 	const saidChicago = hasSaidChicago(playerEvents);

// 	if (total >= 52 && saidChicago) {
// 		return `Grattis! ${playerName} har vunnit spelet, ${total} poäng.`;
// 	}

// 	return "";
// }

// export default function ScorecardPage() {
// 	const { session } = useGameSession();
// 	const navigate = useNavigate();

// 	const game = session?.game;
// 	const players = session?.players ?? [];

// 	const gameId = String(game?.id ?? "").toLowerCase();
// 	const protocolEntry = protocolRegistry[gameId];

// 	const storageKey = useMemo(() => {
// 		if (!game) return "";

// 		const playerKey = players
// 			.map((player) => player.name.trim().toLowerCase())
// 			.join("|");

// 		return `scorely:${String(game.id).toLowerCase()}:${playerKey}`;
// 	}, [game, players]);

// 	const [values, setValues] = useState<ScoreCellValue[][]>([]);
// 	const [history, setHistory] = useState<ScoreCellValue[][][]>([]);
// 	const [toasts, setToasts] = useState<ToastMessage[]>([]);
// 	const toastIdRef = useRef(0);
// 	const announcedWinnerRef = useRef("");

// 	const playerTotals = useMemo(
// 		() => players.map((_, index) => getPlayerTotal(values, index)),
// 		[players, values],
// 	);

// 	const winnerMessage = useMemo(() => {
// 		if (!game || players.length === 0) return "";

// 		if (gameId === "chicago") {
// 			for (let i = 0; i < players.length; i++) {
// 				const events = getPlayerEvents(values, i);
// 				const message = getChicagoWinnerMessage(
// 					players[i].name,
// 					playerTotals[i],
// 					events,
// 				);

// 				if (message) return message;
// 			}
// 		}

// 		return "";
// 	}, [game, gameId, players, values, playerTotals]);

// 	const isProtocolLocked = winnerMessage !== "";

// 	const showToast = (text: string) => {
// 		const id = ++toastIdRef.current;

// 		setToasts((prev) => [...prev, { id, text }]);

// 		window.setTimeout(() => {
// 			setToasts((prev) => prev.filter((toast) => toast.id !== id));
// 		}, 2600);
// 	};

// 	useEffect(() => {
// 		if (!game || !protocolEntry || players.length === 0) {
// 			setValues([]);
// 			setHistory([]);
// 			announcedWinnerRef.current = "";
// 			return;
// 		}

// 		const fallbackValues = protocolEntry.createInitialValues(
// 			players.length,
// 		);

// 		if (!storageKey) {
// 			setValues(fallbackValues);
// 			setHistory([]);
// 			announcedWinnerRef.current = "";
// 			return;
// 		}

// 		const raw = localStorage.getItem(storageKey);

// 		if (!raw) {
// 			setValues(fallbackValues);
// 			setHistory([]);
// 			announcedWinnerRef.current = "";
// 			return;
// 		}

// 		try {
// 			const parsed = JSON.parse(raw);

// 			if (
// 				Array.isArray(parsed) &&
// 				parsed.length === fallbackValues.length &&
// 				parsed.every(
// 					(row) =>
// 						Array.isArray(row) && row.length === players.length,
// 				)
// 			) {
// 				setValues(parsed);
// 				setHistory([]);
// 				announcedWinnerRef.current = "";
// 				return;
// 			}
// 		} catch {
// 			// ignore broken localStorage data
// 		}

// 		setValues(fallbackValues);
// 		setHistory([]);
// 		announcedWinnerRef.current = "";
// 	}, [game, players.length, protocolEntry, storageKey]);

// 	useEffect(() => {
// 		if (!winnerMessage) {
// 			announcedWinnerRef.current = "";
// 			return;
// 		}

// 		if (announcedWinnerRef.current === winnerMessage) {
// 			return;
// 		}

// 		announcedWinnerRef.current = winnerMessage;
// 		showToast(winnerMessage);
// 	}, [winnerMessage]);

// 	if (!game || players.length === 0) {
// 		return (
// 			<section className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.95)_0%,_rgba(219,239,226,0.96)_45%,_rgba(210,233,217,0.98)_100%)]">
// 				<div className="mx-auto max-w-[720px] px-6 py-12">
// 					<div className="rounded-[28px] bg-white/45 p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
// 						<h1 className="text-2xl font-black text-slate-900">
// 							Ingen spelomgång hittades
// 						</h1>
// 						<p className="mt-3 text-slate-500">
// 							Välj spel och spelare först.
// 						</p>

// 						<button
// 							type="button"
// 							onClick={() => navigate("/")}
// 							className="mt-6 rounded-full bg-emerald-500 px-6 py-3 font-bold text-white transition hover:bg-emerald-600"
// 						>
// 							Till startsidan
// 						</button>
// 					</div>
// 				</div>
// 			</section>
// 		);
// 	}

// 	if (!protocolEntry) {
// 		return (
// 			<section className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.95)_0%,_rgba(219,239,226,0.96)_45%,_rgba(210,233,217,0.98)_100%)]">
// 				<div className="mx-auto max-w-[720px] px-6 py-12">
// 					<div className="rounded-[28px] bg-white/45 p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
// 						<h1 className="text-2xl font-black text-slate-900">
// 							Protokoll saknas
// 						</h1>
// 						<p className="mt-3 text-slate-500">
// 							Det finns inget registrerat protokoll för{" "}
// 							{game.name} än.
// 						</p>

// 						<button
// 							type="button"
// 							onClick={() => navigate(-1)}
// 							className="mt-6 rounded-full bg-emerald-500 px-6 py-3 font-bold text-white transition hover:bg-emerald-600"
// 						>
// 							Tillbaka
// 						</button>
// 					</div>
// 				</div>
// 			</section>
// 		);
// 	}

// 	const ProtocolComponent = protocolEntry.component;

// 	const pushHistory = (snapshot: ScoreCellValue[][]) => {
// 		setHistory((prev) => [...prev.slice(-49), cloneValues(snapshot)]);
// 	};

// 	const handleCellChange = (
// 		rowIndex: number,
// 		playerIndex: number,
// 		value: ScoreCellValue,
// 	) => {
// 		if (isProtocolLocked) return;

// 		setValues((prev) => {
// 			const prevClone = cloneValues(prev);
// 			pushHistory(prevClone);

// 			return prev.map((row, currentRowIndex) => {
// 				if (currentRowIndex !== rowIndex) return row;

// 				return row.map((cell, currentPlayerIndex) =>
// 					currentPlayerIndex === playerIndex ? value : cell,
// 				);
// 			});
// 		});
// 	};

// 	const handleBatchChange = (
// 		updater: (prev: ScoreCellValue[][]) => ScoreCellValue[][],
// 	) => {
// 		if (isProtocolLocked) return;

// 		setValues((prev) => {
// 			const prevClone = cloneValues(prev);
// 			pushHistory(prevClone);
// 			return updater(cloneValues(prev));
// 		});
// 	};

// 	const handleUndo = () => {
// 		setHistory((prevHistory) => {
// 			if (prevHistory.length === 0) {
// 				return prevHistory;
// 			}

// 			const previousValues = prevHistory[prevHistory.length - 1];
// 			setValues(cloneValues(previousValues));
// 			return prevHistory.slice(0, -1);
// 		});
// 	};

// 	const handleReset = () => {
// 		const resetValues = protocolEntry.createInitialValues(players.length);

// 		if (values.length > 0) {
// 			pushHistory(values);
// 		}

// 		setValues(resetValues);

// 		if (storageKey) {
// 			localStorage.removeItem(storageKey);
// 		}
// 	};

// 	const handleSave = () => {
// 		if (!storageKey) return;

// 		localStorage.setItem(storageKey, JSON.stringify(values));
// 		showToast("Protokollet har sparats!");
// 	};

// 	return (
// 		<ScorecardLayout
// 			title={game.name}
// 			onBack={() => navigate(-1)}
// 			onUndo={handleUndo}
// 			isUndoDisabled={history.length === 0}
// 			onReset={handleReset}
// 			onSave={handleSave}
// 			isSaveDisabled={false}
// 			toasts={toasts}
// 		>
// 			<ProtocolComponent
// 				gameName={game.name}
// 				players={players}
// 				values={values}
// 				onChange={handleCellChange}
// 				onBatchChange={handleBatchChange}
// 				isLocked={isProtocolLocked}
// 			/>
// 		</ScorecardLayout>
// 	);
// }

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ScorecardLayout from "../components/scorecard/ScorecardLayout";
import { useGameSession } from "../context/GameSessionContext";
import { protocolRegistry } from "../data/protocolRegistry";
import { ProtocolService } from "../services/ProtocolService";
import type { SavedProtocol } from "../types/savedProtocol";

type ScoreCellValue = number | "";

type ToastMessage = {
	id: number;
	text: string;
};

const emptyPlayers: { name: string; scores: number[] }[] = [];

function cloneValues(values: ScoreCellValue[][]) {
	return values.map((row) => [...row]);
}

function getPlayerEvents(
	values: ScoreCellValue[][],
	playerIndex: number,
): number[] {
	return values
		.map((row) => row[playerIndex])
		.filter(
			(value): value is number =>
				value !== "" && !Number.isNaN(Number(value)),
		)
		.map(Number)
		.filter((value) => value !== 0);
}

function getPlayerTotal(values: ScoreCellValue[][], playerIndex: number) {
	return getPlayerEvents(values, playerIndex).reduce(
		(sum, value) => sum + value,
		0,
	);
}

function hasSaidChicago(events: number[]) {
	return events.includes(15) || events.includes(-15);
}

function getChicagoWinner(
	players: { name: string }[],
	values: ScoreCellValue[][],
) {
	for (let i = 0; i < players.length; i++) {
		const events = getPlayerEvents(values, i);
		const total = getPlayerTotal(values, i);

		if (total >= 52 && hasSaidChicago(events)) {
			return {
				name: players[i].name,
				message: `Grattis! ${players[i].name} har vunnit spelet, ${total} poäng.`,
			};
		}
	}

	return null;
}

function getFiveHundredWinner(
	players: { name: string }[],
	values: ScoreCellValue[][],
) {
	for (let i = 0; i < players.length; i++) {
		const total = getPlayerTotal(values, i);

		if (total >= 500) {
			return {
				name: players[i].name,
				message: `Grattis! ${players[i].name} har vunnit spelet, ${total} poäng.`,
			};
		}
	}

	return null;
}

function decodePlumpValue(value: ScoreCellValue) {
	if (value === "" || typeof value !== "number") return null;

	if (value >= 200) {
		const bid = value - 200;
		return {
			bid,
			plump: true,
			points: 0,
		};
	}

	if (value >= 100) {
		const bid = value - 100;
		return {
			bid,
			plump: false,
			points: 10 + bid,
		};
	}

	return {
		bid: 0,
		plump: false,
		points: value,
	};
}

function getPlumpWinner(
	players: { name: string }[],
	values: ScoreCellValue[][],
) {
	const allFilled = values.every((row) => row.every((cell) => cell !== ""));

	if (!allFilled) return null;

	const totals = players.map((_, playerIndex) =>
		values.reduce((sum, row) => {
			const decoded = decodePlumpValue(row[playerIndex]);
			return sum + (decoded ? decoded.points : 0);
		}, 0),
	);

	const highestScore = Math.max(...totals);
	const winnerIndices = totals
		.map((score, index) => ({ score, index }))
		.filter((item) => item.score === highestScore)
		.map((item) => item.index);

	if (winnerIndices.length === 1) {
		const winnerName = players[winnerIndices[0]].name;

		return {
			name: winnerName,
			message: `Grattis! ${winnerName} har vunnit spelet med ${highestScore} poäng.`,
		};
	}
}

export default function ScorecardPage() {
	const { session } = useGameSession();
	const navigate = useNavigate();

	const game = session?.game;
	const players = session?.players ?? emptyPlayers;

	const gameId = String(game?.id ?? "").toLowerCase();
	const protocolEntry = protocolRegistry[gameId];

	const storageKey = useMemo(() => {
		if (!game) return "";

		const playerKey = players
			.map((player) => player.name.trim().toLowerCase())
			.join("|");

		return `scorely:${String(game.id).toLowerCase()}:${playerKey}`;
	}, [game, players]);

	const protocolIdRef = useRef<string>(crypto.randomUUID());
	const createdAtRef = useRef<string>(new Date().toISOString());

	useEffect(() => {
		if (session?.protocolId) {
			protocolIdRef.current = session.protocolId;
		}

		if (session?.protocolCreatedAt) {
			createdAtRef.current = session.protocolCreatedAt;
		}
	}, [session?.protocolId, session?.protocolCreatedAt]);

	const [values, setValues] = useState<ScoreCellValue[][]>([]);
	const [history, setHistory] = useState<ScoreCellValue[][][]>([]);
	const [toasts, setToasts] = useState<ToastMessage[]>([]);
	const toastIdRef = useRef(0);
	const announcedWinnerRef = useRef("");

	// const playerTotals = useMemo(
	// 	() => players.map((_, index) => getPlayerTotal(values, index)),
	// 	[players, values],
	// );

	const winner = useMemo(() => {
		if (!game || players.length === 0) return null;

		if (gameId === "chicago") {
			return getChicagoWinner(players, values);
		}

		if (gameId === "500") {
			return getFiveHundredWinner(players, values);
		}

		if (gameId === "plump") {
			return getPlumpWinner(players, values);
		}

		return null;
	}, [game, gameId, players, values]);

	const winnerMessage = winner?.message ?? "";
	const isProtocolLocked = winnerMessage !== "";

	const showToast = (text: string) => {
		const id = ++toastIdRef.current;

		setToasts((prev) => [...prev, { id, text }]);

		window.setTimeout(() => {
			setToasts((prev) => prev.filter((toast) => toast.id !== id));
		}, 2600);
	};

	const buildSavedProtocol = (
		nextValues: ScoreCellValue[][],
		statusOverride?: "Pågående" | "Avslutad",
		winnerNameOverride?: string | null,
	): SavedProtocol | null => {
		if (!game) return null;

		const resolvedWinner =
			gameId === "chicago" ? getChicagoWinner(players, nextValues) : null;

		return {
			id: protocolIdRef.current,
			gameId: String(game.id),
			gameName: game.name,
			gameType: game.id as SavedProtocol["gameType"],
			category: game.category,
			players: players.map((player) => ({ name: player.name })),
			values: cloneValues(nextValues),
			createdAt: createdAtRef.current,
			updatedAt: new Date().toISOString(),
			status:
				statusOverride ?? (resolvedWinner ? "Avslutad" : "Pågående"),
			winnerName:
				winnerNameOverride !== undefined
					? winnerNameOverride
					: (resolvedWinner?.name ?? null),
			route: `/game/${String(game.id).toLowerCase()}`,
		};
	};

	useEffect(() => {
		if (!game || !protocolEntry || players.length === 0) {
			setValues([]);
			setHistory([]);
			announcedWinnerRef.current = "";
			return;
		}

		const fallbackValues = protocolEntry.createInitialValues(
			players.length,
		);

		if (!storageKey) {
			setValues(fallbackValues);
			setHistory([]);
			announcedWinnerRef.current = "";
			return;
		}

		const raw = localStorage.getItem(storageKey);

		if (!raw) {
			setValues(fallbackValues);
			setHistory([]);
			announcedWinnerRef.current = "";
			return;
		}

		try {
			const parsed = JSON.parse(raw);

			if (
				Array.isArray(parsed) &&
				parsed.length === fallbackValues.length &&
				parsed.every(
					(row) =>
						Array.isArray(row) && row.length === players.length,
				)
			) {
				setValues(parsed);
				setHistory([]);
				announcedWinnerRef.current = "";
				return;
			}
		} catch {
			// ignore broken localStorage data
		}

		setValues(fallbackValues);
		setHistory([]);
		announcedWinnerRef.current = "";
	}, [game, players.length, protocolEntry, storageKey]);

	useEffect(() => {
		if (!winnerMessage) {
			announcedWinnerRef.current = "";
			return;
		}

		if (announcedWinnerRef.current === winnerMessage) {
			return;
		}

		announcedWinnerRef.current = winnerMessage;
		showToast(winnerMessage);

		const protocol = buildSavedProtocol(
			values,
			"Avslutad",
			winner?.name ?? null,
		);
		if (protocol) {
			ProtocolService.save(protocol);
		}
	}, [winnerMessage, winner, values]);

	if (!game || players.length === 0) {
		return (
			<section className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.95)_0%,_rgba(219,239,226,0.96)_45%,_rgba(210,233,217,0.98)_100%)]">
				<div className="mx-auto max-w-[720px] px-6 py-12">
					<div className="rounded-[28px] bg-white/45 p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
						<h1 className="text-2xl font-black text-slate-900">
							Ingen spelomgång hittades
						</h1>
						<p className="mt-3 text-slate-500">
							Välj spel och spelare först.
						</p>

						<button
							type="button"
							onClick={() => navigate("/")}
							className="mt-6 rounded-full bg-emerald-500 px-6 py-3 font-bold text-white transition hover:bg-emerald-600"
						>
							Till startsidan
						</button>
					</div>
				</div>
			</section>
		);
	}

	if (!protocolEntry) {
		return (
			<section className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.95)_0%,_rgba(219,239,226,0.96)_45%,_rgba(210,233,217,0.98)_100%)]">
				<div className="mx-auto max-w-[720px] px-6 py-12">
					<div className="rounded-[28px] bg-white/45 p-8 text-center shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
						<h1 className="text-2xl font-black text-slate-900">
							Protokoll saknas
						</h1>
						<p className="mt-3 text-slate-500">
							Det finns inget registrerat protokoll för{" "}
							{game.name} än.
						</p>

						<button
							type="button"
							onClick={() => navigate(-1)}
							className="mt-6 rounded-full bg-emerald-500 px-6 py-3 font-bold text-white transition hover:bg-emerald-600"
						>
							Tillbaka
						</button>
					</div>
				</div>
			</section>
		);
	}

	const ProtocolComponent = protocolEntry.component;

	const pushHistory = (snapshot: ScoreCellValue[][]) => {
		setHistory((prev) => [...prev.slice(-49), cloneValues(snapshot)]);
	};

	const handleCellChange = (
		rowIndex: number,
		playerIndex: number,
		value: ScoreCellValue,
	) => {
		if (isProtocolLocked) return;

		setValues((prev) => {
			const prevClone = cloneValues(prev);
			pushHistory(prevClone);

			return prev.map((row, currentRowIndex) => {
				if (currentRowIndex !== rowIndex) return row;

				return row.map((cell, currentPlayerIndex) =>
					currentPlayerIndex === playerIndex ? value : cell,
				);
			});
		});
	};

	const handleBatchChange = (
		updater: (prev: ScoreCellValue[][]) => ScoreCellValue[][],
	) => {
		if (isProtocolLocked) return;

		setValues((prev) => {
			const prevClone = cloneValues(prev);
			pushHistory(prevClone);
			return updater(cloneValues(prev));
		});
	};

	const handleUndo = () => {
		setHistory((prevHistory) => {
			if (prevHistory.length === 0) {
				return prevHistory;
			}

			const previousValues = prevHistory[prevHistory.length - 1];
			setValues(cloneValues(previousValues));
			return prevHistory.slice(0, -1);
		});
	};

	const handleReset = () => {
		const resetValues = protocolEntry.createInitialValues(players.length);

		if (values.length > 0) {
			pushHistory(values);
		}

		setValues(resetValues);

		if (storageKey) {
			localStorage.removeItem(storageKey);
		}
	};

	const handleSave = () => {
		if (!storageKey) return;

		localStorage.setItem(storageKey, JSON.stringify(values));

		const protocol = buildSavedProtocol(values);
		if (protocol) {
			ProtocolService.save(protocol);
		}

		showToast("Protokollet har sparats!");
	};

	return (
		<ScorecardLayout
			title={game.name}
			onBack={() => navigate(-1)}
			onUndo={handleUndo}
			isUndoDisabled={history.length === 0}
			onReset={handleReset}
			onSave={handleSave}
			isSaveDisabled={false}
			toasts={toasts}
		>
			<ProtocolComponent
				gameName={game.name}
				players={players}
				values={values}
				onChange={handleCellChange}
				onBatchChange={handleBatchChange}
				isLocked={isProtocolLocked}
			/>
		</ScorecardLayout>
	);
}
