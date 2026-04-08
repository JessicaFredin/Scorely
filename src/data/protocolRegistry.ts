// import GolfProtocol from "../protocols/GolfProtocol";
// import ChicagoProtocol from "../protocols/ChicagoProtocol";
// import PlumpProtocol from "../protocols/PlumpProtocol";
// import JazzProtocol from "../protocols/JazzProtocol";
// import TrebellerProtocol from "../protocols/TrebellerProtocol";
// import YatzyProtocol from "../protocols/YatzyProtocol";

// export const protocolRegistry: Record<string, React.ComponentType> = {
// 	golf: GolfProtocol,
// 	discgolf: GolfProtocol,
// 	chicago: ChicagoProtocol,
// 	"500": ChicagoProtocol,
// 	plump: PlumpProtocol,
// 	jazz: JazzProtocol,
// 	trebeller: TrebellerProtocol,
// 	yatzy: YatzyProtocol,
// 	"10000": YatzyProtocol,
// };

import type { ComponentType } from "react";
import GolfProtocol from "../protocols/GolfProtocol";
import ChicagoProtocol from "../protocols/ChicagoProtocol";
import PlumpProtocol from "../protocols/PlumpProtocol";
import JazzProtocol from "../protocols/JazzProtocol";
import TrebellerProtocol from "../protocols/TrebellerProtocol";
import YatzyProtocol from "../protocols/YatzyProtocol";

type ScoreCellValue = number | "";

const createMatrix = (
	rowCount: number,
	playerCount: number,
): ScoreCellValue[][] =>
	Array.from({ length: rowCount }, () =>
		Array.from({ length: playerCount }, () => ""),
	);

type ProtocolEntry = {
	component: ComponentType<any>;
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
		component: ChicagoProtocol,
		createInitialValues: (playerCount) => createMatrix(12, playerCount),
	},
	plump: {
		component: PlumpProtocol,
		createInitialValues: (playerCount) => createMatrix(19, playerCount),
	},
	jazz: {
		component: JazzProtocol,
		createInitialValues: (playerCount) => createMatrix(7, playerCount),
	},
	trebeller: {
		component: TrebellerProtocol,
		createInitialValues: (playerCount) => createMatrix(6, playerCount),
	},
	yatzy: {
		component: YatzyProtocol,
		createInitialValues: (playerCount) => createMatrix(16, playerCount),
	},
	"10000": {
		component: YatzyProtocol,
		createInitialValues: (playerCount) => createMatrix(10, playerCount),
	},
};