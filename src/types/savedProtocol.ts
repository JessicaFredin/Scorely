

	export type SavedProtocolGameType =
		| "500"
		| "10000"
		| "chicago"
		| "discGolf"
		| "jazz"
		| "plump"
		| "trebeller"
		| "4-manswhist"
		| "2-manswhist"
		| "30";
		

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