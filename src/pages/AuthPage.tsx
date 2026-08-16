import { useState } from "react";

import { ArrowLeft, Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

import { ScorelySyncService } from "../services/ScorelySyncService";

export default function AuthPage() {
	const navigate = useNavigate();

	const { signIn, signUp } = useAuth();

	const [mode, setMode] = useState<"login" | "register">("login");

	const [displayName, setDisplayName] = useState("");

	const [email, setEmail] = useState("");

	const [password, setPassword] = useState("");

	const [showPassword, setShowPassword] = useState(false);

	const [isSubmitting, setIsSubmitting] = useState(false);

	const [error, setError] = useState("");

	const [message, setMessage] = useState("");

	const submit = async () => {
		setError("");
		setMessage("");

		if (!email.trim() || !password) {
			setError("Fyll i e-post och lösenord.");

			return;
		}

		if (mode === "register" && !displayName.trim()) {
			setError("Fyll i ditt namn.");

			return;
		}

		setIsSubmitting(true);

		try {
			if (mode === "register") {
				const result = await signUp(
					email.trim(),
					password,
					displayName.trim(),
				);

				if (result.error) {
					setError(result.error);

					return;
				}

				if (result.needsEmailConfirmation) {
					setMessage(
						"Kontot är skapat. Kontrollera din e-post och bekräfta kontot innan du loggar in.",
					);

					setMode("login");

					return;
				}

				await ScorelySyncService.syncAll();

				navigate("/");

				return;
			}

			const result = await signIn(email.trim(), password);

			if (result.error) {
				setError(result.error);

				return;
			}

			await ScorelySyncService.syncAll();

			navigate("/");
		} catch {
			setError("Något gick fel när Scorely skulle synka din data.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const switchMode = () => {
		setError("");
		setMessage("");

		setMode((prev) => (prev === "login" ? "register" : "login"));
	};

	return (
		<section className="min-h-screen w-full bg-[radial-gradient(circle_at_top,_rgba(233,246,239,0.98)_0%,_rgba(219,239,226,0.98)_48%,_rgba(210,233,217,1)_100%)]">
			<div className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col px-5 py-8 sm:px-6 sm:py-12">
				{/* BACK */}

				<button
					type="button"
					onClick={() => navigate("/")}
					className="
						flex
						h-11
						w-11
						items-center
						justify-center
						rounded-full
						bg-white/75
						text-slate-600
						shadow-sm
						transition
						hover:bg-white
						active:scale-95
					"
					aria-label="Tillbaka"
				>
					<ArrowLeft size={20} />
				</button>

				{/* CARD */}

				<div
					className="
						mt-8
						rounded-[30px]
						border
						border-white/70
						bg-white/70
						p-6
						shadow-[0_14px_40px_rgba(0,0,0,0.06)]
						backdrop-blur-sm
						sm:p-8
					"
				>
					<p
						className="
							text-center
							text-xs
							font-black
							uppercase
							tracking-[0.15em]
							text-emerald-600
						"
					>
						Scorely
					</p>

					<h1
						className="
							mt-2
							text-center
							text-3xl
							font-black
							text-slate-950
						"
					>
						{mode === "login" ? "Logga in" : "Skapa konto"}
					</h1>

					<p
						className="
							mx-auto
							mt-3
							max-w-[340px]
							text-center
							text-sm
							leading-6
							text-slate-500
						"
					>
						{mode === "login"
							? "Fortsätt där du slutade och synka dina protokoll mellan dina enheter."
							: "Din befintliga Scorely-data flyttas till kontot när du loggar in."}
					</p>

					{/* NAME */}

					{mode === "register" && (
						<div className="mt-7">
							<label className="text-sm font-black text-slate-700">
								Namn
							</label>

							<div
								className="
									mt-2
									flex
									items-center
									gap-3
									rounded-[17px]
									border
									border-slate-200
									bg-white
									px-4
									transition
									focus-within:border-emerald-400
									focus-within:ring-4
									focus-within:ring-emerald-100
								"
							>
								<User
									size={18}
									className="shrink-0 text-slate-400"
								/>

								<input
									value={displayName}
									onChange={(event) =>
										setDisplayName(event.target.value)
									}
									placeholder="Ditt namn"
									autoComplete="name"
									className="
										w-full
										bg-transparent
										py-4
										text-slate-900
										outline-none
										placeholder:text-slate-400
									"
								/>
							</div>
						</div>
					)}

					{/* EMAIL */}

					<div className="mt-5">
						<label className="text-sm font-black text-slate-700">
							E-post
						</label>

						<div
							className="
								mt-2
								flex
								items-center
								gap-3
								rounded-[17px]
								border
								border-slate-200
								bg-white
								px-4
								transition
								focus-within:border-emerald-400
								focus-within:ring-4
								focus-within:ring-emerald-100
							"
						>
							<Mail
								size={18}
								className="shrink-0 text-slate-400"
							/>

							<input
								type="email"
								value={email}
								onChange={(event) =>
									setEmail(event.target.value)
								}
								placeholder="namn@email.com"
								autoComplete="email"
								className="
									w-full
									bg-transparent
									py-4
									text-slate-900
									outline-none
									placeholder:text-slate-400
								"
							/>
						</div>
					</div>

					{/* PASSWORD */}

					<div className="mt-5">
						<label className="text-sm font-black text-slate-700">
							Lösenord
						</label>

						<div
							className="
								mt-2
								flex
								items-center
								gap-3
								rounded-[17px]
								border
								border-slate-200
								bg-white
								px-4
								transition
								focus-within:border-emerald-400
								focus-within:ring-4
								focus-within:ring-emerald-100
							"
						>
							<LockKeyhole
								size={18}
								className="shrink-0 text-slate-400"
							/>

							<input
								type={showPassword ? "text" : "password"}
								value={password}
								onChange={(event) =>
									setPassword(event.target.value)
								}
								autoComplete={
									mode === "login"
										? "current-password"
										: "new-password"
								}
								className="
									min-w-0
									flex-1
									bg-transparent
									py-4
									text-slate-900
									outline-none
								"
							/>

							<button
								type="button"
								onClick={() =>
									setShowPassword((value) => !value)
								}
								className="
									flex
									h-8
									w-8
									shrink-0
									items-center
									justify-center
									rounded-full
									text-slate-400
									transition
									hover:bg-slate-100
									hover:text-slate-600
								"
								aria-label={
									showPassword
										? "Dölj lösenord"
										: "Visa lösenord"
								}
							>
								{showPassword ? (
									<EyeOff size={18} />
								) : (
									<Eye size={18} />
								)}
							</button>
						</div>
					</div>

					{/* ERROR */}

					{error && (
						<div
							className="
								mt-5
								rounded-[16px]
								bg-rose-50
								px-4
								py-3
								text-sm
								font-bold
								text-rose-600
							"
						>
							{error}
						</div>
					)}

					{/* MESSAGE */}

					{message && (
						<div
							className="
								mt-5
								rounded-[16px]
								bg-emerald-50
								px-4
								py-3
								text-sm
								font-bold
								leading-6
								text-emerald-700
							"
						>
							{message}
						</div>
					)}

					{/* SUBMIT */}

					<button
						type="button"
						onClick={() => void submit()}
						disabled={isSubmitting}
						className="
							mt-7
							w-full
							rounded-full
							bg-emerald-500
							px-5
							py-4
							font-black
							text-white
							transition
							hover:bg-emerald-600
							active:scale-[0.99]
							disabled:cursor-not-allowed
							disabled:opacity-50
						"
					>
						{isSubmitting
							? "Vänta..."
							: mode === "login"
								? "Logga in"
								: "Skapa konto"}
					</button>

					{/* SWITCH LOGIN / REGISTER */}

					<div
						className="
							mt-5
							text-center
							text-sm
							font-medium
							text-slate-500
						"
					>
						{mode === "login" ? (
							<>
								<span>Har du inget konto? </span>

								<button
									type="button"
									onClick={switchMode}
									className="
										font-black
										text-emerald-600
										transition
										hover:text-emerald-700
										hover:underline
										hover:underline-offset-4
										focus:outline-none
										focus-visible:underline
										focus-visible:underline-offset-4
									"
								>
									Skapa ett
								</button>
							</>
						) : (
							<>
								<span>Har du redan ett konto? </span>

								<button
									type="button"
									onClick={switchMode}
									className="
										font-black
										text-emerald-600
										transition
										hover:text-emerald-700
										hover:underline
										hover:underline-offset-4
										focus:outline-none
										focus-visible:underline
										focus-visible:underline-offset-4
									"
								>
									Logga in
								</button>
							</>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
