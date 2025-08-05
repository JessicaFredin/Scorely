// // // src/services/ProtocolService.ts
// // export interface SavedProtocol {
// // 	id: string;
// // 	game: string;
// // 	players: { name: string }[];
// // 	scores: number[][];
// // 	date: string;
// // }

// // export const ProtocolService = {
// // 	getAll(): SavedProtocol[] {
// // 		return JSON.parse(localStorage.getItem("savedProtocols") || "[]");
// // 	},
// // 	save(protocol: Omit<SavedProtocol, "id" | "date">) {
// // 		const existing = ProtocolService.getAll();
// // 		const newProtocol: SavedProtocol = {
// // 			...protocol,
// // 			id: crypto.randomUUID(),
// // 			date: new Date().toISOString(),
// // 		};
// // 		existing.push(newProtocol);
// // 		localStorage.setItem("savedProtocols", JSON.stringify(existing));
// // 	},
// // 	getById(id: string): SavedProtocol | undefined {
// // 		return ProtocolService.getAll().find((p) => p.id === id);
// // 	},
// // 	delete(id: string) {
// // 		const updated = ProtocolService.getAll().filter((p) => p.id !== id);
// // 		localStorage.setItem("savedProtocols", JSON.stringify(updated));
// // 	},
// // };




// import type { SavedProtocol } from "../types/savedProtocol";

// export const ProtocolService = {
// 	getAll(): SavedProtocol[] {
// 		// load from localStorage or wherever
// 		return JSON.parse(localStorage.getItem("protocols") || "[]");
// 	},
// 	save(protocol: Omit<SavedProtocol, "id" | "date">): void {
// 		const protocols = ProtocolService.getAll();
// 		const newProtocol: SavedProtocol = {
// 			...protocol,
// 			id: crypto.randomUUID(),
// 			date: new Date().toISOString(),
// 		};
// 		localStorage.setItem(
// 			"protocols",
// 			JSON.stringify([...protocols, newProtocol])
// 		);
// 	},
// 	getById(id: string): SavedProtocol | undefined {
// 		return ProtocolService.getAll().find((p) => p.id === id);
// 	},
// 	delete(id: string): void {
// 		const protocols = ProtocolService.getAll().filter((p) => p.id !== id);
// 		localStorage.setItem("protocols", JSON.stringify(protocols));
// 	},
// };




// import type { SavedProtocol } from "../types/savedProtocol";

// const STORAGE_KEY = "savedProtocols";

// export const ProtocolService = {
// 	getAll(): SavedProtocol[] {
// 		const stored = localStorage.getItem(STORAGE_KEY);
// 		return stored ? JSON.parse(stored) : [];
// 	},

// 	getById(id: string): SavedProtocol | undefined {
// 		return ProtocolService.getAll().find((p) => p.id === id);
// 	},

// 	save(protocol: SavedProtocol) {
// 		const all = ProtocolService.getAll();
// 		const updated = [...all.filter((p) => p.id !== protocol.id), protocol];
// 		localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
// 	},

// 	delete(id: string) {
// 		const updated = ProtocolService.getAll().filter((p) => p.id !== id);
// 		localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
// 	},
// };



import type { SavedProtocol } from "../types/savedProtocol";

const STORAGE_KEY = "savedProtocols";

export const ProtocolService = {
	getAll(): SavedProtocol[] {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
	},

	getById(id: string): SavedProtocol | null {
		const all = ProtocolService.getAll();
		return all.find((p) => p.id === id) || null;
	},

	save(protocol: SavedProtocol) {
		const all = ProtocolService.getAll();
		const index = all.findIndex((p) => p.id === protocol.id);
		if (index >= 0) {
			all[index] = protocol; // update
		} else {
			all.push(protocol); // new
		}
		localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
	},

	delete(id: string) {
		const updated = ProtocolService.getAll().filter((p) => p.id !== id);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
	},
};
