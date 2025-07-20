export type ScoreRule = {
	id: string;
	points: number;
	resetOthers?: boolean;
	isChicago?: boolean;
};

export type GameLogic = {
	gameId: string;
	targetScore: number;
	buyLimit: number;
	chicagoRequiredToWin: boolean;
	scoring: ScoreRule[];
};
