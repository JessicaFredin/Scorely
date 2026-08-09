import type { Game } from "../types/game";
import type { Player } from "../types/player";

export type StoredScoreValue = number | "";

export function getGameStorageKey(game: Game, players: Player[]) {
	const playerKey = players
		.map((player) => player.name.trim().toLowerCase())
		.join("|");

	return `scorely:${String(game.id).toLowerCase()}:${playerKey}`;
}

export function readGameValues(
	game: Game,
	players: Player[],
): StoredScoreValue[][] | null {
	try {
		const raw = localStorage.getItem(getGameStorageKey(game, players));

		if (!raw) return null;

		const parsed: unknown = JSON.parse(raw);

		if (!Array.isArray(parsed)) {
			return null;
		}

		return parsed as StoredScoreValue[][];
	} catch {
		return null;
	}
}

export function removeGameValues(game: Game, players: Player[]) {
	try {
		localStorage.removeItem(getGameStorageKey(game, players));
	} catch {
		// Ignorera storage-fel.
	}
}
