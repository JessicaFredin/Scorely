export type ScoreCellValue = number | "";

export type RoundProtocolRow = {
	key: string;
	label: string;
	helper?: string;
};

type Player = {
	name: string;
};

type RoundProtocolProps = {
	rounds: RoundProtocolRow[];
	players: Player[];
	values: ScoreCellValue[][];
	onChange: (
		rowIndex: number,
		playerIndex: number,
		value: ScoreCellValue,
	) => void;
};

export default function RoundProtocol({
	rounds,
	players,
	values,
	onChange,
}: RoundProtocolProps) {
	const totals = players.map((_, playerIndex) =>
		rounds.reduce((sum, __, rowIndex) => {
			const value = values[rowIndex]?.[playerIndex];
			return sum + (Number(value) || 0);
		}, 0),
	);

	const handleInputChange = (
		rowIndex: number,
		playerIndex: number,
		rawValue: string,
	) => {
		const nextValue: ScoreCellValue =
			rawValue.trim() === "" ? "" : Number(rawValue);

		onChange(rowIndex, playerIndex, nextValue);
	};

	return (
		<div className="space-y-4">
			{rounds.map((round, rowIndex) => (
				<div
					key={round.key}
					className="rounded-[22px] border border-[#dbe5df] bg-white/75 p-4 shadow-[0_6px_18px_rgba(0,0,0,0.03)] md:p-5"
				>
					<div className="mb-4">
						<h3 className="text-[1.2rem] font-black text-slate-900">
							{round.label}
						</h3>

						{round.helper && (
							<p className="mt-1 text-sm leading-6 text-slate-500">
								{round.helper}
							</p>
						)}
					</div>

					<div
						className="grid gap-3"
						style={{
							gridTemplateColumns: `repeat(${Math.max(
								players.length,
								1,
							)}, minmax(0, 1fr))`,
						}}
					>
						{players.map((player, playerIndex) => (
							<div
								key={`${round.key}-${player.name}`}
								className="rounded-[18px] border border-[#e2e8e3] bg-[#f8fbf9] p-3"
							>
								<p className="mb-2 text-sm font-semibold text-slate-500">
									{player.name}
								</p>

								<input
									type="number"
									inputMode="numeric"
									value={
										values[rowIndex]?.[playerIndex] ?? ""
									}
									onChange={(e) =>
										handleInputChange(
											rowIndex,
											playerIndex,
											e.target.value,
										)
									}
									className="h-11 w-full rounded-[14px] border border-transparent bg-white px-3 text-center text-[1.05rem] font-semibold text-slate-800 outline-none transition focus:border-emerald-300"
									aria-label={`${round.label} - ${player.name}`}
								/>
							</div>
						))}
					</div>
				</div>
			))}

			<div className="rounded-[22px] border border-[#cfe0d6] bg-[#dff0e7] p-4 md:p-5">
				<h3 className="mb-3 text-[1.1rem] font-black text-slate-900">
					Totalt
				</h3>

				<div
					className="grid gap-3"
					style={{
						gridTemplateColumns: `repeat(${Math.max(
							players.length,
							1,
						)}, minmax(0, 1fr))`,
					}}
				>
					{players.map((player, index) => (
						<div
							key={`total-${player.name}`}
							className="rounded-[18px] bg-white/70 px-4 py-3 text-center"
						>
							<p className="text-sm font-semibold text-slate-500">
								{player.name}
							</p>
							<p className="mt-1 text-[1.35rem] font-black text-emerald-600">
								{totals[index]}
							</p>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
