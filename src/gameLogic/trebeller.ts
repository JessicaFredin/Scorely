// export type TrebellerCategory =
// 	| "Hjärter"
// 	| "Ruter"
// 	| "Klöver"
// 	| "Spader"
// 	| "Pass"
// 	| "Spel";

// export type TrebellerRound = {
// 	category: TrebellerCategory;
// 	chosenBy: number | null; // Index of the player who chose it
// 	scores: number[]; // +X or -X based on tricks taken vs expected
// 	tricksTaken: number[]; // number of tricks each player took
// };

// export const trebellerCategories: TrebellerCategory[] = [
// 	"Hjärter",
// 	"Ruter",
// 	"Klöver",
// 	"Spader",
// 	"Pass",
// 	"Spel",
// ];

// export function createInitialTrebellerRounds(): TrebellerRound[] {
// 	return trebellerCategories.map((cat) => ({
// 		category: cat,
// 		chosenBy: null,
// 		scores: [0, 0, 0],
// 		tricksTaken: [0, 0, 0],
// 	}));
// }

// export function isCategoryAvailable(
// 	rounds: TrebellerRound[],
// 	playerIndex: number,
// 	category: TrebellerCategory
// ): boolean {
// 	return !rounds.some(
// 		(r) => r.category === category && r.chosenBy === playerIndex
// 	);
// }

// // Main scoring logic: who chose, who is 2nd, who is 3rd → 7-4-2
// export function calculateTrebellerScores(
// 	tricksTaken: number[],
// 	chosenBy: number
// ): number[] {
// 	const expected = [0, 0, 0];
// 	expected[chosenBy] = 7;
// 	expected[(chosenBy + 1) % 3] = 4;
// 	expected[(chosenBy + 2) % 3] = 2;

// 	return tricksTaken.map((actual, i) => actual - expected[i]);
// }

// export function hasPlayerChosenCategory(
// 	rounds: TrebellerRound[],
// 	playerIndex: number,
// 	category: TrebellerCategory
// ): boolean {
// 	return rounds.some(
// 		(r) => r.category === category && r.chosenBy === playerIndex
// 	);
// }

// export function isCategoryFullyUsedByAll(
// 	rounds: TrebellerRound[],
// 	category: TrebellerCategory
// ): boolean {
// 	const uniquePlayers = rounds
// 		.filter((r) => r.category === category && r.chosenBy !== null)
// 		.map((r) => r.chosenBy);
// 	return new Set(uniquePlayers).size >= 3;
// }



export type TrebellerCategory =
	| "Hjärter"
	| "Ruter"
	| "Klöver"
	| "Spader"
	| "Pass"
	| "Spel";

export type TrebellerRound = {
	category: TrebellerCategory;
	chosenBy: number; // no longer nullable
	scores: number[];
	tricksTaken: number[];
};

export const trebellerCategories: TrebellerCategory[] = [
	"Hjärter",
	"Ruter",
	"Klöver",
	"Spader",
	"Pass",
	"Spel",
];

export function createInitialTrebellerRounds(): TrebellerRound[] {
	return [];
}

export function calculateTrebellerScores(
	tricksTaken: number[],
	chosenBy: number
): number[] {
	const expected = [0, 0, 0];
	expected[chosenBy] = 7;
	expected[(chosenBy + 1) % 3] = 4;
	expected[(chosenBy + 2) % 3] = 2;
	return tricksTaken.map((actual, i) => actual - expected[i]);
}

export function hasPlayerChosenCategory(
	rounds: TrebellerRound[],
	playerIndex: number,
	category: TrebellerCategory
): boolean {
	return rounds.some(
		(r) => r.category === category && r.chosenBy === playerIndex
	);
}

export function getChosenCategoriesByPlayer(
	rounds: TrebellerRound[]
): Map<number, Set<TrebellerCategory>> {
	const map = new Map<number, Set<TrebellerCategory>>();
	for (let i = 0; i < 3; i++) map.set(i, new Set());

	for (const round of rounds) {
		map.get(round.chosenBy)!.add(round.category);
	}
	return map;
}
