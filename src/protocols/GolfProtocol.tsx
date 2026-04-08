import GridProtocol, {
	type ScoreCellValue,
	type GridProtocolRow,
} from "../components/scorecard/GridProtocol";

type Player = {
	name: string;
};

type GolfProtocolProps = {
	gameName: string;
	players: Player[];
	values: ScoreCellValue[][];
	onChange: (
		rowIndex: number,
		playerIndex: number,
		value: ScoreCellValue,
	) => void;
};

const rows: GridProtocolRow[] = Array.from({ length: 18 }, (_, index) => ({
	key: `hole-${index + 1}`,
	label: `Hål ${index + 1}`,
}));

export default function GolfProtocol({
	gameName,
	players,
	values,
	onChange,
}: GolfProtocolProps) {
	return (
		<GridProtocol
			titleCellLabel={gameName.toUpperCase()}
			rows={rows}
			players={players}
			values={values}
			onChange={onChange}
		/>
	);
}
