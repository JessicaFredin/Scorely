import { games } from "../data/games";
import type { Game } from "../types/game";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuCard from "../components/MenuCard";
import { Archive, Target, Dice5, Spade, Settings, Play } from "lucide-react";
import { useGameSession } from "../context/GameSessionContext";
import TrophyIcon from "../components/TrophyIcon";

export default function Home() {
	const navigate = useNavigate();

	const { session, setSession } = useGameSession();

	const [selectedCategory, setSelectedCategory] = useState<
		null | Game["category"]
	>(null);

	const toggleCategory = (category: Game["category"]) => {
		setSelectedCategory((prev) => (prev === category ? null : category));
	};

	const handleGameSelect = (game: Game) => {
		setSession({
			game,
			players: [],
		});

		navigate("/select-players");
	};

	const canResumeGame = Boolean(
		session?.game && session.players && session.players.length > 0,
	);

	const handleResumeGame = () => {
		if (!session?.game || session.players.length === 0) {
			return;
		}

		navigate(`/game/${String(session.game.id).toLowerCase()}`);
	};

	const categories: {
		key: Game["category"];
		text: string;
		icon: typeof Spade;
		iconBg: string;
	}[] = [
		{
			key: "kortspel",
			text: "Kortspel",
			icon: Spade,
			iconBg: "bg-emerald-500",
		},
		{
			key: "golf",
			text: "Golf",
			icon: Target,
			iconBg: "bg-amber-400",
		},
		{
			key: "tärningsspel",
			text: "Tärningsspel",
			icon: Dice5,
			iconBg: "bg-pink-500",
		},
		{
			key: "anpassat",
			text: "Anpassat",
			icon: Settings,
			iconBg: "bg-slate-200",
		},
	];

	return (
		<section className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.95)_0%,_rgba(219,239,226,0.96)_45%,_rgba(210,233,217,0.98)_100%)]">
			<div className="flex min-h-screen w-full justify-center px-6 py-10 md:px-10 md:py-14">
				<div className="flex w-full max-w-[580px] flex-col items-center">
					<div className="animate-fade-in-up">
						<TrophyIcon />
					</div>

					<div
						className="animate-fade-in-up text-center"
						style={{
							animationDelay: "0.1s",
						}}
					>
						<h1 className="font-heading text-5xl font-extrabold tracking-tight">
							Scorely
						</h1>

						<p className="mt-3 text-sm text-slate-500 md:text-base">
							Ditt digitala protokoll för alla spel
						</p>
					</div>

					{/* PÅGÅENDE SPEL */}
					{canResumeGame && (
						<div className="mt-10 w-full">
							<button
								type="button"
								onClick={handleResumeGame}
								className="
									flex
									w-full
									items-center
									gap-4
									rounded-[22px]
									border
									border-emerald-200/80
									bg-white/75
									px-5
									py-5
									text-left
									shadow-[0_8px_24px_rgba(0,0,0,0.04)]
									transition
									hover:-translate-y-0.5
									hover:bg-white
								"
							>
								<div
									className="
										flex
										h-12
										w-12
										shrink-0
										items-center
										justify-center
										rounded-[16px]
										bg-emerald-500
										text-white
									"
								>
									<Play size={22} fill="currentColor" />
								</div>

								<div className="min-w-0 flex-1">
									<p
										className="
											text-xs
											font-bold
											uppercase
											tracking-[0.12em]
											text-emerald-600
										"
									>
										Pågående spel
									</p>

									<p
										className="
											mt-1
											truncate
											text-[1.05rem]
											font-black
											text-slate-900
											md:text-[1.15rem]
										"
									>
										Fortsätt {session?.game.name}
									</p>

									<p
										className="
											mt-1
											truncate
											text-sm
											text-slate-500
										"
									>
										{session?.players
											.map((player) => player.name)
											.join(", ")}
									</p>
								</div>
							</button>
						</div>
					)}

					{/* SPELKATEGORIER */}
					<div
						className={`${
							canResumeGame ? "mt-6" : "mt-11"
						} w-full space-y-4`}
					>
						{categories.map((category) => {
							const isOpen = selectedCategory === category.key;

							const categoryGames = games.filter(
								(game) => game.category === category.key,
							);

							return (
								<div key={category.key} className="w-full">
									<MenuCard
										text={category.text}
										icon={category.icon}
										iconBg={category.iconBg}
										onClick={() =>
											toggleCategory(category.key)
										}
									/>

									{isOpen && (
										<div className="mt-3 rounded-[22px] bg-white/35 p-4 md:p-5">
											<div className="space-y-3">
												{categoryGames.map((game) => (
													<button
														key={game.name}
														onClick={() =>
															handleGameSelect(
																game,
															)
														}
														className="
																	w-full
																	cursor-pointer
																	rounded-[18px]
																	border
																	border-[#d8e3dc]
																	bg-white/80
																	px-5
																	py-5
																	text-left
																	shadow-[0_4px_18px_rgba(0,0,0,0.03)]
																	transition
																	duration-200
																	hover:-translate-y-0.5
																	hover:bg-white
																"
													>
														<p className="text-[1.05rem] font-semibold text-slate-900 md:text-[1.15rem]">
															{game.name}
														</p>

														<p className="mt-2 text-[0.98rem] leading-7 text-slate-500">
															{game.description}
														</p>
													</button>
												))}
											</div>
										</div>
									)}
								</div>
							);
						})}
					</div>

					<div className="my-8 h-px w-full bg-[#c9ddd1]" />

					<div className="w-full">
						<MenuCard
							text="Se sparade protokoll"
							icon={Archive}
							iconBg="bg-slate-200"
							onClick={() => navigate("/saved-protocols")}
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
