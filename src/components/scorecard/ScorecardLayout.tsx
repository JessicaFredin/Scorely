import type { ReactNode } from "react";

import {
	ArrowLeft,
	CheckCircle2,
	Home,
	RotateCcw,
	Save,
	Share2,
	Undo2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

type ToastMessage = {
	id: number;
	text: string;
};

type ScorecardLayoutProps = {
	title: string;

	onBack: () => void;

	onSave: () => void;

	onShare?: () => void;

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
	onShare,
	onReset,
	onUndo,
	isUndoDisabled = false,
	isSaveDisabled = false,
	toasts = [],
	children,
}: ScorecardLayoutProps) {
	const navigate = useNavigate();

	return (
		<section
			className="
				min-h-screen
				w-full
				overflow-x-hidden
				bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.95)_0%,_rgba(219,239,226,0.96)_45%,_rgba(210,233,217,0.98)_100%)]
			"
		>
			<div
				className="
					mx-auto
					w-full
					max-w-[1220px]
					px-3
					py-4
					sm:px-5
					sm:py-5
					md:px-8
					md:py-7
				"
			>
				{/* =================================================
				    HEADER
				================================================= */}

				<header
					className="
						mb-5
						grid
						grid-cols-[auto_minmax(0,1fr)_auto]
						items-center
						gap-2

						sm:mb-6
						sm:gap-4
					"
				>
					{/* =============================================
					    LEFT
					============================================= */}

					<div
						className="
							flex
							items-center
							gap-1.5

							sm:gap-2
						"
					>
						{/* BACK */}

						<button
							type="button"
							onClick={onBack}
							className="
								flex
								h-9
								w-9
								shrink-0
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

								sm:h-10
								sm:w-10
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
								h-9
								w-9
								shrink-0
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

								sm:h-10
								sm:w-10
							"
							aria-label="Till startsidan"
							title="Till startsidan"
						>
							<Home size={18} />
						</button>
					</div>

					{/* =============================================
					    TITLE
					============================================= */}

					<h1
						className="
							min-w-0
							truncate
							px-1
							text-center
							text-[1.2rem]
							font-black
							text-slate-950

							sm:text-[1.8rem]
							md:text-[2rem]
						"
					>
						{title}
					</h1>

					{/* =============================================
					    RIGHT ACTIONS
					============================================= */}

					<div
						className="
							flex
							shrink-0
							items-center
							justify-end
							gap-0.5

							sm:gap-2
							md:gap-3
						"
					>
						{/* UNDO */}

						{onUndo && (
							<button
								type="button"
								onClick={onUndo}
								disabled={isUndoDisabled}
								className="
									flex
									h-9
									w-9
									items-center
									justify-center
									rounded-full
									text-slate-700
									transition
									hover:bg-white/50
									disabled:cursor-not-allowed
									disabled:opacity-35

									sm:h-11
									sm:w-11
								"
								aria-label="Ångra"
								title="Ångra"
							>
								<Undo2 size={19} />
							</button>
						)}

						{/* RESET */}

						{onReset && (
							<button
								type="button"
								onClick={onReset}
								className="
									flex
									h-9
									w-9
									items-center
									justify-center
									rounded-full
									text-slate-700
									transition
									hover:bg-white/50
									active:scale-95

									sm:h-11
									sm:w-11
								"
								aria-label="Återställ"
								title="Återställ"
							>
								<RotateCcw size={19} />
							</button>
						)}

						{/* SHARE */}

						{onShare && (
							<button
								type="button"
								onClick={onShare}
								className="
									flex
									h-9
									w-9
									shrink-0
									items-center
									justify-center
									rounded-full
									border
									border-sky-200/80
									bg-sky-50/80
									text-sky-600
									shadow-sm
									transition
									hover:bg-sky-100
									hover:text-sky-700
									active:scale-95

									sm:h-11
									sm:w-11
								"
								aria-label="Dela protokoll"
								title="Dela protokoll"
							>
								<Share2 size={18} />
							</button>
						)}

						{/* SAVE */}

						<button
							type="button"
							onClick={onSave}
							disabled={isSaveDisabled}
							className="
								inline-flex
								h-9
								shrink-0
								items-center
								justify-center
								gap-2
								rounded-full
								bg-emerald-500
								px-2.5
								text-sm
								font-bold
								text-white
								shadow-[0_10px_24px_rgba(16,185,129,0.20)]
								transition
								hover:bg-emerald-600
								active:scale-95
								disabled:cursor-not-allowed
								disabled:opacity-60

								sm:h-11
								sm:px-5
								sm:text-[1.05rem]
							"
							aria-label="Spara"
							title="Spara"
						>
							<Save size={18} />

							<span className="hidden sm:inline">Spara</span>
						</button>
					</div>
				</header>

				{/* =================================================
				    PROTOCOL CONTENT
				================================================= */}

				<div
					className="
						rounded-[24px]
						bg-white/35
						p-2.5
						shadow-[0_10px_30px_rgba(0,0,0,0.04)]
						backdrop-blur-[2px]

						sm:rounded-[30px]
						sm:p-4
						md:p-5
					"
				>
					{children}
				</div>
			</div>

			{/* =====================================================
			    TOASTS
			===================================================== */}

			<div
				className="
					pointer-events-none
					fixed
					bottom-5
					left-1/2
					z-[60]
					flex
					w-full
					max-w-[720px]
					-translate-x-1/2
					flex-col
					gap-3
					px-4
				"
			>
				{toasts.map((toast) => (
					<div
						key={toast.id}
						className="
								pointer-events-auto
								flex
								items-center
								gap-3
								rounded-[20px]
								border
								border-[#dbe5df]
								bg-white/92
								px-4
								py-4
								shadow-[0_12px_28px_rgba(0,0,0,0.10)]
								backdrop-blur-[6px]

								sm:px-5
								sm:py-5
							"
					>
						<div
							className="
									flex
									h-7
									w-7
									shrink-0
									items-center
									justify-center
									rounded-full
									bg-slate-900
									text-white
								"
						>
							<CheckCircle2 size={18} />
						</div>

						<p
							className="
									text-sm
									font-semibold
									text-slate-800

									sm:text-[1.05rem]
								"
						>
							{toast.text}
						</p>
					</div>
				))}
			</div>
		</section>
	);
}
