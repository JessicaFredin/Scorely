export function generatePlumpRounds(numPlayers: number): number[] {
	const descending = Array.from({ length: 9 }, (_, i) => 10 - i); // 10 → 2
	const ones = new Array(numPlayers).fill(1); // rätt antal ettor
	const ascending = Array.from({ length: 9 }, (_, i) => i + 2); // 2 → 10

	return [...descending, ...ones, ...ascending];
}

export function isRoundValid(guesses: number[], cardCount: number): boolean {
	return guesses.reduce((sum, g) => sum + g, 0) !== cardCount;
}
