// import type { Player } from "./player.ts";

// export type SavedProtocol = {
// 	id: string;
// 	game: string; // e.g. "Disc Golf", "Chicago"
// 	date: string; // ISO date string
// 	players: Player[];
// 	scores: number[][]; // scores[playerIndex][roundIndex]
// };

export interface SavedProtocol {
	id: string;
	name?: string;
	gameType:
		| "500"
		| "10000"
		| "chicago"
		| "discGolf"
		| "jazz"
		| "plump"
		| "trebeller";
	players: { name: string }[];
	scores: number[][];
	date?: string;
}
