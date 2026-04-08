import RoundProtocol, {
	type ScoreCellValue,
	type RoundProtocolRow,
} from "../components/scorecard/RoundProtocol";

type Player = {
	name: string;
};

type TrebellerProtocolProps = {
	gameName: string;
	players: Player[];
	values: ScoreCellValue[][];
	onChange: (
		rowIndex: number,
		playerIndex: number,
		value: ScoreCellValue,
	) => void;
};

const rounds: RoundProtocolRow[] = [
	{
		key: "hearts",
		label: "Hjärter",
		helper: "Lägg in resultatet för den spelare som valde hjärter.",
	},
	{
		key: "diamonds",
		label: "Ruter",
		helper: "Lägg in resultatet för den spelare som valde ruter.",
	},
	{
		key: "clubs",
		label: "Klöver",
		helper: "Lägg in resultatet för den spelare som valde klöver.",
	},
	{
		key: "spades",
		label: "Spader",
		helper: "Lägg in resultatet för den spelare som valde spader.",
	},
	{
		key: "pass",
		label: "Pass",
		helper: "Lägg in resultatet för pass-rundan.",
	},
	{
		key: "play",
		label: "Spel",
		helper: "Lägg in resultatet för spel-rundan.",
	},
];

export default function TrebellerProtocol({
	players,
	values,
	onChange,
}: TrebellerProtocolProps) {
	return (
		<RoundProtocol
			rounds={rounds}
			players={players}
			values={values}
			onChange={onChange}
		/>
	);
}
