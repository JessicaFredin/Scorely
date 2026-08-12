import type { CustomGameSession } from "../types/customProtocol";

import { ScorelyCloudService } from "./ScorelyCloudService";

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
		/*
			Spelet ska fortfarande fungera
			även om localStorage är
			otillgängligt.
		*/
	}
}

/*
	Local-only save.

	Används av både vanlig save()
	och ScorelySyncService.

	Den ska INTE:
	- synka till Supabase
	- ändra active game
*/
function saveLocalOnlyInternal(game: CustomGameSession): CustomGameSession {
	const all = readAll();

	const index = all.findIndex((item) => item.id === game.id);

	if (index >= 0) {
		all[index] = game;
	} else {
		all.unshift(game);
	}

	writeAll(all);

	return game;
}

function setActiveGameLocal(id: string) {
	try {
		localStorage.setItem(ACTIVE_GAME_KEY, id);
	} catch {
		// ignore
	}
}

function clearActiveGameLocal() {
	try {
		localStorage.removeItem(ACTIVE_GAME_KEY);
	} catch {
		// ignore
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

	/*
		=====================================================
		SAVE GAME
		=====================================================

		Local först.
		Supabase efteråt.
	*/

	save(game: CustomGameSession): CustomGameSession {
		const normalized: CustomGameSession = {
			...game,

			updatedAt: new Date().toISOString(),
		};

		const saved = saveLocalOnlyInternal(normalized);

		/*
			Spara matchen i Supabase.
		*/

		void ScorelyCloudService.saveCustomGame(saved).catch(() => {
			/*
					LocalStorage-versionen är
					redan sparad.
				*/
		});

		/*
			Om matchen fortfarande pågår
			är den aktiv.
		*/

		if (!saved.finished) {
			this.setActiveGame(saved.id);
		} else {
			const activeId = this.getActiveGameId();

			if (activeId === saved.id) {
				this.clearActiveGame();
			}
		}

		return saved;
	},

	/*
		Används ENDAST av sync-service.

		Den sparar exakt värdet den får,
		inklusive updatedAt från cloud.
	*/

	saveLocalOnly(game: CustomGameSession): CustomGameSession {
		return saveLocalOnlyInternal(game);
	},

	/*
		=====================================================
		DELETE GAME
		=====================================================
	*/

	delete(id: string): void {
		const activeId = this.getActiveGameId();

		if (activeId === id) {
			this.clearActiveGame();
		}

		writeAll(readAll().filter((game) => game.id !== id));

		void ScorelyCloudService.deleteCustomGame(id).catch(() => {});
	},

	/*
		=====================================================
		ACTIVE GAME
		=====================================================
	*/

	setActiveGame(id: string): void {
		setActiveGameLocal(id);

		void ScorelyCloudService.setActiveCustomGame(id).catch(() => {});
	},

	/*
		Används av ScorelySyncService.

		Skriver bara localStorage.
	*/

	setActiveGameLocalOnly(id: string): void {
		setActiveGameLocal(id);
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

		/*
			Om matchen inte finns längre
			eller redan är färdig ska den
			inte ligga kvar som aktiv.
		*/

		if (!game || game.finished) {
			this.clearActiveGame();

			return null;
		}

		return game;
	},

	clearActiveGame(): void {
		clearActiveGameLocal();

		void ScorelyCloudService.setActiveCustomGame(null).catch(() => {});
	},

	/*
		Praktiskt om sync/logout behöver
		rensa bara localStorage utan ett
		nytt cloud-anrop.
	*/

	clearActiveGameLocalOnly(): void {
		clearActiveGameLocal();
	},

	hasActiveGame(): boolean {
		return this.getActiveGame() !== null;
	},

	/*
		=====================================================
		CLEAR ALL MATCHES
		=====================================================
	*/

	clearAll(): void {
		const games = readAll();

		localStorage.removeItem(STORAGE_KEY);

		clearActiveGameLocal();

		for (const game of games) {
			void ScorelyCloudService.deleteCustomGame(game.id).catch(() => {});
		}

		void ScorelyCloudService.setActiveCustomGame(null).catch(() => {});
	},
};
