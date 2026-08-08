export interface Game {
	id: string;
	name: string;
	minPlayers: number;
	maxPlayers: number;
	hasRounds: boolean;
	scoreType: "points" | "strokes" | "minus";
	category: "kortspel" | "golf" | "tärningsspel" | "anpassat";
	description: string;
}
