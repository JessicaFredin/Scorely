import type { Game } from "../types/game";

export const games: Game[] = [
	{
		id: "chicago",
		name: "Chicago",
		minPlayers: 2,
		maxPlayers: 6,
		hasRounds: true,
		scoreType: "points",
		category: "kortspel",
		description:
			"Ett stickspel där man spelar i sju rundor med ökande antal kort. Poäng ges för stick och vissa kort.",
	},
	{
		id: "golf",
		name: "Golf",
		minPlayers: 1,
		maxPlayers: 6,
		hasRounds: true,
		scoreType: "strokes",
		category: "golf",
		description:
			"Spelare går flera hål och försöker få bollen i mål med så få slag som möjligt. Lägst total vinner.",
	},
	{
		id: "500",
		name: "500",
		minPlayers: 2,
		maxPlayers: 6,
		hasRounds: true,
		scoreType: "points",
		category: "kortspel",
		description:
			"Samla poäng genom att lägga ut triss eller färgstege. Klädda kort ger 10 poäng, övriga 5. Först till 500 vinner.",
	},
	{
		id: "plump",
		name: "Plump",
		minPlayers: 2,
		maxPlayers: 5,
		hasRounds: true,
		scoreType: "minus",
		category: "kortspel",
		description:
			"Gissa hur många stick du ska ta. Missar du, får du en plump (minuspoäng). Flest lyckade gissningar vinner.",
	},
	{
		id: "jazz",
		name: "Jazz",
		minPlayers: 3,
		maxPlayers: 6,
		hasRounds: true,
		scoreType: "minus",
		category: "kortspel",
		description:
			"Ett spel i flera delar: t.ex. pass, klöver, damer, kung i klöver. Undvik att ta de oönskade korten – annars får du minuspoäng. Pluspoäng fås endast i spelrundan.",
	},
	{
		id: "trebeller",
		name: "Trebeller",
		minPlayers: 3,
		maxPlayers: 3,
		hasRounds: true,
		scoreType: "points",
		category: "kortspel",
		description:
			"Exakt tre spelare. Varje runda väljer man färg, pass eller spel. Varje val får bara göras en gång per spelare – totalt 6 rundor.",
	},
	{
		id: "yatzy",
		name: "Yatzy",
		minPlayers: 2,
		maxPlayers: 6,
		hasRounds: true,
		scoreType: "points",
		category: "tärningsspel",
		description: "Yatzy är ett tärningsspel",
	},
	{
		id: "discgolf",
		name: "Discgolf",
		minPlayers: 1,
		maxPlayers: 6,
		hasRounds: true,
		scoreType: "strokes",
		category: "golf",
		description:
			"Spelare går flera hål och försöker få bollen i mål med så få slag som möjligt. Lägst total vinner.",
	},
	{
		id: "10000",
		name: "10000",
		minPlayers: 2,
		maxPlayers: 6,
		hasRounds: true,
		scoreType: "points",
		category: "tärningsspel",
		description:
			"Spelare ska försöka få 10000 poäng, men man måste få minst 1000 poäng för att hamna på pappret.",
	},
];


