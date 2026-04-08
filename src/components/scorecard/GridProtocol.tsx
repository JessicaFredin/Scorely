export type ScoreCellValue = number | "";

export type GridProtocolRow = {
	key: string;
	label: string;
};

type Player = {
	name: string;
};

type GridProtocolProps = {
	titleCellLabel: string;
	rows: GridProtocolRow[];
	players: Player[];
	values: ScoreCellValue[][];
	onChange: (
		rowIndex: number,
		playerIndex: number,
		value: ScoreCellValue,
	) => void;
	totalLabel?: string;
};

export default function GridProtocol({
	titleCellLabel,
	rows,
	players,
	values,
	onChange,
	totalLabel = "Totalt",
}: GridProtocolProps) {
	const totals = players.map((_, playerIndex) =>
		rows.reduce((sum, __, rowIndex) => {
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
		<div className="overflow-x-auto rounded-[24px] border border-[#dbe5df] bg-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.03)]">
			<table className="min-w-[760px] w-full border-separate border-spacing-0 overflow-hidden">
				<thead>
					<tr>
						<th className="sticky left-0 z-20 min-w-[170px] border-b border-r border-[#d8e3dc] bg-[#e7f1eb] px-5 py-4 text-left text-[1.05rem] font-black uppercase tracking-[0.03em] text-slate-900">
							{titleCellLabel}
						</th>

						{players.map((player) => (
							<th
								key={player.name}
								className="border-b border-[#d8e3dc] bg-[#e7f1eb] px-5 py-4 text-center text-[1.05rem] font-black uppercase tracking-[0.03em] text-slate-900"
							>
								{player.name}
							</th>
						))}
					</tr>
				</thead>

				<tbody>
					{rows.map((row, rowIndex) => (
						<tr
							key={row.key}
							className="transition hover:bg-emerald-50/40"
						>
							<th className="sticky left-0 z-10 min-w-[170px] border-b border-r border-[#e1e8e3] bg-[#f7faf8] px-5 py-4 text-left text-[1rem] font-semibold text-slate-800">
								{row.label}
							</th>

							{players.map((player, playerIndex) => (
								<td
									key={`${row.key}-${player.name}`}
									className="border-b border-[#e1e8e3] bg-white/60 px-3 py-2"
								>
									<input
										type="number"
										inputMode="numeric"
										value={
											values[rowIndex]?.[playerIndex] ??
											""
										}
										onChange={(e) =>
											handleInputChange(
												rowIndex,
												playerIndex,
												e.target.value,
											)
										}
										className="h-12 w-full rounded-[14px] border border-transparent bg-transparent px-3 text-center text-[1.05rem] font-semibold text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white"
										aria-label={`${row.label} - ${player.name}`}
									/>
								</td>
							))}
						</tr>
					))}

					<tr>
						<th className="sticky left-0 z-10 border-r border-t border-[#cfe0d6] bg-[#dff0e7] px-5 py-4 text-left text-[1.05rem] font-black text-slate-900">
							{totalLabel}
						</th>

						{totals.map((total, index) => (
							<td
								key={`total-${index}`}
								className="border-t border-[#cfe0d6] bg-[#dff0e7] px-5 py-4 text-center text-[1.3rem] font-black text-emerald-600"
							>
								{total}
							</td>
						))}
					</tr>
				</tbody>
			</table>
		</div>
	);
}
