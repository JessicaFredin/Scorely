import type { CustomProtocolDefinition } from "../types/customProtocol";

import { ScorelyCloudService } from "./ScorelyCloudService";

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
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(protocols));
	} catch {
		/*
			Om localStorage är otillgängligt
			ska appen fortfarande inte krascha.
		*/
	}
}

/*
	Används både av vanlig save()
	och av ScorelySyncService.

	VIKTIGT:
	Denna funktion skriver ENDAST lokalt.
	Den anropar aldrig Supabase.
*/
function saveLocalOnlyInternal(protocol: CustomProtocolDefinition) {
	const normalized = normalizeProtocol(protocol);

	const protocols = readProtocols();

	const existingIndex = protocols.findIndex(
		(item) => item.id === normalized.id,
	);

	if (existingIndex === -1) {
		protocols.push(normalized);
	} else {
		protocols[existingIndex] = normalized;
	}

	writeProtocols(protocols);

	return normalized;
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

	/*
		=====================================================
		SAVE
		=====================================================

		1. Sparar omedelbart i localStorage.
		2. Försöker sedan synka till Supabase.
		3. Om användaren är offline/utloggad
		   finns datan fortfarande lokalt.
	*/

	save(protocol: CustomProtocolDefinition): CustomProtocolDefinition {
		const now = new Date().toISOString();

		const normalized = normalizeProtocol({
			...protocol,

			createdAt: protocol.createdAt || now,

			updatedAt: now,
		});

		const saved = saveLocalOnlyInternal(normalized);

		void ScorelyCloudService.saveCustomProtocol(saved).catch(() => {
			/*
					Local save är redan klar.
					Cloud kan synkas senare.
				*/
		});

		return saved;
	},

	/*
		Används av ScorelySyncService.

		Cloud-sync får INTE triggas här,
		annars kan vi skapa sync-loopar.
	*/

	saveLocalOnly(
		protocol: CustomProtocolDefinition,
	): CustomProtocolDefinition {
		return saveLocalOnlyInternal(normalizeProtocol(protocol));
	},

	/*
		=====================================================
		DELETE
		=====================================================
	*/

	delete(id: string): void {
		writeProtocols(
			readProtocols().filter((protocol) => protocol.id !== id),
		);

		void ScorelyCloudService.deleteCustomProtocol(id).catch(() => {
			/*
					Om cloud-delete misslyckas
					finns den åtminstone inte
					lokalt längre.
				*/
		});
	},

	/*
		=====================================================
		DUPLICATE
		=====================================================
	*/

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

	/*
		=====================================================
		CLEAR ALL
		=====================================================
	*/

	clearAll(): void {
		const protocols = readProtocols();

		localStorage.removeItem(STORAGE_KEY);

		/*
			Ta även bort användarens
			cloud-versioner om personen
			är inloggad.
		*/

		for (const protocol of protocols) {
			void ScorelyCloudService.deleteCustomProtocol(protocol.id).catch(
				() => {},
			);
		}
	},
};
