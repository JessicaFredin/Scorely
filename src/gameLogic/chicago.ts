import type { GameLogic } from "../types/gameLogic";

export const chicagoLogic: GameLogic = {
	gameId: "chicago",
	targetScore: 52,
	buyLimit: 47,
	chicagoRequiredToWin: true,

	scoring: [
		// Handvärden
		{ id: "pair", points: 1 },
		{ id: "twoPair", points: 2 },
		{ id: "threeOfKind", points: 3 },
		{ id: "straight", points: 4 },
		{ id: "flush", points: 5 },
		{ id: "fullHouse", points: 6 },
		{ id: "fourOfKind", points: 8, resetOthers: true },
		{ id: "straightFlush", points: 25 },
		{ id: "royalFlush", points: 52 },

		// Utspelet
		{ id: "outplay", points: 5 },
		{ id: "outplayWithTwo", points: 10 },

		// Chicago
		{ id: "chicagoSuccess", points: 15, isChicago: true },
		{ id: "chicagoFail", points: -15, isChicago: true },
	],
};
