import RoundProtocol, {
	type ScoreCellValue,
	type RoundProtocolRow,
} from "../components/scorecard/RoundProtocol";

type Player = {
	name: string;
};

type JazzProtocolProps = {
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
		key: "pass",
		label: "Pass",
		helper: "Skriv in minuspoäng från sticken i den här rundan.",
	},
	{
		key: "clubs",
		label: "Klöver",
		helper: "Skriv in resultatet för klöver-rundan.",
	},
	{
		key: "queens",
		label: "Damer",
		helper: "Skriv in minuspoäng för damerna.",
	},
	{
		key: "king-of-clubs",
		label: "Klöverkung",
		helper: "Skriv in resultatet för klöverkung-rundan.",
	},
	{
		key: "last-trick",
		label: "Sista",
		helper: "Skriv in resultatet för sista sticket.",
	},
	{
		key: "play",
		label: "Spel",
		helper: "Skriv in pluspoängen från spelrundan.",
	},
	{
		key: "seven",
		label: "Sjuan",
		helper: "Skriv in resultatet för sjuan.",
	},
];

export default function JazzProtocol({
	players,
	values,
	onChange,
}: JazzProtocolProps) {
	return (
		<RoundProtocol
			rounds={rounds}
			players={players}
			values={values}
			onChange={onChange}
		/>
	);
}