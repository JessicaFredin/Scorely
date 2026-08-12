export type CustomProtocolCategory =
	| "kortspel"
	| "tärningsspel"
	| "golf"
	| "sport"
	| "annat";

export type CustomWinCondition = "highest" | "lowest" | "target";

export type CustomProtocolLayout = "rounds" | "categories";

export type CustomFirstPlayerMode = "player1" | "select" | "random";

export type CustomRoundCompletionMode = "allPlayers" | "independent";

export type CustomProtocolTurnOrder = {
	enabled: boolean;

	firstPlayerMode: CustomFirstPlayerMode;

	rotateStartingPlayer: boolean;
};

export type CustomProtocolRow = {
	id: string;

	name: string;

	description?: string;

	allowNegative: boolean;

	min?: number;

	max?: number;
};

export type CustomProtocolDefinition = {
	id: string;

	name: string;

	category: CustomProtocolCategory;

	description: string;

	rules: string;

	playerMin: number;

	playerMax: number;

	winCondition: CustomWinCondition;

	targetScore?: number;

	startScore: number;

	layout: CustomProtocolLayout;

	initialRounds: number;

	autoAddRounds: boolean;

	roundAllowNegative: boolean;

	roundCompletionMode: CustomRoundCompletionMode;

	rows: CustomProtocolRow[];

	turnOrder: CustomProtocolTurnOrder;

	createdAt: string;

	updatedAt: string;
};

export type CustomMatchPlayer = {
	name: string;
};

export type CustomMatchScoreValue = number | "";

export type CustomGameSession = {
	id: string;

	protocolId: string;

	protocol: CustomProtocolDefinition;

	players: CustomMatchPlayer[];

	startingPlayerIndex: number;

	values: CustomMatchScoreValue[][];

	createdAt: string;

	updatedAt: string;

	finished: boolean;

	winnerName: string | null;
};
