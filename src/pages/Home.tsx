// import { games } from "../data/games";
// import type { Game } from "../types/game";
// import { useState } from "react";
// import GameList from "../components/GameList";
// // import Button from "../components/Button";
// import { useNavigate } from "react-router-dom";
// import MenuCard from "../components/MenuCard";
// import { Archive, Circle, Dice5, Spade } from "lucide-react";

// export default function Home() {
// 	const navigate = useNavigate();

// 	const [selectedCategory, setSelectedCategory] = useState<
// 		null | Game["category"]
// 	>(null);

// 	const filteredGames = selectedCategory
// 		? games.filter((game) => game.category === selectedCategory)
// 		: [];

// 	return (
// 		// <section className="w-full px-4 py-16 sm:py-20 md:py-24 ">
// 		// 	<div className="max-w-screen-md mx-auto text-center">
// 		// 		<img
// 		// 			src="./logo.png"
// 		// 			alt="Scorely Logo"
// 		// 			className="mx-auto w-64 sm:w-72 md:w-96 mb-4"
// 		// 		/>

// 		// 		<div className="flex flex-wrap justify-center">
// 		// 			<Button
// 		// 				text="Kortspel"
// 		// 				color="primary"
// 		// 				onClick={() => setSelectedCategory("kortspel")}
// 		// 			/>
// 		// 			<Button
// 		// 				text="Golf"
// 		// 				color="secondary"
// 		// 				onClick={() => setSelectedCategory("golf")}
// 		// 			/>
// 		// 			<Button
// 		// 				text="Tärningsspel"
// 		// 				color="danger"
// 		// 				onClick={() => setSelectedCategory("tärningsspel")}
// 		// 			/>

// 		// 			<Button
// 		// 				text="Se sparade protokoll"
// 		// 				color="primary"
// 		// 				onClick={() => navigate("/saved-protocols")}
// 		// 			/>
// 		// 		</div>

// 		// 		{selectedCategory && (
// 		// 			<GameList
// 		// 				games={filteredGames}
// 		// 				category={selectedCategory}
// 		// 			/>
// 		// 		)}
// 		// 	</div>
// 		// </section>

// 		<section className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.95)_0%,_rgba(219,239,226,0.96)_45%,_rgba(210,233,217,0.98)_100%)]">
// 			<div className="flex min-h-screen w-full items-start justify-center px-6 py-10 md:px-10 md:py-14">
// 				<div className="flex w-full max-w-[560px] flex-col items-center">
// 					<img
// 						src="./logo.png"
// 						alt="Scorely Logo"
// 						className="mx-auto mb-4 w-[120px] md:mb-5 md:w-[138px]"
// 					/>

// 					<h1 className="text-center text-[4rem] font-black leading-none tracking-[-0.04em] text-slate-950 md:text-[4.4rem]">
// 						Scorely
// 					</h1>

// 					<p className="mt-3 text-center text-[1rem] font-medium text-slate-500 md:text-[1.05rem]">
// 						Ditt digitala protokoll för alla spel
// 					</p>

// 					<div className="mt-11 w-full space-y-4">
// 						<MenuCard
// 							text="Kortspel"
// 							icon={Spade}
// 							iconBg="bg-emerald-500"
// 							onClick={() => setSelectedCategory("kortspel")}
// 						/>

// 						<MenuCard
// 							text="Golf"
// 							icon={Circle}
// 							iconBg="bg-amber-400"
// 							onClick={() => setSelectedCategory("golf")}
// 						/>

// 						<MenuCard
// 							text="Tärningsspel"
// 							icon={Dice5}
// 							iconBg="bg-pink-500"
// 							onClick={() => setSelectedCategory("tärningsspel")}
// 						/>
// 					</div>

// 					<div className="my-8 h-px w-full bg-[#c9ddd1] " />

// 					<div className="w-full">
// 						<MenuCard
// 							text="Se sparade protokoll"
// 							icon={Archive}
// 							iconBg="bg-slate-200"
// 							onClick={() => navigate("/saved-protocols")}
// 						/>
// 					</div>

// 					{selectedCategory && (
// 						<div className="mt-7 w-full rounded-[22px] bg-white/70 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)] backdrop-blur-[2px]">
// 							<GameList
// 								games={filteredGames}
// 								category={selectedCategory}
// 							/>
// 						</div>
// 					)}
// 				</div>
// 			</div>
// 		</section>
// 	);
// }

import { games } from "../data/games";
import type { Game } from "../types/game";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MenuCard from "../components/MenuCard";
import { Archive, Circle, Dice5, Spade } from "lucide-react";
import { useGameSession } from "../context/GameSessionContext";
import TrophyIcon from "../components/TrophyIcon";

export default function Home() {
	const navigate = useNavigate();
	const { setSession } = useGameSession();

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
			icon: Circle,
			iconBg: "bg-amber-400",
		},
		{
			key: "tärningsspel",
			text: "Tärningsspel",
			icon: Dice5,
			iconBg: "bg-pink-500",
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
						style={{ animationDelay: "0.1s" }}
					>
						<h1 className="font-heading text-5xl font-extrabold tracking-tight">
							Scorely
						</h1>
						<p className="mt-3 text-sm text-slate-500 md:text-base">
							Ditt digitala protokoll för alla spel
						</p>
					</div>

					<div className="mt-11 w-full space-y-4">
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
														className="w-full cursor-pointer rounded-[18px] border border-[#d8e3dc] bg-white/80 px-5 py-5 text-left shadow-[0_4px_18px_rgba(0,0,0,0.03)] transition duration-200 hover:-translate-y-0.5 hover:bg-white"
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