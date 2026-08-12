import type { CustomGameSession } from "../types/customProtocol";

const STORAGE_KEY = "scorely:custom-games";

const ACTIVE_GAME_KEY = "scorely:active-custom-game";

function readAll(): CustomGameSession[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);

		if (!raw) {
			return [];
		}

		const parsed: unknown = JSON.parse(raw);

		if (!Array.isArray(parsed)) {
			return [];
		}

		return parsed as CustomGameSession[];
	} catch {
		return [];
	}
}

function writeAll(games: CustomGameSession[]) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(games));
	} catch {
		// Spelet ska fortfarande fungera
		// även om localStorage är otillgängligt.
	}
}

export const CustomGameService = {
	getAll(): CustomGameSession[] {
		return readAll().sort(
			(a, b) =>
				new Date(b.updatedAt).getTime() -
				new Date(a.updatedAt).getTime(),
		);
	},

	getById(id: string): CustomGameSession | null {
		return readAll().find((game) => game.id === id) ?? null;
	},

	save(game: CustomGameSession): CustomGameSession {
		const all = readAll();

		const index = all.findIndex((item) => item.id === game.id);

		const normalized: CustomGameSession = {
			...game,

			updatedAt: new Date().toISOString(),
		};

		if (index >= 0) {
			all[index] = normalized;
		} else {
			all.unshift(normalized);
		}

		writeAll(all);

		/*
			Om matchen fortfarande pågår
			är detta den aktiva custom-matchen.
		*/
		if (!normalized.finished) {
			this.setActiveGame(normalized.id);
		} else {
			const activeId = this.getActiveGameId();

			if (activeId === normalized.id) {
				this.clearActiveGame();
			}
		}

		return normalized;
	},

	delete(id: string) {
		const activeId = this.getActiveGameId();

		if (activeId === id) {
			this.clearActiveGame();
		}

		writeAll(readAll().filter((game) => game.id !== id));
	},

	setActiveGame(id: string) {
		try {
			localStorage.setItem(ACTIVE_GAME_KEY, id);
		} catch {
			// ignore
		}
	},

	getActiveGameId(): string | null {
		try {
			return localStorage.getItem(ACTIVE_GAME_KEY);
		} catch {
			return null;
		}
	},

	getActiveGame(): CustomGameSession | null {
		const id = this.getActiveGameId();

		if (!id) {
			return null;
		}

		const game = this.getById(id);

		if (!game || game.finished) {
			this.clearActiveGame();

			return null;
		}

		return game;
	},

	clearActiveGame() {
		try {
			localStorage.removeItem(ACTIVE_GAME_KEY);
		} catch {
			// ignore
		}
	},

	hasActiveGame() {
		return this.getActiveGame() !== null;
	},
};
