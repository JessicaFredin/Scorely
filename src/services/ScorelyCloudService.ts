import { supabase } from "../lib/supabase";

import type {
	CustomGameSession,
	CustomProtocolDefinition,
} from "../types/customProtocol";

import type { SavedProtocol } from "../types/savedProtocol";

type CloudRow<T> = {
	id: string;
	user_id: string;
	data: T;
	created_at: string;
	updated_at: string;
};

async function getCurrentUserId() {
	const { data } = await supabase.auth.getUser();

	return data.user?.id ?? null;
}

export const ScorelyCloudService = {
	async getCustomProtocols(): Promise<CustomProtocolDefinition[]> {
		const userId = await getCurrentUserId();

		if (!userId) {
			return [];
		}

		const { data, error } = await supabase
			.from("scorely_custom_protocols")
			.select("*");

		if (error) {
			throw error;
		}

		return ((data ?? []) as CloudRow<CustomProtocolDefinition>[]).map(
			(row) => row.data,
		);
	},

	async saveCustomProtocol(protocol: CustomProtocolDefinition) {
		const userId = await getCurrentUserId();

		if (!userId) {
			return;
		}

		const { error } = await supabase
			.from("scorely_custom_protocols")
			.upsert(
				{
					id: protocol.id,

					user_id: userId,

					data: protocol,

					created_at: protocol.createdAt,

					updated_at: protocol.updatedAt,
				},

				{
					onConflict: "id",
				},
			);

		if (error) {
			throw error;
		}
	},

	async deleteCustomProtocol(id: string) {
		const { error } = await supabase
			.from("scorely_custom_protocols")
			.delete()
			.eq("id", id);

		if (error) {
			throw error;
		}
	},

	async getCustomGames(): Promise<CustomGameSession[]> {
		const userId = await getCurrentUserId();

		if (!userId) {
			return [];
		}

		const { data, error } = await supabase
			.from("scorely_custom_games")
			.select("*");

		if (error) {
			throw error;
		}

		return ((data ?? []) as CloudRow<CustomGameSession>[]).map(
			(row) => row.data,
		);
	},

	async saveCustomGame(game: CustomGameSession) {
		const userId = await getCurrentUserId();

		if (!userId) {
			return;
		}

		const { error } = await supabase.from("scorely_custom_games").upsert(
			{
				id: game.id,

				user_id: userId,

				data: game,

				created_at: game.createdAt,

				updated_at: game.updatedAt,
			},

			{
				onConflict: "id",
			},
		);

		if (error) {
			throw error;
		}
	},

	async deleteCustomGame(id: string) {
		const { error } = await supabase
			.from("scorely_custom_games")
			.delete()
			.eq("id", id);

		if (error) {
			throw error;
		}
	},

	async getSavedProtocols(): Promise<SavedProtocol[]> {
		const userId = await getCurrentUserId();

		if (!userId) {
			return [];
		}

		const { data, error } = await supabase
			.from("scorely_saved_protocols")
			.select("*");

		if (error) {
			throw error;
		}

		return ((data ?? []) as CloudRow<SavedProtocol>[]).map(
			(row) => row.data,
		);
	},

	async saveSavedProtocol(protocol: SavedProtocol) {
		const userId = await getCurrentUserId();

		if (!userId) {
			return;
		}

		const { error } = await supabase.from("scorely_saved_protocols").upsert(
			{
				id: protocol.id,

				user_id: userId,

				data: protocol,

				created_at: protocol.createdAt,

				updated_at: protocol.updatedAt,
			},

			{
				onConflict: "id",
			},
		);

		if (error) {
			throw error;
		}
	},

	async deleteSavedProtocol(id: string) {
		const { error } = await supabase
			.from("scorely_saved_protocols")
			.delete()
			.eq("id", id);

		if (error) {
			throw error;
		}
	},

	async setActiveCustomGame(gameId: string | null) {
		const userId = await getCurrentUserId();

		if (!userId) {
			return;
		}

		const { error } = await supabase.from("scorely_user_state").upsert(
			{
				user_id: userId,

				active_custom_game_id: gameId,

				updated_at: new Date().toISOString(),
			},

			{
				onConflict: "user_id",
			},
		);

		if (error) {
			throw error;
		}
	},

	async getActiveCustomGameId(): Promise<string | null> {
		const userId = await getCurrentUserId();

		if (!userId) {
			return null;
		}

		const { data, error } = await supabase
			.from("scorely_user_state")
			.select("active_custom_game_id")
			.eq("user_id", userId)
			.maybeSingle();

		if (error) {
			throw error;
		}

		return data?.active_custom_game_id ?? null;
	},
};
