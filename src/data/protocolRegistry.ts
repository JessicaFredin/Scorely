import type { ComponentType } from "react";
import GolfProtocol from "../protocols/GolfProtocol";
import ChicagoProtocol from "../protocols/ChicagoProtocol";
import PlumpProtocol from "../protocols/PlumpProtocol";
import JazzProtocol from "../protocols/JazzProtocol";
import TrebellerProtocol from "../protocols/TrebellerProtocol";
import YatzyProtocol from "../protocols/YatzyProtocol";
import FiveHundredProtocol from "../protocols/FiveHundredProtocol";
import GigantYatzyProtocol from "../protocols/GigantYatzyProtocol";
import TenThousandProtocol from "../protocols/TenThousandProtocol";
import WhistProtocol from "../protocols/WhistProtocol";
import ThirtyProtocol from "../protocols/ThirtyProtocol";
import MaxiYatzyProtocol from "../protocols/MaxiYatzyProtocol";

export type ScoreCellValue = number | "";

export type ProtocolPlayer = {
	name: string;
};

export type ProtocolComponentProps = {
	gameName: string;
	players: ProtocolPlayer[];
	values: ScoreCellValue[][];
	onChange: (
		rowIndex: number,
		playerIndex: number,
		value: ScoreCellValue,
	) => void;
	onBatchChange?: (
		updater: (prev: ScoreCellValue[][]) => ScoreCellValue[][],
	) => void;
	isLocked?: boolean;
};

const createMatrix = (
	rowCount: number,
	playerCount: number,
): ScoreCellValue[][] =>
	Array.from({ length: rowCount }, () =>
		Array.from({ length: playerCount }, () => ""),
	);

type ProtocolEntry = {
	component: ComponentType<ProtocolComponentProps>;
	createInitialValues: (playerCount: number) => ScoreCellValue[][];
};

export const protocolRegistry: Record<string, ProtocolEntry> = {
	golf: {
		component: GolfProtocol,
		createInitialValues: (playerCount) => createMatrix(18, playerCount),
	},

	discgolf: {
		component: GolfProtocol,
		createInitialValues: (playerCount) => createMatrix(18, playerCount),
	},

	chicago: {
		component: ChicagoProtocol,
		createInitialValues: (playerCount) => createMatrix(60, playerCount),
	},

	"500": {
		component: FiveHundredProtocol,
		createInitialValues: (playerCount) => createMatrix(80, playerCount),
	},

	plump: {
		component: PlumpProtocol,
		createInitialValues: (playerCount) =>
			createMatrix(19 + playerCount - 1, playerCount),
	},

	jazz: {
		component: JazzProtocol,
		createInitialValues: (playerCount) => createMatrix(7, playerCount),
	},

	trebeller: {
		component: TrebellerProtocol,
		createInitialValues: (playerCount) => createMatrix(18, playerCount),
	},

	yatzy: {
		component: YatzyProtocol,
		createInitialValues: (playerCount) => createMatrix(16, playerCount),
	},

	"10000": {
		component: TenThousandProtocol,
		createInitialValues: (playerCount) => createMatrix(5, playerCount),
	},

	"4-manswhist": {
		component: WhistProtocol,
		createInitialValues: (playerCount) => createMatrix(40, playerCount),
	},

	"2-manswhist": {
		component: WhistProtocol,
		createInitialValues: (playerCount) => createMatrix(40, playerCount),
	},

	"gigant-yatzy": {
		component: GigantYatzyProtocol,
		createInitialValues: (playerCount) => createMatrix(47, playerCount),
	},

	"30": {
		component: ThirtyProtocol,
		createInitialValues: (playerCount) => createMatrix(1, playerCount),
	},

	"maxi-yatzy": {
		component: MaxiYatzyProtocol,
		createInitialValues: (playerCount) => createMatrix(21, playerCount),
	},
};
