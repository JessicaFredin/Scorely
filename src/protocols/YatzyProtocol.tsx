import GridProtocol, {
	type ScoreCellValue,
	type GridProtocolRow,
} from "../components/scorecard/GridProtocol";

type Player = {
	name: string;
};

type YatzyProtocolProps = {
	gameName: string;
	players: Player[];
	values: ScoreCellValue[][];
	onChange: (
		rowIndex: number,
		playerIndex: number,
		value: ScoreCellValue,
	) => void;
};

const yatzyRows: GridProtocolRow[] = [
	{ key: "ones", label: "Ettor" },
	{ key: "twos", label: "Tvåor" },
	{ key: "threes", label: "Treor" },
	{ key: "fours", label: "Fyror" },
	{ key: "fives", label: "Femmor" },
	{ key: "sixes", label: "Sexor" },
	{ key: "bonus", label: "Bonus" },
	{ key: "pair", label: "Par" },
	{ key: "two-pair", label: "Två par" },
	{ key: "three-kind", label: "Triss" },
	{ key: "four-kind", label: "Fyrtal" },
	{ key: "small-straight", label: "Liten stege" },
	{ key: "large-straight", label: "Stor stege" },
	{ key: "full-house", label: "Kåk" },
	{ key: "chance", label: "Chans" },
	{ key: "yatzy", label: "Yatzy" },
];

const tenThousandRows: GridProtocolRow[] = Array.from(
	{ length: 10 },
	(_, index) => ({
		key: `round-${index + 1}`,
		label: `Runda ${index + 1}`,
	}),
);

export default function YatzyProtocol({
	gameName,
	players,
	values,
	onChange,
}: YatzyProtocolProps) {
	const isTenThousand =
		gameName.trim() === "10000" || gameName.toLowerCase().includes("10000");

	return (
		<GridProtocol
			titleCellLabel={gameName.toUpperCase()}
			rows={isTenThousand ? tenThousandRows : yatzyRows}
			players={players}
			values={values}
			onChange={onChange}
		/>
	);
}
