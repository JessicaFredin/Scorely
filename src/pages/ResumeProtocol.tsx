import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProtocolService } from "../services/ProtocolService";
import { games } from "../data/games";
import { useGameSession } from "../context/GameSessionContext";

export default function ResumeProtocol() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { setSession } = useGameSession();

	useEffect(() => {
		if (!id) {
			navigate("/", { replace: true });
			return;
		}

		const protocol = ProtocolService.getById(id);

		if (!protocol) {
			navigate("/", { replace: true });
			return;
		}

		const game = games.find(
			(item) =>
				String(item.id).toLowerCase() ===
				String(protocol.gameId).toLowerCase(),
		);

		if (!game) {
			navigate("/", { replace: true });
			return;
		}

		const playerKey = protocol.players
			.map((player) => player.name.trim().toLowerCase())
			.join("|");

		const storageKey = `scorely:${String(protocol.gameId).toLowerCase()}:${playerKey}`;

		localStorage.setItem(storageKey, JSON.stringify(protocol.values));

		const restoredPlayers = protocol.players.map((player, index) => ({
			name: player.name,
			scores: (protocol.values[index] ?? []).map((value) =>
				typeof value === "number" ? value : Number(value || 0),
			),
		}));
        
        setSession({
			game,
			players: restoredPlayers,
			protocolId: protocol.id,
			protocolCreatedAt: protocol.createdAt,
		});

		requestAnimationFrame(() => {
			navigate(protocol.route, { replace: true });
		});
	}, [id, navigate, setSession]);

	return (
		<section className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.95)_0%,_rgba(219,239,226,0.96)_45%,_rgba(210,233,217,0.98)_100%)]">
			<div className="mx-auto flex min-h-screen max-w-[720px] items-center justify-center px-6 py-12">
				<div className="rounded-[28px] bg-white/55 px-8 py-6 text-center shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
					<p className="text-lg font-semibold text-slate-700">
						Laddar sparat protokoll...
					</p>
				</div>
			</div>
		</section>
	);
}
