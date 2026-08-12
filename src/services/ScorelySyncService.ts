import { CustomGameService } from "./CustomGameService";

import { CustomProtocolService } from "./CustomProtocolService";

import { ProtocolService } from "./ProtocolService";

import { ScorelyCloudService } from "./ScorelyCloudService";

type Syncable = {
	id: string;
	updatedAt: string;
};

function mergeByLatest<T extends Syncable>(
	localItems: T[],
	remoteItems: T[],
): T[] {
	const map = new Map<string, T>();

	for (const item of [...remoteItems, ...localItems]) {
		const existing = map.get(item.id);

		if (!existing) {
			map.set(item.id, item);

			continue;
		}

		const existingTime = new Date(existing.updatedAt).getTime();

		const itemTime = new Date(item.updatedAt).getTime();

		if (itemTime > existingTime) {
			map.set(item.id, item);
		}
	}

	return Array.from(map.values());
}

export const ScorelySyncService = {
	async syncAll() {
		const [remoteCustomProtocols, remoteCustomGames, remoteSavedProtocols] =
			await Promise.all([
				ScorelyCloudService.getCustomProtocols(),

				ScorelyCloudService.getCustomGames(),

				ScorelyCloudService.getSavedProtocols(),
			]);

		const localCustomProtocols = CustomProtocolService.getAll();

		const localCustomGames = CustomGameService.getAll();

		const localSavedProtocols = ProtocolService.getAll();

		const mergedCustomProtocols = mergeByLatest(
			localCustomProtocols,
			remoteCustomProtocols,
		);

		const mergedCustomGames = mergeByLatest(
			localCustomGames,
			remoteCustomGames,
		);

		const mergedSavedProtocols = mergeByLatest(
			localSavedProtocols,
			remoteSavedProtocols,
		);

		/*
			Write merged data locally.
		*/

		for (const protocol of mergedCustomProtocols) {
			CustomProtocolService.saveLocalOnly(protocol);
		}

		for (const game of mergedCustomGames) {
			CustomGameService.saveLocalOnly(game);
		}

		for (const protocol of mergedSavedProtocols) {
			ProtocolService.saveLocalOnly(protocol);
		}

		/*
			Write merged data to cloud.

			This is what transfers old guest/localStorage
			data into the new account.
		*/

		await Promise.all([
			...mergedCustomProtocols.map((protocol) =>
				ScorelyCloudService.saveCustomProtocol(protocol),
			),

			...mergedCustomGames.map((game) =>
				ScorelyCloudService.saveCustomGame(game),
			),

			...mergedSavedProtocols.map((protocol) =>
				ScorelyCloudService.saveSavedProtocol(protocol),
			),
		]);

		const localActiveId = CustomGameService.getActiveGameId();

		const remoteActiveId =
			await ScorelyCloudService.getActiveCustomGameId();

		const activeId = localActiveId ?? remoteActiveId;

		if (activeId) {
			CustomGameService.setActiveGameLocalOnly(activeId);

			await ScorelyCloudService.setActiveCustomGame(activeId);
		}

		return {
			customProtocols: mergedCustomProtocols.length,

			customGames: mergedCustomGames.length,

			savedProtocols: mergedSavedProtocols.length,
		};
	},
};
