import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import ScorecardLayout from "../components/scorecard/ScorecardLayout";
import { useGameSession } from "../context/GameSessionContext";
import { protocolRegistry } from "../data/protocolRegistry";
import { ProtocolService } from "../services/ProtocolService";

import type { SavedProtocol } from "../types/savedProtocol";

import { getGameStorageKey } from "../utils/gameStorage";

type ScoreCellValue = number | "";

type ToastMessage = {
	id: number;
	text: string;
};

const emptyPlayers: {
	name: string;
	scores: number[];
}[] = [];

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

/* =========================================================
   CHICAGO
========================================================= */

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

/* =========================================================
   500
========================================================= */

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

/* =========================================================
   PLUMP
========================================================= */

function decodePlumpValue(value: ScoreCellValue) {
	if (value === "" || typeof value !== "number") {
		return null;
	}

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

	if (!allFilled) {
		return null;
	}

	const totals = players.map((_, playerIndex) =>
		values.reduce((sum, row) => {
			const decoded = decodePlumpValue(row[playerIndex]);

			return sum + (decoded ? decoded.points : 0);
		}, 0),
	);

	const highestScore = Math.max(...totals);

	const winnerIndices = totals
		.map((score, index) => ({
			score,
			index,
		}))
		.filter((item) => item.score === highestScore)
		.map((item) => item.index);

	if (winnerIndices.length === 1) {
		const winnerName = players[winnerIndices[0]].name;

		return {
			name: winnerName,
			message: `Grattis! ${winnerName} har vunnit spelet med ${highestScore} poäng.`,
		};
	}

	return null;
}

/* =========================================================
   LOWEST SCORE WINS
   Golf / Discgolf
========================================================= */

function getLowestScoreWinner(
	players: { name: string }[],
	values: ScoreCellValue[][],
) {
	if (players.length === 0) {
		return null;
	}

	if (values.length === 0) {
		return null;
	}

	const allFilled = values.every((row) => row.every((cell) => cell !== ""));

	if (!allFilled) {
		return null;
	}

	const totals = players.map((_, playerIndex) =>
		values.reduce((sum, row) => {
			const value = row[playerIndex];

			return sum + (typeof value === "number" ? value : 0);
		}, 0),
	);

	const lowestScore = Math.min(...totals);

	const winnerIndices = totals
		.map((score, index) => ({
			score,
			index,
		}))
		.filter((item) => item.score === lowestScore)
		.map((item) => item.index);

	if (winnerIndices.length === 1) {
		const winnerName = players[winnerIndices[0]].name;

		return {
			name: winnerName,
			message: `Grattis! ${winnerName} har vunnit spelet med ${lowestScore} poäng.`,
		};
	}

	const tiedNames = winnerIndices
		.map((index) => players[index].name)
		.join(", ");

	return {
		name: tiedNames,
		message: `Oavgjort! ${tiedNames} vann med ${lowestScore} poäng.`,
	};
}

/* =========================================================
   WHIST
========================================================= */

function getWhistWinner(
	players: { name: string }[],
	values: ScoreCellValue[][],
) {
	if (players.length !== 2 && players.length !== 4) {
		return null;
	}

	const sides =
		players.length === 4
			? [
					[0, 2],
					[1, 3],
				]
			: [[0], [1]];

	const totals = sides.map((side) => {
		const playerIndex = side[0];

		return values.reduce((sum, row) => {
			const value = row[playerIndex];

			return sum + (typeof value === "number" ? value : 0);
		}, 0);
	});

	const winnerSide = totals.findIndex((total) => total >= 13);

	if (winnerSide === -1) {
		return null;
	}

	const winnerName = sides[winnerSide]
		.map((index) => players[index].name)
		.join(" & ");

	return {
		name: winnerName,
		message: `Grattis! ${winnerName} har vunnit whisten med ${totals[winnerSide]} poäng.`,
	};
}

/* =========================================================
   HIGHEST SCORE WINS
   Jazz / Gigant Yatzy
========================================================= */

function getHighestScoreWinner(
	players: { name: string }[],
	values: ScoreCellValue[][],
) {
	if (players.length === 0) {
		return null;
	}

	if (values.length === 0) {
		return null;
	}

	const allFilled = values.every((row) => row.every((cell) => cell !== ""));

	if (!allFilled) {
		return null;
	}

	const totals = players.map((_, playerIndex) =>
		values.reduce((sum, row) => {
			const value = row[playerIndex];

			return sum + (typeof value === "number" ? value : 0);
		}, 0),
	);

	const highestScore = Math.max(...totals);

	const winnerIndices = totals
		.map((score, index) => ({
			score,
			index,
		}))
		.filter((item) => item.score === highestScore)
		.map((item) => item.index);

	if (winnerIndices.length === 1) {
		const winnerName = players[winnerIndices[0]].name;

		return {
			name: winnerName,
			message: `Grattis! ${winnerName} har vunnit spelet med ${highestScore} poäng.`,
		};
	}

	const tiedNames = winnerIndices
		.map((index) => players[index].name)
		.join(", ");

	return {
		name: tiedNames,
		message: `Oavgjort! ${tiedNames} vann med ${highestScore} poäng.`,
	};
}

/* =========================================================
   TREBELLER
========================================================= */

function getTrebellerWinner(
	players: { name: string }[],
	values: ScoreCellValue[][],
) {
	const completedRounds = values.filter((row) =>
		row.every((cell) => cell !== ""),
	);

	if (completedRounds.length < 18) {
		return null;
	}

	const totals = players.map((_, playerIndex) =>
		completedRounds.reduce((sum, row) => {
			const value = row[playerIndex];

			if (typeof value !== "number") {
				return sum;
			}

			const score = (value % 100) - 50;

			return sum + score;
		}, 0),
	);

	const highestScore = Math.max(...totals);

	const winnerIndices = totals
		.map((score, index) => ({
			score,
			index,
		}))
		.filter((item) => item.score === highestScore)
		.map((item) => item.index);

	if (winnerIndices.length === 1) {
		const winnerName = players[winnerIndices[0]].name;

		return {
			name: winnerName,
			message: `Grattis! ${winnerName} har vunnit spelet med ${
				highestScore > 0 ? `+${highestScore}` : highestScore
			} poäng.`,
		};
	}

	return {
		name: null,
		message: `Spelet slutade oavgjort på ${
			highestScore > 0 ? `+${highestScore}` : highestScore
		} poäng.`,
	};
}

/* =========================================================
   YATZY
========================================================= */

function getYatzyWinner(
	players: { name: string }[],
	values: ScoreCellValue[][],
) {
	if (players.length === 0) {
		return null;
	}

	if (values.length === 0) {
		return null;
	}

	const allFilled = values.every((row) => row.every((cell) => cell !== ""));

	if (!allFilled) {
		return null;
	}

	const getUpperSum = (playerIndex: number) =>
		[0, 1, 2, 3, 4, 5].reduce((sum, rowIndex) => {
			const value = values[rowIndex]?.[playerIndex];

			return sum + (typeof value === "number" ? value : 0);
		}, 0);

	const getBonus = (playerIndex: number) =>
		getUpperSum(playerIndex) >= 63 ? 50 : 0;

	const totals = players.map((_, playerIndex) => {
		const rowsTotal = values.reduce((sum, row, rowIndex) => {
			if (rowIndex === 6) {
				return sum;
			}

			const value = row[playerIndex];

			return sum + (typeof value === "number" ? value : 0);
		}, 0);

		return rowsTotal + getBonus(playerIndex);
	});

	const highestScore = Math.max(...totals);

	const winnerIndices = totals
		.map((score, index) => ({
			score,
			index,
		}))
		.filter((item) => item.score === highestScore)
		.map((item) => item.index);

	if (winnerIndices.length === 1) {
		const winnerName = players[winnerIndices[0]].name;

		return {
			name: winnerName,
			message: `Grattis! ${winnerName} har vunnit spelet med ${highestScore} poäng.`,
		};
	}

	const tiedNames = winnerIndices
		.map((index) => players[index].name)
		.join(", ");

	return {
		name: tiedNames,
		message: `Oavgjort! ${tiedNames} vann med ${highestScore} poäng.`,
	};
}

/* =========================================================
   10 000
========================================================= */

function getTenThousandWinner(
	players: { name: string }[],
	values: ScoreCellValue[][],
) {
	if (players.length === 0 || values.length === 0) {
		return null;
	}

	const totals = players.map((_, playerIndex) =>
		values.reduce((sum, row) => {
			const value = row[playerIndex];

			return sum + (typeof value === "number" ? value : 0);
		}, 0),
	);

	const highestScore = Math.max(...totals);

	if (highestScore < 10000) {
		return null;
	}

	const winnerIndices = totals
		.map((score, index) => ({
			score,
			index,
		}))
		.filter((item) => item.score === highestScore)
		.map((item) => item.index);

	if (winnerIndices.length === 1) {
		const winnerName = players[winnerIndices[0]].name;

		return {
			name: winnerName,
			message: `Grattis! ${winnerName} har vunnit spelet med ${highestScore} poäng.`,
		};
	}

	const tiedNames = winnerIndices
		.map((index) => players[index].name)
		.join(", ");

	return {
		name: tiedNames,
		message: `Oavgjort! ${tiedNames} vann med ${highestScore} poäng.`,
	};
}

/* =========================================================
   PAGE
========================================================= */

export default function ScorecardPage() {
	const { session, setSession } = useGameSession();

	const navigate = useNavigate();

	const game = session?.game;

	const players = session?.players ?? emptyPlayers;

	const gameId = String(game?.id ?? "").toLowerCase();

	const protocolEntry = protocolRegistry[gameId];

	/* =====================================================
	   STORAGE KEY
	===================================================== */

	const storageKey = useMemo(() => {
		if (!game || players.length === 0) {
			return "";
		}

		return getGameStorageKey(game, players);
	}, [game, players]);

	/* =====================================================
	   PROTOCOL IDENTIFIERS
	===================================================== */

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

	/*
		If this session doesn't yet have a
		protocolId, save the generated ID
		into GameSessionContext.

		This means a reload keeps using
		the same saved protocol.
	*/

	useEffect(() => {
		if (!session || !game || players.length === 0) {
			return;
		}

		if (session.protocolId && session.protocolCreatedAt) {
			return;
		}

		setSession({
			...session,

			protocolId: session.protocolId ?? protocolIdRef.current,

			protocolCreatedAt:
				session.protocolCreatedAt ?? createdAtRef.current,
		});
	}, [game, players.length, session, setSession]);

	/* =====================================================
	   STATE
	===================================================== */

	const [values, setValues] = useState<ScoreCellValue[][]>([]);

	const [history, setHistory] = useState<ScoreCellValue[][][]>([]);

	const [toasts, setToasts] = useState<ToastMessage[]>([]);

	const toastIdRef = useRef(0);

	const announcedWinnerRef = useRef("");

	const hasLoadedInitialValuesRef = useRef(false);

	const hasUserMadeChangeRef = useRef(false);

	/* =====================================================
	   WINNER
	===================================================== */

	const winner = useMemo(() => {
		if (!game || players.length === 0) {
			return null;
		}

		if (gameId === "chicago") {
			return getChicagoWinner(players, values);
		}

		if (gameId === "500") {
			return getFiveHundredWinner(players, values);
		}

		if (gameId === "plump") {
			return getPlumpWinner(players, values);
		}

		if (gameId === "golf" || gameId === "discgolf") {
			return getLowestScoreWinner(players, values);
		}

		if (gameId === "jazz") {
			return getHighestScoreWinner(players, values);
		}

		if (gameId === "trebeller") {
			return getTrebellerWinner(players, values);
		}

		if (gameId === "yatzy") {
			return getYatzyWinner(players, values);
		}

		if (gameId === "gigant-yatzy") {
			return getHighestScoreWinner(players, values);
		}

		if (gameId === "10000") {
			return getTenThousandWinner(players, values);
		}

		if (gameId === "4-manswhist" || gameId === "2-manswhist") {
			return getWhistWinner(players, values);
		}

		return null;
	}, [game, gameId, players, values]);

	const winnerMessage = winner?.message ?? "";

	const isProtocolLocked = winnerMessage !== "";

	/* =====================================================
	   TOAST
	===================================================== */

	const showToast = (text: string) => {
		const id = ++toastIdRef.current;

		setToasts((prev) => [
			...prev,
			{
				id,
				text,
			},
		]);

		window.setTimeout(() => {
			setToasts((prev) => prev.filter((toast) => toast.id !== id));
		}, 2600);
	};

	/* =====================================================
	   BUILD SAVED PROTOCOL
	===================================================== */

	const buildSavedProtocol = useCallback(
		(
			nextValues: ScoreCellValue[][],

			statusOverride?: "Pågående" | "Avslutad",

			winnerNameOverride?: string | null,
		): SavedProtocol | null => {
			if (!game) {
				return null;
			}

			let resolvedWinner:
				| ReturnType<typeof getChicagoWinner>
				| ReturnType<typeof getFiveHundredWinner>
				| ReturnType<typeof getPlumpWinner>
				| ReturnType<typeof getLowestScoreWinner>
				| ReturnType<typeof getHighestScoreWinner>
				| ReturnType<typeof getTrebellerWinner>
				| ReturnType<typeof getYatzyWinner>
				| ReturnType<typeof getTenThousandWinner>
				| ReturnType<typeof getWhistWinner>
				| null = null;

			if (gameId === "chicago") {
				resolvedWinner = getChicagoWinner(players, nextValues);
			} else if (gameId === "500") {
				resolvedWinner = getFiveHundredWinner(players, nextValues);
			} else if (gameId === "plump") {
				resolvedWinner = getPlumpWinner(players, nextValues);
			} else if (gameId === "golf" || gameId === "discgolf") {
				resolvedWinner = getLowestScoreWinner(players, nextValues);
			} else if (gameId === "jazz") {
				resolvedWinner = getHighestScoreWinner(players, nextValues);
			} else if (gameId === "trebeller") {
				resolvedWinner = getTrebellerWinner(players, nextValues);
			} else if (gameId === "yatzy") {
				resolvedWinner = getYatzyWinner(players, nextValues);
			} else if (gameId === "gigant-yatzy") {
				resolvedWinner = getHighestScoreWinner(players, nextValues);
			} else if (gameId === "10000") {
				resolvedWinner = getTenThousandWinner(players, nextValues);
			} else if (gameId === "4-manswhist" || gameId === "2-manswhist") {
				resolvedWinner = getWhistWinner(players, nextValues);
			}

			return {
				id: protocolIdRef.current,

				gameId: String(game.id),

				gameName: game.name,

				gameType: game.id as SavedProtocol["gameType"],

				category: game.category,

				players: players.map((player) => ({
					name: player.name,
				})),

				values: cloneValues(nextValues),

				createdAt: createdAtRef.current,

				updatedAt: new Date().toISOString(),

				status:
					statusOverride ??
					(resolvedWinner ? "Avslutad" : "Pågående"),

				winnerName:
					winnerNameOverride !== undefined
						? winnerNameOverride
						: (resolvedWinner?.name ?? null),

				route: `/game/${String(game.id).toLowerCase()}`,
			};
		},
		[game, gameId, players],
	);

	/* =====================================================
	   LOAD INITIAL VALUES / RESTORE AUTOSAVE
	===================================================== */

	useEffect(() => {
		hasLoadedInitialValuesRef.current = false;

		if (!game || !protocolEntry || players.length === 0) {
			setValues([]);
			setHistory([]);

			announcedWinnerRef.current = "";

			hasLoadedInitialValuesRef.current = true;

			hasUserMadeChangeRef.current = false;

			return;
		}

		const fallbackValues = protocolEntry.createInitialValues(
			players.length,
		);

		if (!storageKey) {
			setValues(fallbackValues);

			setHistory([]);

			announcedWinnerRef.current = "";

			hasLoadedInitialValuesRef.current = true;

			hasUserMadeChangeRef.current = false;

			return;
		}

		const raw = localStorage.getItem(storageKey);

		if (!raw) {
			setValues(fallbackValues);

			setHistory([]);

			announcedWinnerRef.current = "";

			hasLoadedInitialValuesRef.current = true;

			hasUserMadeChangeRef.current = false;

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

				hasLoadedInitialValuesRef.current = true;

				hasUserMadeChangeRef.current = false;

				return;
			}
		} catch {
			/*
				Broken localStorage data.
				Scorely simply falls back
				to a fresh protocol.
			*/
		}

		setValues(fallbackValues);

		setHistory([]);

		announcedWinnerRef.current = "";

		hasLoadedInitialValuesRef.current = true;

		hasUserMadeChangeRef.current = false;
	}, [game, players.length, protocolEntry, storageKey]);

	/* =====================================================
	   AUTOSAVE

	   Runs whenever values changes.

	   This is NOT the same thing as
	   pressing "Spara".

	   Autosave protects the currently
	   active game against reload.
	===================================================== */

	useEffect(() => {
		if (!hasLoadedInitialValuesRef.current) {
			return;
		}

		if (!storageKey || values.length === 0) {
			return;
		}

		try {
			localStorage.setItem(storageKey, JSON.stringify(values));
		} catch {
			/*
				If localStorage is unavailable,
				the game should still work.
			*/
		}
	}, [storageKey, values]);

	/* =====================================================
	   ACTIVE / FINISHED SESSION STATUS

	   This is what prevents a completed
	   game from appearing as "Pågående spel"
	   on Home.
	===================================================== */

	useEffect(() => {
		if (!session || players.length === 0) {
			return;
		}

		const nextStatus = winnerMessage ? "finished" : "active";

		if (session.status === nextStatus) {
			return;
		}

		setSession({
			...session,
			status: nextStatus,
		});
	}, [players.length, session, setSession, winnerMessage]);

	/* =====================================================
	   WINNER ANNOUNCEMENT + AUTO SAVE FINISHED PROTOCOL
	===================================================== */

	useEffect(() => {
		if (!winnerMessage) {
			announcedWinnerRef.current = "";

			return;
		}

		if (!hasLoadedInitialValuesRef.current) {
			return;
		}

		if (announcedWinnerRef.current === winnerMessage) {
			return;
		}

		announcedWinnerRef.current = winnerMessage;

		showToast(winnerMessage);

		/*
			Don't automatically create a
			SavedProtocol simply because an
			old finished game was restored
			from localStorage.

			Only save automatically if this
			game was actually changed during
			this session.
		*/

		if (!hasUserMadeChangeRef.current) {
			return;
		}

		const protocol = buildSavedProtocol(
			values,
			"Avslutad",
			winner?.name ?? null,
		);

		if (protocol) {
			ProtocolService.save(protocol);
		}
	}, [buildSavedProtocol, winnerMessage, winner, values]);

	/* =====================================================
	   NO SESSION
	===================================================== */

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

	/* =====================================================
	   MISSING PROTOCOL
	===================================================== */

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

	/* =====================================================
	   HISTORY
	===================================================== */

	const pushHistory = (snapshot: ScoreCellValue[][]) => {
		setHistory((prev) => [...prev.slice(-49), cloneValues(snapshot)]);
	};

	/* =====================================================
	   CELL CHANGE
	===================================================== */

	const handleCellChange = (
		rowIndex: number,
		playerIndex: number,
		value: ScoreCellValue,
	) => {
		if (isProtocolLocked) {
			return;
		}

		hasUserMadeChangeRef.current = true;

		setValues((prev) => {
			const prevClone = cloneValues(prev);

			pushHistory(prevClone);

			return prev.map((row, currentRowIndex) => {
				if (currentRowIndex !== rowIndex) {
					return row;
				}

				return row.map((cell, currentPlayerIndex) =>
					currentPlayerIndex === playerIndex ? value : cell,
				);
			});
		});
	};

	/* =====================================================
	   BATCH CHANGE
	===================================================== */

	const handleBatchChange = (
		updater: (prev: ScoreCellValue[][]) => ScoreCellValue[][],
	) => {
		if (isProtocolLocked) {
			return;
		}

		hasUserMadeChangeRef.current = true;

		setValues((prev) => {
			const prevClone = cloneValues(prev);

			pushHistory(prevClone);

			return updater(cloneValues(prev));
		});
	};

	/* =====================================================
	   UNDO
	===================================================== */

	const handleUndo = () => {
		setHistory((prevHistory) => {
			if (prevHistory.length === 0) {
				return prevHistory;
			}

			hasUserMadeChangeRef.current = true;

			const previousValues = prevHistory[prevHistory.length - 1];

			setValues(cloneValues(previousValues));

			return prevHistory.slice(0, -1);
		});
	};

	/* =====================================================
	   RESET
	===================================================== */

	const handleReset = () => {
		const resetValues = protocolEntry.createInitialValues(players.length);

		hasUserMadeChangeRef.current = true;

		if (values.length > 0) {
			pushHistory(values);
		}

		setValues(resetValues);

		/*
			Remove the existing autosave.

			The autosave effect will then
			store the newly reset empty
			values as the current state.
		*/

		if (storageKey) {
			try {
				localStorage.removeItem(storageKey);
			} catch {
				// Ignore storage error.
			}
		}
	};

	/* =====================================================
	   MANUAL SAVE

	   This is different from autosave.

	   Autosave:
	   protects the active game.

	   Manual save:
	   adds/updates it under
	   "Sparade protokoll".
	===================================================== */

	const handleSave = () => {
		if (!storageKey) {
			return;
		}

		try {
			localStorage.setItem(storageKey, JSON.stringify(values));
		} catch {
			// Game still works.
		}

		const protocol = buildSavedProtocol(values);

		if (protocol) {
			ProtocolService.save(protocol);
		}

		showToast("Protokollet har sparats!");
	};

	/* =====================================================
	   RENDER
	===================================================== */

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
