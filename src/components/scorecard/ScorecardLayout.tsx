
import type { ReactNode } from "react";
import { ArrowLeft, RotateCcw, Save, Undo2, CheckCircle2, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ToastMessage = {
	id: number;
	text: string;
};

type ScorecardLayoutProps = {
	title: string;
	onBack: () => void;
	onSave: () => void;
	onReset?: () => void;
	onUndo?: () => void;
	isUndoDisabled?: boolean;
	isSaveDisabled?: boolean;
	toasts?: ToastMessage[];
	children: ReactNode;
};

export default function ScorecardLayout({
	title,
	onBack,
	onSave,
	onReset,
	onUndo,
	isUndoDisabled = false,
	isSaveDisabled = false,
	toasts = [],
	children,
}: ScorecardLayoutProps) {
	const navigate = useNavigate();
	return (
		<section className="min-h-screen overflow-x-hidden w-full bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.95)_0%,_rgba(219,239,226,0.96)_45%,_rgba(210,233,217,0.98)_100%)]">
			<div className="mx-auto w-full max-w-[1220px] px-4 py-5 sm:px-5 md:px-8 md:py-7">
				<header className="mb-6 grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4">
					
					<div className="flex items-center gap-2">
						{/* BACK */}
						<button
							type="button"
							onClick={onBack}
							className="
			flex
			h-10
			w-10
			items-center
			justify-center
			rounded-full
			bg-white/70
			text-slate-600
			shadow-sm
			transition
			hover:bg-white
			hover:text-slate-900
			active:scale-95
		"
							aria-label="Tillbaka"
							title="Tillbaka"
						>
							<ArrowLeft size={19} />
						</button>

						{/* HOME */}
						<button
							type="button"
							onClick={() => navigate("/")}
							className="
			flex
			h-10
			w-10
			items-center
			justify-center
			rounded-full
			border
			border-emerald-200
			bg-emerald-50
			text-emerald-600
			shadow-sm
			transition
			hover:bg-emerald-100
			hover:text-emerald-700
			active:scale-95
		"
							aria-label="Till startsidan"
							title="Till startsidan"
						>
							<Home size={18} />
						</button>
					</div>

					<h1 className="truncate text-center text-[1.45rem] font-black text-slate-950 sm:text-[1.8rem] md:text-[2rem]">
						{title}
					</h1>

					<div className="flex items-center justify-end gap-1 sm:gap-3">
						{onUndo && (
							<button
								type="button"
								onClick={onUndo}
								disabled={isUndoDisabled}
								className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-white/40 disabled:cursor-not-allowed disabled:opacity-40 sm:h-11 sm:w-11"
								aria-label="Ångra"
								title="Ångra"
							>
								<Undo2 size={20} />
							</button>
						)}

						{onReset && (
							<button
								type="button"
								onClick={onReset}
								className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-white/40 sm:h-11 sm:w-11"
								aria-label="Återställ"
								title="Återställ"
							>
								<RotateCcw size={20} />
							</button>
						)}

						<button
							type="button"
							onClick={onSave}
							disabled={isSaveDisabled}
							className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-emerald-500 px-3 text-sm font-bold text-white shadow-[0_10px_24px_rgba(16,185,129,0.2)] transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60 sm:h-11 sm:px-5 sm:text-[1.05rem]"
							aria-label="Spara"
							title="Spara"
						>
							<Save size={18} />
							<span className="hidden sm:inline">Spara</span>
						</button>
					</div>
				</header>

				<div className="rounded-[26px] bg-white/35 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.04)] backdrop-blur-[2px] sm:rounded-[30px] sm:p-4 md:p-5">
					{children}
				</div>
			</div>

			<div className="pointer-events-none fixed bottom-5 left-1/2 z-[60] flex w-full max-w-[720px] -translate-x-1/2 flex-col gap-3 px-4">
				{toasts.map((toast) => (
					<div
						key={toast.id}
						className="pointer-events-auto flex items-center gap-3 rounded-[20px] border border-[#dbe5df] bg-white/92 px-5 py-5 shadow-[0_12px_28px_rgba(0,0,0,0.10)] backdrop-blur-[6px]"
					>
						<div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-white">
							<CheckCircle2 size={18} />
						</div>

						<p className="text-[1.05rem] font-semibold text-slate-800">
							{toast.text}
						</p>
					</div>
				))}
			</div>
		</section>
	);
}