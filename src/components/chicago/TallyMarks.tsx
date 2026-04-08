// type TallyMarksProps = {
// 	count: number;
// 	striked?: number; // hur många poäng som ska ha line-through
// };

// export default function TallyMarks({ count, striked = 0 }: TallyMarksProps) {
// 	const fullGroups = Math.floor(count / 5);
// 	const remainder = count % 5;

// 	const renderGroup = (key: number, isStriked: boolean) => (
// 		<svg
// 			key={`group-${key}`}
// 			viewBox="0 0 24 24"
// 			width="28"
// 			height="28"
// 			className="inline-block align-bottom"
// 		>
// 			{[2, 6, 10, 14].map((x, i) => (
// 				<line
// 					key={i}
// 					x1={x}
// 					y1="2"
// 					x2={x}
// 					y2="22"
// 					stroke={isStriked ? "#999" : "black"}
// 					strokeWidth="2"
// 				/>
// 			))}
// 			<line
// 				x1="2"
// 				y1="2"
// 				x2="14"
// 				y2="22"
// 				stroke={isStriked ? "#999" : "black"}
// 				strokeWidth="2"
// 			/>
// 			{isStriked && (
// 				<line
// 					x1="0"
// 					y1="12"
// 					x2="24"
// 					y2="12"
// 					stroke="red"
// 					strokeWidth="2"
// 				/>
// 			)}
// 		</svg>
// 	);

// 	const renderRemainderGroup = (count: number, isStriked: boolean) => (
// 		<svg
// 			viewBox="0 0 24 24"
// 			width="28"
// 			height="28"
// 			className="inline-block align-bottom"
// 		>
// 			{Array.from({ length: count }, (_, i) => (
// 				<line
// 					key={i}
// 					x1={2 + i * 4}
// 					y1="2"
// 					x2={2 + i * 4}
// 					y2="22"
// 					stroke={isStriked ? "#999" : "black"}
// 					strokeWidth="2"
// 				/>
// 			))}
// 			{isStriked && (
// 				<line
// 					x1="0"
// 					y1="12"
// 					x2="24"
// 					y2="12"
// 					stroke="red"
// 					strokeWidth="2"
// 				/>
// 			)}
// 		</svg>
// 	);

// 	return (
// 		<div className="flex flex-wrap justify-center">
// 			{Array.from({ length: fullGroups }, (_, i) =>
// 				renderGroup(i, striked >= (i + 1) * 5)
// 			)}
// 			{remainder > 0 &&
// 				renderRemainderGroup(remainder, striked > fullGroups * 5)}
// 		</div>
// 	);
// }

type TallyMarksProps = {
	count: number; // 1-5
	striked?: number; // strike earliest points in this group
};

export default function TallyMarks({ count, striked = 0 }: TallyMarksProps) {
	const normal = "#0f172a";
	const muted = "#94a3b8";

	const isStruck = (pointIndex: number) => pointIndex <= striked;

	const verticalColor = (index: 1 | 2 | 3 | 4) => {
		if (count < index) return "transparent";
		return isStruck(index) ? muted : normal;
	};

	const diagonalColor =
		count === 5 ? (isStruck(5) ? muted : normal) : "transparent";

	return (
		<svg
			viewBox="0 0 24 24"
			width="26"
			height="30"
			className="block shrink-0"
			aria-hidden="true"
		>
			{count >= 1 && (
				<line
					x1="3"
					y1="2"
					x2="3"
					y2="22"
					stroke={verticalColor(1)}
					strokeWidth="2.4"
					strokeLinecap="round"
				/>
			)}

			{count >= 2 && (
				<line
					x1="8"
					y1="2"
					x2="8"
					y2="22"
					stroke={verticalColor(2)}
					strokeWidth="2.4"
					strokeLinecap="round"
				/>
			)}

			{count >= 3 && (
				<line
					x1="13"
					y1="2"
					x2="13"
					y2="22"
					stroke={verticalColor(3)}
					strokeWidth="2.4"
					strokeLinecap="round"
				/>
			)}

			{count >= 4 && (
				<line
					x1="18"
					y1="2"
					x2="18"
					y2="22"
					stroke={verticalColor(4)}
					strokeWidth="2.4"
					strokeLinecap="round"
				/>
			)}

			{count === 5 && (
				<line
					x1="2"
					y1="5"
					x2="19"
					y2="20"
					stroke={diagonalColor}
					strokeWidth="2.4"
					strokeLinecap="round"
				/>
			)}

			{striked > 0 && (
				<line
					x1="1"
					y1="15"
					x2="23"
					y2="11"
					stroke="#fb7185"
					strokeWidth="2.2"
					strokeLinecap="round"
				/>
			)}
		</svg>
	);
}