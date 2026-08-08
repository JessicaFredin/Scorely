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
			"Ett tärningsspel där spelare samlar poäng över flera rundor. Man måste få minst 1000 poäng i en runda för att komma in på tavlan. Först till 10000 vinner.",
	},
	{
		id: "4-manswhist",
		name: "4-manswhist",
		minPlayers: 4,
		maxPlayers: 4,
		hasRounds: true,
		scoreType: "points",
		category: "kortspel",
		description:
			"Två lag, säg rött (spel) eller svart (pass). Lyckas du inte ta tillräckligt med stick ger det straffpoäng. Först till 13 vinner.",
	},
	{
		id: "2-manswhist",
		name: "2-manswhist",
		minPlayers: 2,
		maxPlayers: 2,
		hasRounds: true,
		scoreType: "points",
		category: "kortspel",
		description:
			"Samma som 4-manswhist men för 2 spelare. Säg rött eller svart, först till 13 poäng vinner.",
	},
	{
		id: "maxi-yatzy",
		name: "Maxi Yatzy",
		minPlayers: 2,
		maxPlayers: 6,
		hasRounds: true,
		scoreType: "points",
		category: "tärningsspel",
		description:
			"Yatzy med 6 tärningar och fler kategorier än vanlig Yatzy. Ger fler kombinationer och högre poäng.",
	},
	{
		id: "gigant-yatzy",
		name: "Gigant Yatzy",
		minPlayers: 2,
		maxPlayers: 6,
		hasRounds: true,
		scoreType: "points",
		category: "tärningsspel",
		description:
			"En större variant av Yatzy med ännu fler tärningar och fler möjliga kombinationer. Bonus ges vid hög övre summa.",
	},
	{
		id: "30",
		name: "30",
		minPlayers: 2,
		maxPlayers: 6,
		hasRounds: true,
		scoreType: "points",
		category: "tärningsspel",
		description:
			"Alla börjar på 30 poäng. Du förlorar poäng under spelets gång, och når du 0 är du ute. Sista spelaren kvar vinner.",
	},
	{
		id: "egen-poängtavla",
		name: "Egen poängtavla",
		minPlayers: 1,
		maxPlayers: 12,
		hasRounds: true,
		scoreType: "points",
		category: "anpassat",
		description:
			"Ett anpassat protokoll där du själv fyller i poäng för valfritt spel.",
	},
];
