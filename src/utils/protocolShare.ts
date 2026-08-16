import {
	compressToEncodedURIComponent,
	decompressFromEncodedURIComponent,
} from "lz-string";

import type { ScoreCellValue } from "../data/protocolRegistry";
import type { CustomGameSession } from "../types/customProtocol";

export type RegularSharePayload = {
	version: 1;
	type: "regular";

	gameId: string;

	players: {
		name: string;
	}[];

	values: ScoreCellValue[][];
};

export type CustomSharePayload = {
	version: 1;
	type: "custom";

	game: CustomGameSession;
};

export type ScorelySharePayload = RegularSharePayload | CustomSharePayload;

function createShareUrl(payload: ScorelySharePayload) {
	const json = JSON.stringify(payload);

	const encoded = compressToEncodedURIComponent(json);

	return `${window.location.origin}/share#${encoded}`;
}

export function createRegularShareUrl({
	gameId,
	players,
	values,
}: {
	gameId: string;

	players: {
		name: string;
	}[];

	values: ScoreCellValue[][];
}) {
	return createShareUrl({
		version: 1,

		type: "regular",

		gameId,

		players,

		values,
	});
}

export function createCustomShareUrl(game: CustomGameSession) {
	return createShareUrl({
		version: 1,

		type: "custom",

		game,
	});
}

export function readSharePayload(): ScorelySharePayload | null {
	try {
		const encoded = window.location.hash.slice(1);

		if (!encoded) {
			return null;
		}

		const json = decompressFromEncodedURIComponent(encoded);

		if (!json) {
			return null;
		}

		const parsed: unknown = JSON.parse(json);

		if (typeof parsed !== "object" || parsed === null) {
			return null;
		}

		const candidate = parsed as Partial<ScorelySharePayload>;

		if (candidate.version !== 1) {
			return null;
		}

		if (candidate.type !== "regular" && candidate.type !== "custom") {
			return null;
		}

		return candidate as ScorelySharePayload;
	} catch {
		return null;
	}
}
