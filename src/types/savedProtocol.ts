// import type { Player } from "./player.ts";

// export type SavedProtocol = {
// 	id: string;
// 	game: string; // e.g. "Disc Golf", "Chicago"
// 	date: string; // ISO date string
// 	players: Player[];
// 	scores: number[][]; // scores[playerIndex][roundIndex]
// };

// export interface SavedProtocol {
// 	id: string;
// 	name?: string;
// 	gameType:
// 		| "500"
// 		| "10000"
// 		| "chicago"
// 		| "discGolf"
// 		| "jazz"
// 		| "plump"
// 		| "trebeller";
// 	players: { name: string }[];
// 	scores: number[][];
// 	date?: string;
// 	createdAt: string;
// 	updatedAt?: string;
// }

export type SavedProtocolGameType =
	| "500"
	| "10000"
	| "chicago"
	| "discGolf"
	| "jazz"
	| "plump"
	| "trebeller";

export type SavedProtocolStatus = "Pågående" | "Avslutad";

export interface SavedProtocolPlayer {
	name: string;
}

export type SavedProtocolScoreValue = number | "";

export interface SavedProtocol {
	id: string;
	gameId: string;
	gameName: string;
	gameType: SavedProtocolGameType;
	category?: string;
	players: SavedProtocolPlayer[];
	values: SavedProtocolScoreValue[][];
	createdAt: string;
	updatedAt: string;
	status: SavedProtocolStatus;
	winnerName: string | null;
	route: string;
}