import { useState } from "react";

import { useNavigate } from "react-router-dom";

import {
	Archive,
	Dice5,
	Play,
	Save,
	Settings,
	Spade,
	Target,
	Trash2,
	X,
} from "lucide-react";

import MenuCard from "../components/MenuCard";
import TrophyIcon from "../components/TrophyIcon";

import { useGameSession } from "../context/GameSessionContext";

import { games } from "../data/games";
import { protocolRegistry } from "../data/protocolRegistry";

import { ProtocolService } from "../services/ProtocolService";
import { CustomGameService } from "../services/CustomGameService";

import type { Game } from "../types/game";
import type { SavedProtocol } from "../types/savedProtocol";

import { readGameValues, removeGameValues } from "../utils/gameStorage";

export default function Home() {
	const navigate = useNavigate();

	const { session, setSession } = useGameSession();

	const [selectedCategory, setSelectedCategory] = useState<
		null | Game["category"]
	>(null);

	const [pendingGame, setPendingGame] = useState<Game | null>(null);

	/*
		=====================================================
		CUSTOM GAME
		=====================================================
	*/

	const activeCustomGame = CustomGameService.getActiveGame();

	const hasActiveCustomGame = Boolean(activeCustomGame);

	/*
		=====================================================
		REGULAR GAME
		=====================================================

		Om ett custom-spel är aktivt ska det gamla
		GameSessionContext-spelet INTE visas som aktivt.

		Det här är viktigt eftersom ett gammalt
		"Egen poängtavla"-session annars kan ligga kvar.
	*/

	const hasActiveRegularGame = Boolean(
		!activeCustomGame &&
		session?.game &&
		session.players.length > 0 &&
		session.status !== "finished",
	);

	const hasFinishedRegularGame = Boolean(
		session?.game &&
		session.players.length > 0 &&
		session.status === "finished",
	);

	const hasAnyActiveGame = hasActiveCustomGame || hasActiveRegularGame;

	/*
		=====================================================
		CATEGORIES
		=====================================================
	*/

	const toggleCategory = (category: Game["category"]) => {
		setSelectedCategory((prev) => (prev === category ? null : category));
	};

	/*
		=====================================================
		START REGULAR GAME
		=====================================================
	*/

	const startGame = (game: Game) => {
		/*
			Om vi lämnar ett custom-spel för att
			starta ett vanligt spel ska custom-spelet
			inte längre ligga som "aktivt".

			Matchen ligger däremot fortfarande sparad
			i CustomGameService.
		*/

		CustomGameService.clearActiveGame();

		setSession({
			game,
			players: [],
			status: "active",
		});

		navigate("/select-players");
	};

	const handleGameSelect = (game: Game) => {
		/*
			Om NÅGOT spel redan pågår – custom
			eller vanligt – frågar vi först.
		*/

		if (hasAnyActiveGame) {
			setPendingGame(game);

			return;
		}

		/*
			Om ett gammalt vanligt spel är färdigt
			kan dess tillfälliga localStorage tas bort.
		*/

		if (
			hasFinishedRegularGame &&
			session?.game &&
			session.players.length > 0
		) {
			removeGameValues(session.game, session.players);
		}

		startGame(game);
	};

	/*
		=====================================================
		RESUME
		=====================================================
	*/

	const handleResumeRegularGame = () => {
		if (!session?.game || session.players.length === 0) {
			return;
		}

		navigate(`/game/${String(session.game.id).toLowerCase()}`);
	};

	const handleResumeCustomGame = () => {
		if (!activeCustomGame) {
			return;
		}

		navigate(`/custom-match/${activeCustomGame.id}`);
	};

	/*
		=====================================================
		SAVE REGULAR GAME
		=====================================================
	*/

	const saveCurrentRegularGameAsProtocol = () => {
		if (!session?.game || session.players.length === 0) {
			return;
		}

		const gameId = String(session.game.id).toLowerCase();

		const protocolEntry = protocolRegistry[gameId];

		if (!protocolEntry) {
			return;
		}

		const values =
			readGameValues(session.game, session.players) ??
			protocolEntry.createInitialValues(session.players.length);

		const now = new Date().toISOString();

		const protocol: SavedProtocol = {
			id: session.protocolId ?? crypto.randomUUID(),

			gameId: String(session.game.id),

			gameName: session.game.name,

			gameType: session.game.id as SavedProtocol["gameType"],

			category: session.game.category,

			players: session.players.map((player) => ({
				name: player.name,
			})),

			values,

			createdAt: session.protocolCreatedAt ?? now,

			updatedAt: now,

			status: "Pågående",

			winnerName: null,

			route: `/game/${gameId}`,
		};

		ProtocolService.save(protocol);
	};

	/*
		=====================================================
		START NEW – SAVE OLD
		=====================================================
	*/

	const handleSaveAndStartNew = () => {
		if (!pendingGame) {
			return;
		}

		/*
				CUSTOM GAME

				Custom-spelet autosparas redan efter varje
				ändring. Därför behöver vi bara markera att
				det inte längre är det aktiva spelet.

				Vi TAR INTE BORT matchen.
			*/

		if (activeCustomGame) {
			CustomGameService.save({
				...activeCustomGame,

				updatedAt: new Date().toISOString(),
			});

			CustomGameService.clearActiveGame();
		}

		/*
				REGULAR GAME
			*/

		if (
			!activeCustomGame &&
			session?.game &&
			session.players.length > 0 &&
			session.status !== "finished"
		) {
			saveCurrentRegularGameAsProtocol();

			removeGameValues(session.game, session.players);
		}

		const game = pendingGame;

		setPendingGame(null);

		startGame(game);
	};

	/*
		=====================================================
		START NEW – DISCARD OLD
		=====================================================
	*/

	const handleDiscardAndStartNew = () => {
		if (!pendingGame) {
			return;
		}

		/*
				Om custom-spelet överges ska själva
				pågående matchen tas bort.

				Den skapade PROTOKOLLMALLEN finns fortfarande
				kvar under "Egna protokoll".
			*/

		if (activeCustomGame) {
			CustomGameService.delete(activeCustomGame.id);

			CustomGameService.clearActiveGame();
		}

		/*
				Gammalt vanligt spel:
				ta bort tillfällig autosave.
			*/

		if (!activeCustomGame && session?.game && session.players.length > 0) {
			removeGameValues(session.game, session.players);
		}

		const game = pendingGame;

		setPendingGame(null);

		startGame(game);
	};

	/*
		=====================================================
		CATEGORIES
		=====================================================
	*/

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

	/*
		=====================================================
		MODAL INFO
		=====================================================
	*/

	const currentGameName = activeCustomGame
		? activeCustomGame.protocol.name
		: (session?.game?.name ?? "spelet");

	return (
		<>
			<section className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.95)_0%,_rgba(219,239,226,0.96)_45%,_rgba(210,233,217,0.98)_100%)]">
				<div className="flex min-h-screen w-full justify-center px-6 py-10 md:px-10 md:py-14">
					<div className="flex w-full max-w-[580px] flex-col items-center">
						{/* LOGO */}

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

						{/* =================================================
						    ACTIVE CUSTOM GAME
						================================================= */}

						{activeCustomGame && (
							<div className="mt-10 w-full">
								<button
									type="button"
									onClick={handleResumeCustomGame}
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
										<p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-600">
											Pågående spel
										</p>

										<p className="mt-1 truncate text-[1.05rem] font-black text-slate-900 md:text-[1.15rem]">
											Fortsätt{" "}
											{activeCustomGame.protocol.name}
										</p>

										<p className="mt-1 truncate text-sm text-slate-500">
											{activeCustomGame.players
												.map((player) => player.name)
												.join(", ")}
										</p>
									</div>
								</button>
							</div>
						)}

						{/* =================================================
						    ACTIVE REGULAR GAME

						    VISAS ALDRIG samtidigt som custom game.
						================================================= */}

						{hasActiveRegularGame && session && (
							<div className="mt-10 w-full">
								<button
									type="button"
									onClick={handleResumeRegularGame}
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
										<p className="text-xs font-bold uppercase tracking-[0.12em] text-emerald-600">
											Pågående spel
										</p>

										<p className="mt-1 truncate text-[1.05rem] font-black text-slate-900 md:text-[1.15rem]">
											Fortsätt {session.game.name}
										</p>

										<p className="mt-1 truncate text-sm text-slate-500">
											{session.players
												.map((player) => player.name)
												.join(", ")}
										</p>
									</div>
								</button>
							</div>
						)}

						{/* =================================================
						    CATEGORIES
						================================================= */}

						<div
							className={`${
								hasAnyActiveGame ? "mt-6" : "mt-11"
							} w-full space-y-4`}
						>
							{categories.map((category) => {
								const isOpen =
									selectedCategory === category.key;

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
												category.key === "anpassat"
													? navigate(
															"/custom-protocols",
														)
													: toggleCategory(
															category.key,
														)
											}
										/>

										{isOpen &&
											category.key !== "anpassat" && (
												<div className="mt-3 rounded-[22px] bg-white/35 p-4 md:p-5">
													<div className="space-y-3">
														{categoryGames.map(
															(game) => (
																<button
																	key={
																		game.name
																	}
																	type="button"
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
																		{
																			game.name
																		}
																	</p>

																	<p className="mt-2 text-[0.98rem] leading-7 text-slate-500">
																		{
																			game.description
																		}
																	</p>
																</button>
															),
														)}
													</div>
												</div>
											)}
									</div>
								);
							})}
						</div>

						<div className="my-8 h-px w-full bg-[#c9ddd1]" />

						{/* SAVED PROTOCOLS */}

						<div className="w-full">
							<MenuCard
								text="Se sparade protokoll"
								icon={Archive}
								iconBg="bg-violet-500"
								onClick={() => navigate("/saved-protocols")}
							/>
						</div>
					</div>
				</div>
			</section>

			{/* ============================================================
			    START NEW GAME MODAL
			============================================================ */}

			{pendingGame && hasAnyActiveGame && (
				<div
					className="
							fixed
							inset-0
							z-[100]
							flex
							items-center
							justify-center
							bg-slate-950/35
							p-4
							backdrop-blur-[2px]
						"
				>
					<div
						className="
								w-full
								max-w-[460px]
								rounded-[28px]
								bg-white
								p-5
								shadow-2xl
								sm:p-6
							"
					>
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="text-xs font-black uppercase tracking-[0.12em] text-amber-500">
									Pågående spel
								</p>

								<h2 className="mt-1 text-xl font-black text-slate-950">
									Du spelar redan {currentGameName}
								</h2>

								<p className="mt-2 text-sm leading-6 text-slate-500">
									Vad vill du göra innan du startar{" "}
									{pendingGame.name}?
								</p>
							</div>

							<button
								type="button"
								onClick={() => setPendingGame(null)}
								className="
										flex
										h-9
										w-9
										shrink-0
										items-center
										justify-center
										rounded-full
										bg-slate-100
										text-slate-500
										transition
										hover:bg-slate-200
									"
								aria-label="Stäng"
							>
								<X size={18} />
							</button>
						</div>

						<div className="mt-6 space-y-3">
							{/* CONTINUE CURRENT */}

							<button
								type="button"
								onClick={() => {
									setPendingGame(null);

									if (activeCustomGame) {
										handleResumeCustomGame();

										return;
									}

									handleResumeRegularGame();
								}}
								className="
										flex
										w-full
										items-center
										gap-3
										rounded-[18px]
										bg-emerald-500
										px-4
										py-4
										text-left
										font-bold
										text-white
										transition
										hover:bg-emerald-600
									"
							>
								<Play size={20} fill="currentColor" />
								Fortsätt {currentGameName}
							</button>

							{/* SAVE & START NEW */}

							<button
								type="button"
								onClick={handleSaveAndStartNew}
								className="
										flex
										w-full
										items-center
										gap-3
										rounded-[18px]
										bg-slate-950
										px-4
										py-4
										text-left
										font-bold
										text-white
										transition
										hover:bg-slate-800
									"
							>
								<Save size={20} />
								Spara pågående & starta nytt
							</button>

							{/* DISCARD */}

							<button
								type="button"
								onClick={handleDiscardAndStartNew}
								className="
										flex
										w-full
										items-center
										gap-3
										rounded-[18px]
										bg-rose-50
										px-4
										py-4
										text-left
										font-bold
										text-rose-600
										transition
										hover:bg-rose-100
									"
							>
								<Trash2 size={20} />
								Överge & starta nytt
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
