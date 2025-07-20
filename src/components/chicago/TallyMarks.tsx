type TallyMarksProps = {
	count: number;
	striked?: number; // hur många poäng som ska ha line-through
};

export default function TallyMarks({ count, striked = 0 }: TallyMarksProps) {
	const fullGroups = Math.floor(count / 5);
	const remainder = count % 5;

	const renderGroup = (key: number, isStriked: boolean) => (
		<svg
			key={`group-${key}`}
			viewBox="0 0 24 24"
			width="28"
			height="28"
			className="inline-block align-bottom"
		>
			{[2, 6, 10, 14].map((x, i) => (
				<line
					key={i}
					x1={x}
					y1="2"
					x2={x}
					y2="22"
					stroke={isStriked ? "#999" : "black"}
					strokeWidth="2"
				/>
			))}
			<line
				x1="2"
				y1="2"
				x2="14"
				y2="22"
				stroke={isStriked ? "#999" : "black"}
				strokeWidth="2"
			/>
			{isStriked && (
				<line
					x1="0"
					y1="12"
					x2="24"
					y2="12"
					stroke="red"
					strokeWidth="2"
				/>
			)}
		</svg>
	);

	const renderRemainderGroup = (count: number, isStriked: boolean) => (
		<svg
			viewBox="0 0 24 24"
			width="28"
			height="28"
			className="inline-block align-bottom"
		>
			{Array.from({ length: count }, (_, i) => (
				<line
					key={i}
					x1={2 + i * 4}
					y1="2"
					x2={2 + i * 4}
					y2="22"
					stroke={isStriked ? "#999" : "black"}
					strokeWidth="2"
				/>
			))}
			{isStriked && (
				<line
					x1="0"
					y1="12"
					x2="24"
					y2="12"
					stroke="red"
					strokeWidth="2"
				/>
			)}
		</svg>
	);

	return (
		<div className="flex flex-wrap justify-center">
			{Array.from({ length: fullGroups }, (_, i) =>
				renderGroup(i, striked >= (i + 1) * 5)
			)}
			{remainder > 0 &&
				renderRemainderGroup(remainder, striked > fullGroups * 5)}
		</div>
	);
}
