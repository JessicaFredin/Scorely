import GridProtocol, {
	type ScoreCellValue,
	type GridProtocolRow,
} from "../components/scorecard/GridProtocol";

type Player = {
	name: string;
};

type PlumpProtocolProps = {
	gameName: string;
	players: Player[];
	values: ScoreCellValue[][];
	onChange: (
		rowIndex: number,
		playerIndex: number,
		value: ScoreCellValue,
	) => void;
};

const descending = Array.from({ length: 10 }, (_, index) => 10 - index);
const ascending = Array.from({ length: 9 }, (_, index) => index + 2);

const rows: GridProtocolRow[] = [...descending, ...ascending].map((value) => ({
	key: `plump-${value}`,
	label: `${value} kort`,
}));

export default function PlumpProtocol({
	gameName,
	players,
	values,
	onChange,
}: PlumpProtocolProps) {
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
