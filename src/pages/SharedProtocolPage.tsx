import { useEffect, useState } from "react";

import { AlertCircle, LoaderCircle } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useGameSession } from "../context/GameSessionContext";

import { games } from "../data/games";

import { CustomGameService } from "../services/CustomGameService";

import { getGameStorageKey } from "../utils/gameStorage";

import { readSharePayload } from "../utils/protocolShare";

export default function SharedProtocolPage() {
	const navigate = useNavigate();

	const { setSession } = useGameSession();

	const [error, setError] = useState("");

	useEffect(() => {
		const payload = readSharePayload();

		if (!payload) {
			setError("Delningslänken är ogiltig eller skadad.");

			return;
		}

		/*
			=================================================
			VANLIGT SCORELY-PROTOKOLL
			=================================================
		*/

		if (payload.type === "regular") {
			const game = games.find(
				(item) =>
					String(item.id).toLowerCase() ===
					payload.gameId.toLowerCase(),
			);

			if (!game) {
				setError(
					"Spelet i delningslänken finns inte längre i Scorely.",
				);

				return;
			}

			const players = payload.players.map((player) => ({
				name: player.name,

				scores: [] as number[],
			}));

			const storageKey = getGameStorageKey(game, players);

			try {
				localStorage.setItem(
					storageKey,

					JSON.stringify(payload.values),
				);
			} catch {
				setError(
					"Scorely kunde inte spara det delade protokollet på enheten.",
				);

				return;
			}

			const now = new Date().toISOString();

			setSession({
				game,

				players,

				status: "active",

				protocolId: crypto.randomUUID(),

				protocolCreatedAt: now,
			});

			/*
				replace gör också att Back inte
				skickar användaren tillbaka till
				importsidan.
			*/

			navigate(
				`/game/${String(game.id).toLowerCase()}`,

				{
					replace: true,
				},
			);

			return;
		}

		/*
			=================================================
			ANPASSAT PROTOKOLL
			=================================================

			Vi skapar ett NYTT match-ID.

			Mottagaren får alltså sin egen kopia,
			inte tillgång till avsändarens original.
		*/

		const newId = crypto.randomUUID();

		const now = new Date().toISOString();

		const importedGame = {
			...payload.game,

			id: newId,

			createdAt: now,

			updatedAt: now,

			finished: false,

			winnerName: null,
		};

		CustomGameService.save(importedGame);

		CustomGameService.setActiveGame(newId);

		navigate(
			`/custom-match/${newId}`,

			{
				replace: true,
			},
		);
	}, [navigate, setSession]);

	if (error) {
		return (
			<section className="flex min-h-screen w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.98)_0%,_rgba(210,233,217,1)_100%)] px-5">
				<div className="w-full max-w-[420px] rounded-[28px] border border-white/70 bg-white/75 p-7 text-center shadow-[0_12px_35px_rgba(0,0,0,0.05)]">
					<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-500">
						<AlertCircle size={23} />
					</div>

					<h1 className="mt-4 text-xl font-black text-slate-950">
						Kunde inte öppna protokollet
					</h1>

					<p className="mt-2 text-sm leading-6 text-slate-500">
						{error}
					</p>

					<button
						type="button"
						onClick={() => navigate("/")}
						className="mt-6 w-full rounded-full bg-emerald-500 px-5 py-3.5 font-black text-white"
					>
						Till startsidan
					</button>
				</div>
			</section>
		);
	}

	return (
		<section className="flex min-h-screen w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.98)_0%,_rgba(210,233,217,1)_100%)]">
			<div className="text-center">
				<LoaderCircle
					size={34}
					className="mx-auto animate-spin text-emerald-500"
				/>

				<p className="mt-4 text-sm font-bold text-slate-500">
					Öppnar delat protokoll...
				</p>
			</div>
		</section>
	);
}
