import type { SavedProtocol } from "../types/savedProtocol";

import { ScorelyCloudService } from "./ScorelyCloudService";

const STORAGE_KEY = "savedProtocols";

function isSavedProtocol(value: unknown): value is SavedProtocol {
	if (typeof value !== "object" || value === null) {
		return false;
	}

	const candidate = value as Record<string, unknown>;

	return (
		typeof candidate.id === "string" &&
		typeof candidate.gameId === "string" &&
		typeof candidate.gameName === "string" &&
		typeof candidate.gameType === "string" &&
		Array.isArray(candidate.players) &&
		Array.isArray(candidate.values) &&
		typeof candidate.createdAt === "string" &&
		typeof candidate.updatedAt === "string" &&
		(candidate.status === "Pågående" || candidate.status === "Avslutad") &&
		(typeof candidate.winnerName === "string" ||
			candidate.winnerName === null) &&
		typeof candidate.route === "string"
	);
}

function readAll(): SavedProtocol[] {
	const raw = localStorage.getItem(STORAGE_KEY);

	if (!raw) {
		return [];
	}

	try {
		const parsed: unknown = JSON.parse(raw);

		if (!Array.isArray(parsed)) {
			return [];
		}

		return parsed.filter(isSavedProtocol);
	} catch {
		return [];
	}
}

function writeAll(protocols: SavedProtocol[]) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(protocols));
	} catch {
		/*
			Om localStorage inte går
			att använda ska Scorely
			inte krascha.
		*/
	}
}

/*
	Används både av vanlig save()
	och ScorelySyncService.

	INGET cloud-anrop här.
*/
function saveLocalOnlyInternal(protocol: SavedProtocol): SavedProtocol {
	const all = readAll();

	const existingIndex = all.findIndex(
		(existingProtocol) => existingProtocol.id === protocol.id,
	);

	if (existingIndex >= 0) {
		all[existingIndex] = protocol;
	} else {
		all.unshift(protocol);
	}

	writeAll(all);

	return protocol;
}

export const ProtocolService = {
	getAll(): SavedProtocol[] {
		return readAll().sort(
			(a, b) =>
				new Date(b.updatedAt).getTime() -
				new Date(a.updatedAt).getTime(),
		);
	},

	getById(id: string): SavedProtocol | null {
		return readAll().find((protocol) => protocol.id === id) ?? null;
	},

	/*
		=====================================================
		SAVE
		=====================================================

		Spara lokalt först.
		Supabase därefter.
	*/

	save(protocol: SavedProtocol): SavedProtocol {
		const saved = saveLocalOnlyInternal(protocol);

		void ScorelyCloudService.saveSavedProtocol(saved).catch(() => {
			/*
					Local save finns kvar.
					Cloud kan synkas senare.
				*/
		});

		return saved;
	},

	/*
		Används av ScorelySyncService
		för att skriva cloud-data till
		localStorage utan en ny cloud-save.
	*/

	saveLocalOnly(protocol: SavedProtocol): SavedProtocol {
		return saveLocalOnlyInternal(protocol);
	},

	/*
		=====================================================
		DELETE
		=====================================================
	*/

	delete(id: string): void {
		const updated = readAll().filter((protocol) => protocol.id !== id);

		writeAll(updated);

		void ScorelyCloudService.deleteSavedProtocol(id).catch(() => {});
	},

	/*
		=====================================================
		CLEAR ALL
		=====================================================
	*/

	clearAll(): void {
		const protocols = readAll();

		localStorage.removeItem(STORAGE_KEY);

		for (const protocol of protocols) {
			void ScorelyCloudService.deleteSavedProtocol(protocol.id).catch(
				() => {},
			);
		}
	},
};
