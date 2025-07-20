export type JazzRound = {
	label: string;
	scoreType: "minus" | "plus";
	pointsPerUnit: number;
	description: string;
};

export const jazzRounds: JazzRound[] = [
	{
		label: "Pass",
		scoreType: "minus",
		pointsPerUnit: -1,
		description: "1 minus per stick",
	},
	{
		label: "Klöver",
		scoreType: "minus",
		pointsPerUnit: -1,
		description: "1 minus per klöverkort",
	},
	{
		label: "Damer",
		scoreType: "minus",
		pointsPerUnit: -5,
		description: "5 minus per dam",
	},
	{
		label: "Klöver kung",
		scoreType: "minus",
		pointsPerUnit: -15,
		description: "15 minus om du får klöver kung",
	},
	{
		label: "Sista stick",
		scoreType: "minus",
		pointsPerUnit: -20,
		description: "20 minus om du tar sista sticket",
	},
	{
		label: "Spel",
		scoreType: "plus",
		pointsPerUnit: 1,
		description: "1 pluspoäng per stick",
	},
	{
		label: "Sjuan",
		scoreType: "minus",
		pointsPerUnit: -1,
		description: "1 minus varje gång du inte kan lägga",
	},
];

export function getTotalTricks(playerCount: number): number {
	if (playerCount === 3) return 17;
	if (playerCount === 4) return 13;
	if (playerCount === 5) return 10;
	return Math.floor(52 / playerCount);
}
