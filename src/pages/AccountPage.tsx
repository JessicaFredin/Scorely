import { useState } from "react";

import { ArrowLeft, Cloud, LogOut, RefreshCw, User } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { ScorelySyncService } from "../services/ScorelySyncService";

export default function AccountPage() {
	const navigate = useNavigate();

	const { user, signOut } = useAuth();

	const [isSyncing, setIsSyncing] = useState(false);

	const [message, setMessage] = useState("");

	const sync = async () => {
		setIsSyncing(true);

		setMessage("");

		try {
			const result = await ScorelySyncService.syncAll();

			setMessage(
				`Synkat: ${result.customProtocols} egna protokoll, ${result.customGames} matcher och ${result.savedProtocols} sparade protokoll.`,
			);
		} catch {
			setMessage(
				"Synkningen misslyckades. Din lokala data finns fortfarande kvar.",
			);
		} finally {
			setIsSyncing(false);
		}
	};

	return (
		<section className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.98)_0%,_rgba(219,239,226,0.98)_48%,_rgba(210,233,217,1)_100%)]">
			<div className="mx-auto w-full max-w-[620px] px-5 py-8 sm:px-6 sm:py-12">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => navigate("/")}
						className="flex h-11 w-11 items-center justify-center rounded-full bg-white/75 text-slate-600"
					>
						<ArrowLeft size={20} />
					</button>

					<div>
						<p className="text-xs font-black uppercase tracking-[0.12em] text-emerald-600">
							Scorely
						</p>

						<h1 className="text-2xl font-black text-slate-950">
							Ditt konto
						</h1>
					</div>
				</div>

				<div className="mt-7 rounded-[28px] border border-white/70 bg-white/70 p-6 shadow-[0_12px_35px_rgba(0,0,0,0.05)]">
					<div className="flex items-center gap-4">
						<div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
							<User size={24} />
						</div>

						<div className="min-w-0">
							<p className="font-black text-slate-900">
								Inloggad
							</p>

							<p className="truncate text-sm text-slate-500">
								{user?.email}
							</p>
						</div>
					</div>

					<div className="mt-6 rounded-[18px] bg-emerald-50 p-4">
						<div className="flex items-start gap-3">
							<Cloud
								size={20}
								className="mt-0.5 shrink-0 text-emerald-600"
							/>

							<div>
								<p className="font-black text-emerald-800">
									Molnsynkning
								</p>

								<p className="mt-1 text-sm leading-6 text-emerald-700/80">
									Dina protokoll sparas lokalt först och
									synkas sedan till ditt Scorely-konto.
								</p>
							</div>
						</div>
					</div>

					<button
						type="button"
						onClick={() => void sync()}
						disabled={isSyncing}
						className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-4 font-black text-white disabled:opacity-50"
					>
						<RefreshCw
							size={18}
							className={isSyncing ? "animate-spin" : ""}
						/>

						{isSyncing ? "Synkar..." : "Synka nu"}
					</button>

					{message && (
						<p className="mt-4 text-center text-sm font-bold text-slate-500">
							{message}
						</p>
					)}

					<button
						type="button"
						onClick={async () => {
							await signOut();

							navigate("/");
						}}
						className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-rose-50 px-5 py-4 font-black text-rose-600"
					>
						<LogOut size={18} />
						Logga ut
					</button>
				</div>
			</div>
		</section>
	);
}
