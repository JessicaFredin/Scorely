import { useEffect, useMemo, useState } from "react";

import {
	ArrowLeft,
	ArrowRight,
	Check,
	ChevronLeft,
	Minus,
	Play,
	Plus,
	Trash2,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import { CustomProtocolService } from "../services/CustomProtocolService";

import type {
	CustomFirstPlayerMode,
	CustomProtocolCategory,
	CustomProtocolDefinition,
	CustomProtocolLayout,
	CustomProtocolRow,
	CustomRoundCompletionMode,
	CustomWinCondition,
} from "../types/customProtocol";

const STEPS = [
	"Grundinfo",
	"Spelare & turordning",
	"Poäng & vinnare",
	"Protokolltyp",
	"Regler",
	"Förhandsgranska",
];

const categoryOptions: {
	value: CustomProtocolCategory;
	label: string;
	description: string;
}[] = [
	{
		value: "kortspel",
		label: "Kortspel",
		description: "Chicago, Whist, Plump och liknande.",
	},
	{
		value: "tärningsspel",
		label: "Tärningsspel",
		description: "Yatzy, 10 000 och liknande.",
	},
	{
		value: "golf",
		label: "Golf",
		description: "Golf, discgolf och andra slagbaserade spel.",
	},
	{
		value: "sport",
		label: "Sport",
		description: "Bowling, pingis, biljard och liknande.",
	},
	{
		value: "annat",
		label: "Annat",
		description: "Ett spel som inte passar i kategorierna ovan.",
	},
];

function createEmptyRow(index: number): CustomProtocolRow {
	return {
		id: crypto.randomUUID(),
		name: `Kategori ${index + 1}`,
		description: "",
		allowNegative: false,
	};
}

const inputClass =
	"w-full rounded-[16px] border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100";

export default function CreateCustomProtocol() {
	const navigate = useNavigate();

	const { id: editId } = useParams();

	const existingProtocol = useMemo(
		() => (editId ? CustomProtocolService.getById(editId) : null),
		[editId],
	);

	const isEditing = Boolean(editId && existingProtocol);

	const [step, setStep] = useState(0);

	const [hasLoadedEdit, setHasLoadedEdit] = useState(false);

	const [createdProtocolId, setCreatedProtocolId] = useState<string | null>(
		null,
	);

	const [name, setName] = useState("");

	const [category, setCategory] =
		useState<CustomProtocolCategory>("kortspel");

	const [description, setDescription] = useState("");

	const [playerMin, setPlayerMin] = useState(2);

	const [playerMax, setPlayerMax] = useState(4);

	const [turnOrderEnabled, setTurnOrderEnabled] = useState(false);

	const [firstPlayerMode, setFirstPlayerMode] =
		useState<CustomFirstPlayerMode>("select");

	const [rotateStartingPlayer, setRotateStartingPlayer] = useState(false);

	const [winCondition, setWinCondition] =
		useState<CustomWinCondition>("highest");

	const [targetScore, setTargetScore] = useState(100);

	const [startScore, setStartScore] = useState(0);

	const [layout, setLayout] = useState<CustomProtocolLayout>("rounds");

	const [initialRounds, setInitialRounds] = useState(5);

	const [autoAddRounds, setAutoAddRounds] = useState(true);

	const [roundAllowNegative, setRoundAllowNegative] = useState(false);

	const [roundCompletionMode, setRoundCompletionMode] =
		useState<CustomRoundCompletionMode>("allPlayers");

	const [rows, setRows] = useState<CustomProtocolRow[]>([
		createEmptyRow(0),
		createEmptyRow(1),
		createEmptyRow(2),
	]);

	const [rules, setRules] = useState("");

	const [error, setError] = useState("");

	/*
		LADDA BEFINTLIGT PROTOKOLL VID REDIGERING
	*/
	useEffect(() => {
		if (!existingProtocol || hasLoadedEdit) {
			return;
		}

		setName(existingProtocol.name);

		setCategory(existingProtocol.category);

		setDescription(existingProtocol.description ?? "");

		setPlayerMin(existingProtocol.playerMin);

		setPlayerMax(existingProtocol.playerMax);

		setTurnOrderEnabled(existingProtocol.turnOrder?.enabled ?? false);

		setFirstPlayerMode(
			existingProtocol.turnOrder?.firstPlayerMode ?? "select",
		);

		setRotateStartingPlayer(
			existingProtocol.turnOrder?.rotateStartingPlayer ?? false,
		);

		setWinCondition(existingProtocol.winCondition);

		setTargetScore(existingProtocol.targetScore ?? 100);

		setStartScore(existingProtocol.startScore ?? 0);

		setLayout(existingProtocol.layout);

		setInitialRounds(existingProtocol.initialRounds ?? 5);

		setAutoAddRounds(existingProtocol.autoAddRounds ?? true);

		setRoundAllowNegative(existingProtocol.roundAllowNegative ?? false);

		setRoundCompletionMode(
			existingProtocol.roundCompletionMode ?? "allPlayers",
		);

		setRows(
			existingProtocol.rows?.length
				? existingProtocol.rows.map((row) => ({
						...row,
					}))
				: [createEmptyRow(0), createEmptyRow(1), createEmptyRow(2)],
		);

		setRules(existingProtocol.rules ?? "");

		setHasLoadedEdit(true);
	}, [existingProtocol, hasLoadedEdit]);

	const categoryLabel = useMemo(
		() =>
			categoryOptions.find((item) => item.value === category)?.label ??
			"Annat",
		[category],
	);

	const canContinue = () => {
		if (step === 0) {
			return name.trim().length >= 2;
		}

		if (step === 1) {
			return playerMin >= 1 && playerMax >= playerMin;
		}

		if (step === 2 && winCondition === "target") {
			return targetScore > 0;
		}

		if (step === 3 && layout === "categories") {
			return (
				rows.length > 0 &&
				rows.every((row) => row.name.trim().length > 0)
			);
		}

		return true;
	};

	const goNext = () => {
		setError("");

		if (!canContinue()) {
			setError(
				step === 0
					? "Ge protokollet ett namn innan du fortsätter."
					: step === 1
						? "Kontrollera antal spelare."
						: step === 2
							? "Ange en giltig målpoäng."
							: "Alla kategorier måste ha ett namn.",
			);

			return;
		}

		setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
	};

	const goBack = () => {
		setError("");

		setStep((prev) => Math.max(prev - 1, 0));
	};

	const updateRow = (id: string, updates: Partial<CustomProtocolRow>) => {
		setRows((prev) =>
			prev.map((row) =>
				row.id === id
					? {
							...row,
							...updates,
						}
					: row,
			),
		);
	};

	const buildProtocol = (): CustomProtocolDefinition => {
		const now = new Date().toISOString();

		return {
			/*
					VID REDIGERING BEHÅLLER VI SAMMA ID.
					Annars skapas ett helt nytt.
				*/
			id: existingProtocol?.id ?? crypto.randomUUID(),

			name: name.trim(),

			category,

			description: description.trim(),

			rules: rules.trim(),

			playerMin,

			playerMax,

			winCondition,

			targetScore: winCondition === "target" ? targetScore : undefined,

			startScore,

			layout,

			initialRounds: layout === "rounds" ? initialRounds : 0,

			autoAddRounds: layout === "rounds" ? autoAddRounds : false,

			roundAllowNegative:
				layout === "rounds" ? roundAllowNegative : false,

			roundCompletionMode:
				layout === "rounds" ? roundCompletionMode : "allPlayers",

			rows:
				layout === "categories"
					? rows.map((row) => ({
							...row,

							name: row.name.trim(),

							description: row.description?.trim() ?? "",
						}))
					: [],

			turnOrder: {
				enabled: turnOrderEnabled,

				firstPlayerMode: turnOrderEnabled ? firstPlayerMode : "player1",

				rotateStartingPlayer: turnOrderEnabled
					? rotateStartingPlayer
					: false,
			},

			createdAt: existingProtocol?.createdAt ?? now,

			updatedAt: now,
		};
	};

	const saveProtocol = () => {
		if (!name.trim()) {
			return;
		}

		const saved = CustomProtocolService.save(buildProtocol());

		if (isEditing) {
			navigate("/custom-protocols");

			return;
		}

		setCreatedProtocolId(saved.id);
	};

	/*
		EFTER NYSKAPAT PROTOKOLL:
		Spela nu / Klar.

		Vid redigering visas inte den här
		skärmen, då går man direkt tillbaka.
	*/
	if (createdProtocolId && !isEditing) {
		return (
			<section className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.95)_0%,_rgba(219,239,226,0.96)_45%,_rgba(210,233,217,0.98)_100%)]">
				<div className="mx-auto flex min-h-screen w-full max-w-[620px] items-center px-4 py-8 sm:px-6">
					<div className="w-full rounded-[30px] border border-white/70 bg-white/75 p-6 text-center shadow-[0_14px_38px_rgba(0,0,0,0.06)] sm:p-9">
						<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white">
							<Check size={30} />
						</div>

						<p className="mt-6 text-xs font-black uppercase tracking-[0.12em] text-emerald-600">
							Protokollet är klart
						</p>

						<h1 className="mt-2 text-3xl font-black text-slate-950">
							{name}
						</h1>

						<p className="mt-3 text-sm leading-6 text-slate-500">
							Det är sparat under Egna protokoll. Vill du börja
							spela direkt?
						</p>

						<button
							type="button"
							onClick={() =>
								navigate(
									`/custom-protocol/${createdProtocolId}/players`,
								)
							}
							className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-4 font-black text-white transition hover:bg-emerald-600"
						>
							<Play size={19} fill="currentColor" />
							Spela nu
						</button>

						<button
							type="button"
							onClick={() => navigate("/custom-protocols")}
							className="mt-3 w-full rounded-full bg-slate-100 px-5 py-4 font-black text-slate-700 transition hover:bg-slate-200"
						>
							Klar
						</button>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.95)_0%,_rgba(219,239,226,0.96)_45%,_rgba(210,233,217,0.98)_100%)]">
			<div className="mx-auto w-full max-w-[820px] px-4 py-6 sm:px-6 sm:py-10">
				{/* HEADER */}
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() =>
							step === 0
								? navigate("/custom-protocols")
								: goBack()
						}
						className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 text-slate-700 shadow-sm"
					>
						<ChevronLeft size={20} />
					</button>

					<div>
						<p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-600">
							{isEditing ? "Redigera" : "Eget protokoll"}
						</p>

						<h1 className="text-2xl font-black text-slate-950 sm:text-3xl">
							{isEditing
								? `Redigera ${name || "protokoll"}`
								: "Skapa protokoll"}
						</h1>
					</div>
				</div>

				{/* PROGRESS */}
				<div className="mt-7">
					<div className="mb-2 flex justify-between text-xs">
						<span className="font-bold text-slate-500">
							Steg {step + 1} av {STEPS.length}
						</span>

						<span className="font-black text-slate-700">
							{STEPS[step]}
						</span>
					</div>

					<div className="h-2 overflow-hidden rounded-full bg-white/60">
						<div
							className="h-full rounded-full bg-emerald-500 transition-all"
							style={{
								width: `${((step + 1) / STEPS.length) * 100}%`,
							}}
						/>
					</div>
				</div>

				<div className="mt-6 rounded-[28px] border border-white/70 bg-white/70 p-5 shadow-[0_12px_35px_rgba(0,0,0,0.05)] sm:p-7">
					{/* STEP 1 */}
					{step === 0 && (
						<div>
							<h2 className="text-xl font-black text-slate-950">
								Grundinformation
							</h2>

							<Field label="Namn">
								<input
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="T.ex. Vårt familjespel"
									className={inputClass}
								/>
							</Field>

							<div className="mt-6">
								<p className="text-sm font-black text-slate-700">
									Kategori
								</p>

								<div className="mt-3 grid gap-3 sm:grid-cols-2">
									{categoryOptions.map((option) => (
										<ChoiceCard
											key={option.value}
											selected={category === option.value}
											title={option.label}
											description={option.description}
											onClick={() =>
												setCategory(option.value)
											}
										/>
									))}
								</div>
							</div>

							<Field label="Kort beskrivning">
								<textarea
									value={description}
									onChange={(e) =>
										setDescription(e.target.value)
									}
									rows={4}
									placeholder="Vad är det för spel?"
									className={`${inputClass} resize-none`}
								/>
							</Field>
						</div>
					)}

					{/* STEP 2 */}
					{step === 1 && (
						<div>
							<h2 className="text-xl font-black text-slate-950">
								Spelare & turordning
							</h2>

							<div className="mt-6 grid gap-4 sm:grid-cols-2">
								<NumberSelector
									label="Minst spelare"
									value={playerMin}
									min={1}
									max={playerMax}
									onChange={setPlayerMin}
								/>

								<NumberSelector
									label="Max spelare"
									value={playerMax}
									min={playerMin}
									max={12}
									onChange={setPlayerMax}
								/>
							</div>

							<div className="mt-6">
								<ChoiceCard
									selected={turnOrderEnabled}
									title="Turordningen spelar roll"
									description="Använd detta om spelarna behöver spela i en bestämd ordning."
									onClick={() =>
										setTurnOrderEnabled((value) => !value)
									}
								/>
							</div>

							{turnOrderEnabled && (
								<div className="mt-5 space-y-3 rounded-[20px] bg-slate-50 p-4">
									<p className="text-sm font-black text-slate-700">
										Vem börjar?
									</p>

									<ChoiceCard
										selected={firstPlayerMode === "player1"}
										title="Spelare 1"
										description="Den första spelaren i listan börjar alltid."
										onClick={() =>
											setFirstPlayerMode("player1")
										}
									/>

									<ChoiceCard
										selected={firstPlayerMode === "select"}
										title="Välj innan spelet"
										description="Fråga vem som börjar efter att spelarnamnen fyllts i."
										onClick={() =>
											setFirstPlayerMode("select")
										}
									/>

									<ChoiceCard
										selected={firstPlayerMode === "random"}
										title="Slumpa"
										description="Scorely väljer en startspelare slumpmässigt."
										onClick={() =>
											setFirstPlayerMode("random")
										}
									/>

									<ChoiceCard
										selected={rotateStartingPlayer}
										title="Nästa spelare börjar nästa runda"
										description="Startspelaren flyttas ett steg efter varje avslutad runda."
										onClick={() =>
											setRotateStartingPlayer(
												(value) => !value,
											)
										}
									/>
								</div>
							)}
						</div>
					)}

					{/* STEP 3 */}
					{step === 2 && (
						<div>
							<h2 className="text-xl font-black text-slate-950">
								Poäng & vinnare
							</h2>

							<div className="mt-6 space-y-3">
								<ChoiceCard
									selected={winCondition === "highest"}
									title="Högst poäng vinner"
									description="Passar spel där flest poäng är bäst."
									onClick={() => setWinCondition("highest")}
								/>

								<ChoiceCard
									selected={winCondition === "lowest"}
									title="Lägst poäng vinner"
									description="Passar exempelvis golf."
									onClick={() => setWinCondition("lowest")}
								/>

								<ChoiceCard
									selected={winCondition === "target"}
									title="Först till en viss poäng"
									description="Spelet avslutas automatiskt när någon når målpoängen."
									onClick={() => setWinCondition("target")}
								/>
							</div>

							{winCondition === "target" && (
								<Field label="Målpoäng">
									<input
										type="number"
										min={1}
										value={targetScore}
										onChange={(e) =>
											setTargetScore(
												Math.max(
													1,
													Number(e.target.value),
												),
											)
										}
										className={inputClass}
									/>
								</Field>
							)}

							<Field label="Startpoäng">
								<input
									type="number"
									value={startScore}
									onChange={(e) =>
										setStartScore(Number(e.target.value))
									}
									className={inputClass}
								/>
							</Field>
						</div>
					)}

					{/* STEP 4 */}
					{step === 3 && (
						<div>
							<h2 className="text-xl font-black text-slate-950">
								Hur ska protokollet fungera?
							</h2>

							<div className="mt-6 grid gap-3 sm:grid-cols-2">
								<ChoiceCard
									selected={layout === "rounds"}
									title="Rundbaserat"
									description="Runda 1, Runda 2, Runda 3 ..."
									onClick={() => setLayout("rounds")}
								/>

								<ChoiceCard
									selected={layout === "categories"}
									title="Kategorier"
									description="Egna namngivna rader, som Yatzy."
									onClick={() => setLayout("categories")}
								/>
							</div>

							{layout === "rounds" ? (
								<div className="mt-6 space-y-4">
									<NumberSelector
										label="Rader från start"
										value={initialRounds}
										min={1}
										max={50}
										onChange={setInitialRounds}
									/>

									<ChoiceCard
										selected={autoAddRounds}
										title="Lägg till nya rundor automatiskt"
										description="En ny rad skapas när den sista används."
										onClick={() =>
											setAutoAddRounds((value) => !value)
										}
									/>

									<ChoiceCard
										selected={roundAllowNegative}
										title="Poängen ska dras av"
										description="Om du skriver 4 registrerar Scorely −4 poäng."
										onClick={() =>
											setRoundAllowNegative(
												(value) => !value,
											)
										}
									/>

									<p className="pt-2 text-sm font-black text-slate-700">
										När räknas en runda som klar?
									</p>

									<ChoiceCard
										selected={
											roundCompletionMode === "allPlayers"
										}
										title="Alla spelare måste fylla i"
										description="Nästa runda skapas först när alla har ett resultat."
										onClick={() =>
											setRoundCompletionMode("allPlayers")
										}
									/>

									<ChoiceCard
										selected={
											roundCompletionMode ===
											"independent"
										}
										title="Spelarna är oberoende"
										description="Ny rad kan skapas så fort någon använder sista raden."
										onClick={() =>
											setRoundCompletionMode(
												"independent",
											)
										}
									/>
								</div>
							) : (
								<div className="mt-6 space-y-3">
									{rows.map((row, index) => (
										<div
											key={row.id}
											className="rounded-[20px] border border-slate-200 bg-white p-4"
										>
											<div className="flex items-center justify-between">
												<span className="text-xs font-black uppercase text-slate-400">
													Rad {index + 1}
												</span>

												<button
													type="button"
													onClick={() =>
														setRows((prev) =>
															prev.filter(
																(item) =>
																	item.id !==
																	row.id,
															),
														)
													}
													className="text-rose-500"
												>
													<Trash2 size={17} />
												</button>
											</div>

											<input
												value={row.name}
												onChange={(e) =>
													updateRow(row.id, {
														name: e.target.value,
													})
												}
												placeholder="Namn"
												className={`${inputClass} mt-3`}
											/>

											<input
												value={row.description ?? ""}
												onChange={(e) =>
													updateRow(row.id, {
														description:
															e.target.value,
													})
												}
												placeholder="Hjälptext, valfritt"
												className={`${inputClass} mt-2`}
											/>

											<button
												type="button"
												onClick={() =>
													updateRow(row.id, {
														allowNegative:
															!row.allowNegative,
													})
												}
												className={`mt-3 flex w-full items-center justify-between rounded-[14px] border px-4 py-3 text-left ${
													row.allowNegative
														? "border-rose-200 bg-rose-50"
														: "border-slate-200 bg-slate-50"
												}`}
											>
												<div>
													<p
														className={`text-sm font-black ${
															row.allowNegative
																? "text-rose-700"
																: "text-slate-700"
														}`}
													>
														Poängen ska dras av
													</p>

													<p className="mt-1 text-xs text-slate-500">
														Skriver du exempelvis 4
														räknas det som −4.
													</p>
												</div>

												<div
													className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
														row.allowNegative
															? "bg-rose-500 text-white"
															: "bg-slate-200 text-transparent"
													}`}
												>
													<Check size={14} />
												</div>
											</button>
										</div>
									))}

									<button
										type="button"
										onClick={() =>
											setRows((prev) => [
												...prev,
												createEmptyRow(prev.length),
											])
										}
										className="flex w-full items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-emerald-300 bg-emerald-50/50 px-4 py-4 font-black text-emerald-700"
									>
										<Plus size={18} />
										Lägg till kategori
									</button>
								</div>
							)}
						</div>
					)}

					{/* STEP 5 */}
					{step === 4 && (
						<div>
							<h2 className="text-xl font-black text-slate-950">
								Regler
							</h2>

							<p className="mt-2 text-sm text-slate-500">
								Reglerna kan öppnas medan ni spelar.
							</p>

							<textarea
								value={rules}
								onChange={(e) => setRules(e.target.value)}
								rows={12}
								placeholder="Skriv reglerna här..."
								className={`${inputClass} mt-6 resize-none leading-6`}
							/>
						</div>
					)}

					{/* STEP 6 */}
					{step === 5 && (
						<div>
							<p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-600">
								Förhandsgranskning
							</p>

							<h2 className="mt-1 text-2xl font-black text-slate-950">
								{name || "Namnlöst protokoll"}
							</h2>

							<p className="mt-1 text-sm text-slate-500">
								{categoryLabel} · {playerMin}–{playerMax}{" "}
								spelare
							</p>

							{description && (
								<p className="mt-3 text-sm leading-6 text-slate-600">
									{description}
								</p>
							)}

							<div className="mt-6 grid gap-3 sm:grid-cols-2">
								<Summary
									title="Vinnare"
									text={
										winCondition === "highest"
											? "Högst poäng"
											: winCondition === "lowest"
												? "Lägst poäng"
												: `Först till ${targetScore}`
									}
								/>

								<Summary
									title="Layout"
									text={
										layout === "rounds"
											? "Rundbaserat"
											: "Kategorier"
									}
								/>

								<Summary
									title="Turordning"
									text={
										!turnOrderEnabled
											? "Ingen bestämd turordning"
											: firstPlayerMode === "player1"
												? "Spelare 1 börjar"
												: firstPlayerMode === "select"
													? "Startspelare väljs"
													: "Startspelare slumpas"
									}
								/>

								<Summary
									title="Startpoäng"
									text={String(startScore)}
								/>
							</div>

							{layout === "categories" && (
								<div className="mt-6 overflow-hidden rounded-[20px] border border-slate-200 bg-white">
									{rows.map((row) => (
										<div
											key={row.id}
											className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0"
										>
											<div>
												<p className="font-black text-slate-800">
													{row.name}
												</p>

												{row.description && (
													<p className="mt-0.5 text-xs text-slate-400">
														{row.description}
													</p>
												)}
											</div>

											<span
												className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
													row.allowNegative
														? "bg-rose-100 text-rose-600"
														: "bg-emerald-100 text-emerald-600"
												}`}
											>
												{row.allowNegative
													? "− poäng"
													: "+ poäng"}
											</span>
										</div>
									))}
								</div>
							)}
						</div>
					)}

					{error && (
						<div className="mt-5 rounded-[16px] bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600">
							{error}
						</div>
					)}

					<div className="mt-7 flex gap-3">
						{step > 0 && (
							<button
								type="button"
								onClick={goBack}
								className="flex items-center gap-2 rounded-full bg-slate-100 px-5 py-3.5 font-black text-slate-700"
							>
								<ArrowLeft size={18} />
								Tillbaka
							</button>
						)}

						{step < STEPS.length - 1 ? (
							<button
								type="button"
								onClick={goNext}
								className="flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3.5 font-black text-white"
							>
								Fortsätt
								<ArrowRight size={18} />
							</button>
						) : (
							<button
								type="button"
								onClick={saveProtocol}
								className="flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3.5 font-black text-white"
							>
								<Check size={18} />

								{isEditing
									? "Spara ändringar"
									: "Skapa protokoll"}
							</button>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}

function Field({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="mt-6">
			<label className="mb-2 block text-sm font-black text-slate-700">
				{label}
			</label>

			{children}
		</div>
	);
}

function NumberSelector({
	label,
	value,
	min,
	max,
	onChange,
}: {
	label: string;
	value: number;
	min: number;
	max: number;
	onChange: (value: number) => void;
}) {
	return (
		<div className="rounded-[20px] border border-slate-200 bg-white p-4">
			<p className="text-sm font-black text-slate-700">{label}</p>

			<div className="mt-4 flex items-center justify-between">
				<button
					type="button"
					onClick={() => onChange(Math.max(min, value - 1))}
					disabled={value <= min}
					className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 disabled:opacity-30"
				>
					<Minus size={18} />
				</button>

				<span className="text-3xl font-black">{value}</span>

				<button
					type="button"
					onClick={() => onChange(Math.min(max, value + 1))}
					disabled={value >= max}
					className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 disabled:opacity-30"
				>
					<Plus size={18} />
				</button>
			</div>
		</div>
	);
}

function ChoiceCard({
	selected,
	title,
	description,
	onClick,
}: {
	selected: boolean;
	title: string;
	description: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`flex w-full items-center justify-between gap-4 rounded-[18px] border p-4 text-left transition ${
				selected
					? "border-emerald-400 bg-emerald-50"
					: "border-slate-200 bg-white hover:bg-slate-50"
			}`}
		>
			<div>
				<p className="font-black text-slate-900">{title}</p>

				<p className="mt-1 text-xs leading-5 text-slate-500">
					{description}
				</p>
			</div>

			<div
				className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
					selected
						? "bg-emerald-500 text-white"
						: "bg-slate-100 text-transparent"
				}`}
			>
				<Check size={14} />
			</div>
		</button>
	);
}

function Summary({ title, text }: { title: string; text: string }) {
	return (
		<div className="rounded-[18px] bg-slate-50 p-4">
			<p className="text-xs font-black uppercase text-slate-400">
				{title}
			</p>

			<p className="mt-1 font-bold text-slate-800">{text}</p>
		</div>
	);
}
