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

	const manyPlayers = players.length >= 5;

	const firstColWidth = manyPlayers
		? "w-[64px] sm:w-[96px]"
		: "w-[72px] sm:w-[100px]";
	const headerText = manyPlayers
		? "text-[0.62rem] sm:text-[0.92rem]"
		: "text-[0.72rem] sm:text-[0.92rem]";
	const rowLabelText = manyPlayers
		? "text-[0.85rem] sm:text-[0.95rem]"
		: "text-[0.95rem]";
	const inputText = manyPlayers
		? "text-[0.82rem] sm:text-[0.95rem]"
		: "text-[0.95rem]";
	const totalText = manyPlayers
		? "text-[0.88rem] sm:text-[1rem]"
		: "text-[1rem]";
	const inputHeight = manyPlayers ? "h-8 sm:h-10" : "h-9 sm:h-10";
	const cellPadding = manyPlayers ? "px-0.5 py-1" : "px-1 py-1.5";

	return (
		<div className="w-full overflow-y-auto overflow-x-hidden rounded-[18px] border border-[#dbe5df] bg-white/70 shadow-[0_8px_24px_rgba(0,0,0,0.03)] sm:rounded-[24px]">
			<table className="w-full table-fixed border-separate border-spacing-0 overflow-hidden">
				<colgroup>
					<col className={firstColWidth} />
					{players.map((player) => (
						<col key={`col-${player.name}`} />
					))}
				</colgroup>

				<thead>
					<tr>
						<th
							className={`sticky left-0 z-20 whitespace-nowrap border-b border-r border-[#d8e3dc] bg-[#e7f1eb] px-2 py-3 text-left font-black tracking-[0.02em] text-slate-900 sm:px-3 sm:py-4 ${headerText}`}
						>
							{titleCellLabel}
						</th>

						{players.map((player) => (
							<th
								key={player.name}
								className={`border-b border-[#d8e3dc] bg-[#e7f1eb] px-0.5 py-3 text-center font-black tracking-[0.02em] text-slate-900 sm:px-2 sm:py-4 ${headerText}`}
							>
								<span className="block truncate px-[2px]">
									{player.name}
								</span>
							</th>
						))}
					</tr>
				</thead>

				<tbody>
					{rows.map((row, rowIndex) => {
						const rowBg =
							rowIndex % 2 === 0 ? "bg-white/60" : "bg-[#f7faf8]";

						return (
							<tr
								key={row.key}
								className="transition hover:bg-emerald-50/40"
							>
								<th
									className={`sticky left-0 z-10 whitespace-nowrap border-b border-r border-[#e1e8e3] px-2 py-3 text-left font-semibold text-slate-800 sm:px-3 sm:py-4 ${rowBg} ${rowLabelText}`}
								>
									{row.label}
								</th>

								{players.map((player, playerIndex) => (
									<td
										key={`${row.key}-${player.name}`}
										className={`border-b border-[#e1e8e3] text-center ${rowBg} ${cellPadding}`}
									>
										<input
											type="number"
											inputMode="numeric"
											value={
												values[rowIndex]?.[
													playerIndex
												] ?? ""
											}
											onChange={(e) =>
												handleInputChange(
													rowIndex,
													playerIndex,
													e.target.value,
												)
											}
											className={`w-full rounded-[8px] border border-transparent bg-transparent px-0.5 text-center font-semibold text-slate-800 outline-none transition focus:border-emerald-300 focus:bg-white sm:rounded-[10px] sm:px-1 ${inputHeight} ${inputText}`}
											aria-label={`${row.label} - ${player.name}`}
										/>
									</td>
								))}
							</tr>
						);
					})}

					<tr>
						<th
							className={`sticky left-0 z-10 whitespace-nowrap border-r border-t border-[#cfe0d6] bg-[#dff0e7] px-2 py-3 text-left font-black text-slate-900 sm:px-3 sm:py-4 ${rowLabelText}`}
						>
							{totalLabel}
						</th>

						{totals.map((total, index) => (
							<td
								key={`total-${index}`}
								className={`border-t border-[#cfe0d6] bg-[#dff0e7] px-0.5 py-3 text-center font-black text-emerald-600 sm:px-2 sm:py-4 ${totalText}`}
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
