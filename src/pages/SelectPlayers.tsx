import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGameSession } from "../context/GameSessionContext";
import { ArrowLeft, Minus, Plus, User } from "lucide-react";

export default function SelectPlayers() {
	const { session, setSession } = useGameSession();
	const navigate = useNavigate();

	const game = session?.game;
	const min = game?.minPlayers ?? 2;
	const max = game?.maxPlayers ?? 6;

	const [count, setCount] = useState<number>(min);
	const [names, setNames] = useState<string[]>(Array(min).fill(""));
	const [error, setError] = useState("");

	useEffect(() => {
		if (!game) return;
		setCount(game.minPlayers ?? 2);
	}, [game]);

	useEffect(() => {
		setNames((prev) => {
			const updated = [...prev];

			while (updated.length < count) {
				updated.push("");
			}

			while (updated.length > count) {
				updated.pop();
			}

			return updated;
		});
	}, [count]);

	if (!game) {
		return (
			<section className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.95)_0%,_rgba(219,239,226,0.96)_45%,_rgba(210,233,217,0.98)_100%)]">
				<div className="mx-auto flex min-h-screen max-w-[640px] flex-col px-6 py-10 md:px-10 md:py-14">
					<button
						onClick={() => navigate("/")}
						className="mb-10 flex w-fit items-center gap-2 text-slate-500 transition hover:text-slate-800"
					>
						<ArrowLeft size={24} />
						<span className="text-[1.1rem] font-medium">
							Tillbaka
						</span>
					</button>

					<div className="rounded-[28px] bg-white/55 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
						<p className="text-center text-lg text-slate-700">
							Inget spel valt.
						</p>

						<button
							onClick={() => navigate("/")}
							className="mx-auto mt-6 block rounded-full bg-emerald-500 px-6 py-3 font-semibold text-white transition hover:opacity-90"
						>
							Gå tillbaka
						</button>
					</div>
				</div>
			</section>
		);
	}

	const decreaseCount = () => {
		setError("");
		setCount((prev) => Math.max(min, prev - 1));
	};

	const increaseCount = () => {
		setError("");
		setCount((prev) => Math.min(max, prev + 1));
	};

	const handleNameChange = (index: number, value: string) => {
		setNames((prev) => {
			const updated = [...prev];
			updated[index] = value;
			return updated;
		});
	};

	const handleContinue = () => {
		if (count < min || count > max) {
			setError(`Antal spelare måste vara mellan ${min} och ${max}.`);
			return;
		}

		const trimmedNames = names.map((name) => name.trim());

		if (trimmedNames.some((name) => !name)) {
			setError("Fyll i namn för alla spelare.");
			return;
		}

		const players = trimmedNames.map((name) => ({
			name,
			scores: [],
		}));

	
		setSession({
			...session,

			game,

			players,

			protocolId: crypto.randomUUID(),

			protocolCreatedAt: new Date().toISOString(),

			status: "active",
		});

		const gameRoutes: Record<string, string> = {
			chicago: "/game/chicago",
			"500": "/game/500",
			plump: "/game/plump",
			jazz: "/game/jazz",
			trebeller: "/game/trebeller",
			discgolf: "/game/discgolf",
			"10000": "/game/10000",
			golf: "/game/golf",
			yatzy: "/game/yatzy",
			"gigant-yatzy": "/game/gigant-yatzy",
			"4-manswhist": "/game/4-manswhist",
			"2-manswhist": "/game/2-manswhist",
		};

		const nextRoute = gameRoutes[String(game.id)];

		if (!nextRoute) {
			setError("Spelet stöds inte än.");
			return;
		}

		navigate(nextRoute);
	};

	return (
		<section className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.95)_0%,_rgba(219,239,226,0.96)_45%,_rgba(210,233,217,0.98)_100%)]">
			<div className="mx-auto flex min-h-screen max-w-[640px] flex-col px-6 py-10 md:px-10 md:py-14">
				<button
					onClick={() => navigate(-1)}
					className="mb-10 flex w-fit items-center gap-2 text-slate-500 transition hover:text-slate-800"
				>
					<ArrowLeft size={24} />
					<span className="text-[1.1rem] font-medium">Tillbaka</span>
				</button>

				<div className="mx-auto w-full max-w-[560px] rounded-[30px] bg-white/55 px-8 py-10 shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-[2px] md:px-10 md:py-11">
					<h1 className="text-center text-[2.2rem] font-black leading-tight text-slate-950">
						{game.name}
					</h1>

					<p className="mt-2 text-center text-[1.05rem] text-slate-500">
						Välj antal spelare
					</p>

					<div className="mt-10 flex items-center justify-center gap-5">
						<button
							type="button"
							onClick={decreaseCount}
							disabled={count <= min}
							className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-slate-200 text-slate-700 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<Minus size={24} />
						</button>

						<div className="flex h-[80px] w-[80px] items-center justify-center rounded-[20px] bg-emerald-500 text-[2rem] font-bold text-white shadow-[0_8px_20px_rgba(16,185,129,0.22)]">
							{count}
						</div>

						<button
							type="button"
							onClick={increaseCount}
							disabled={count >= max}
							className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-slate-200 text-slate-700 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<Plus size={24} />
						</button>
					</div>

					<p className="mt-7 text-center text-[1rem] text-slate-500">
						{min}–{max} spelare
					</p>

					<div className="mt-10 space-y-4">
						{names.map((name, index) => (
							<div
								key={index}
								className="flex items-center gap-3 rounded-[18px] border border-[#d6e1da] bg-white/75 px-5 py-4"
							>
								<User
									size={18}
									className="shrink-0 text-slate-300"
								/>

								<input
									type="text"
									value={name}
									onChange={(e) =>
										handleNameChange(index, e.target.value)
									}
									placeholder={`Spelare ${index + 1}`}
									className="w-full bg-transparent text-[1.05rem] text-slate-800 outline-none placeholder:text-slate-500"
								/>
							</div>
						))}
					</div>

					{error && (
						<p className="mt-4 text-center text-sm font-medium text-red-600">
							{error}
						</p>
					)}

					<button
						type="button"
						onClick={handleContinue}
						className="mt-10 w-full rounded-full bg-amber-400 px-6 py-3.5 text-[1.05rem] font-bold text-slate-900 transition hover:brightness-95"
					>
						Fortsätt
					</button>
				</div>
			</div>
		</section>
	);
}