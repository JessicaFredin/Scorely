import type { CustomProtocolDefinition } from "../types/customProtocol";

const STORAGE_KEY = "scorely:custom-protocols";

function normalizeProtocol(
	protocol: CustomProtocolDefinition,
): CustomProtocolDefinition {
	return {
		...protocol,

		roundAllowNegative: protocol.roundAllowNegative ?? false,

		roundCompletionMode: protocol.roundCompletionMode ?? "allPlayers",

		turnOrder: protocol.turnOrder ?? {
			enabled: false,
			firstPlayerMode: "player1",
			rotateStartingPlayer: false,
		},

		rows: Array.isArray(protocol.rows) ? protocol.rows : [],
	};
}

function readProtocols(): CustomProtocolDefinition[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);

		if (!raw) {
			return [];
		}

		const parsed: unknown = JSON.parse(raw);

		if (!Array.isArray(parsed)) {
			return [];
		}

		return parsed
			.filter((item): item is CustomProtocolDefinition => {
				if (typeof item !== "object" || item === null) {
					return false;
				}

				const candidate = item as Partial<CustomProtocolDefinition>;

				return (
					typeof candidate.id === "string" &&
					typeof candidate.name === "string" &&
					typeof candidate.category === "string" &&
					typeof candidate.layout === "string"
				);
			})
			.map(normalizeProtocol);
	} catch {
		return [];
	}
}

function writeProtocols(protocols: CustomProtocolDefinition[]) {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(protocols));
}

export const CustomProtocolService = {
	getAll(): CustomProtocolDefinition[] {
		return readProtocols().sort(
			(a, b) =>
				new Date(b.updatedAt).getTime() -
				new Date(a.updatedAt).getTime(),
		);
	},

	getById(id: string): CustomProtocolDefinition | null {
		return readProtocols().find((protocol) => protocol.id === id) ?? null;
	},

	save(protocol: CustomProtocolDefinition) {
		const protocols = readProtocols();

		const existingIndex = protocols.findIndex(
			(item) => item.id === protocol.id,
		);

		const now = new Date().toISOString();

		const normalized = normalizeProtocol({
			...protocol,

			updatedAt: now,

			createdAt: protocol.createdAt || now,
		});

		if (existingIndex === -1) {
			protocols.push(normalized);
		} else {
			protocols[existingIndex] = normalized;
		}

		writeProtocols(protocols);

		return normalized;
	},

	delete(id: string) {
		writeProtocols(
			readProtocols().filter((protocol) => protocol.id !== id),
		);
	},

	duplicate(id: string): CustomProtocolDefinition | null {
		const source = this.getById(id);

		if (!source) {
			return null;
		}

		const now = new Date().toISOString();

		const duplicated: CustomProtocolDefinition = {
			...source,

			id: crypto.randomUUID(),

			name: `${source.name} – kopia`,

			createdAt: now,

			updatedAt: now,

			rows: source.rows.map((row) => ({
				...row,

				id: crypto.randomUUID(),
			})),
		};

		return this.save(duplicated);
	},

	clearAll() {
		localStorage.removeItem(STORAGE_KEY);
	},
};
