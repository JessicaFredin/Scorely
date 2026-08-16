import { createContext, useEffect, useMemo, useState } from "react";

import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";

export type AuthContextValue = {
	user: User | null;
	session: Session | null;

	isLoading: boolean;
	isAuthenticated: boolean;

	signUp: (
		email: string,
		password: string,
		displayName: string,
	) => Promise<{
		error: string | null;
		needsEmailConfirmation: boolean;
	}>;

	signIn: (
		email: string,
		password: string,
	) => Promise<{
		error: string | null;
	}>;

	signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [session, setSession] = useState<Session | null>(null);

	const [isLoading, setIsLoading] = useState(true);

	/*
		=====================================================
		LOAD EXISTING SESSION
		=====================================================
	*/

	useEffect(() => {
		let mounted = true;

		const loadSession = async () => {
			const { data, error } = await supabase.auth.getSession();

			if (!mounted) {
				return;
			}

			if (error) {
				console.error("Could not load Supabase session:", error);
			}

			setSession(data.session);

			setIsLoading(false);
		};

		void loadSession();

		/*
			Lyssna på:

			- login
			- logout
			- email confirmation
			- token refresh
			- session recovery
		*/

		const { data: authListener } = supabase.auth.onAuthStateChange(
			(_event, nextSession) => {
				if (!mounted) {
					return;
				}

				setSession(nextSession);

				setIsLoading(false);
			},
		);

		return () => {
			mounted = false;

			authListener.subscription.unsubscribe();
		};
	}, []);

	/*
		=====================================================
		SIGN UP
		=====================================================
	*/

	const signUp = async (
		email: string,
		password: string,
		displayName: string,
	) => {
		const normalizedEmail = email.trim().toLowerCase();

		const normalizedDisplayName = displayName.trim();

		const { data, error } = await supabase.auth.signUp({
			email: normalizedEmail,

			password,

			options: {
				/*
							Det här sparas i
							user.user_metadata.
						*/

				data: {
					display_name: normalizedDisplayName,
				},

				/*
							VIKTIGT:

							Verifieringsmejlet skickar
							användaren tillbaka till
							samma origin som appen
							kördes från.

							Production:
							https://scorely-three.vercel.app

							Local:
							http://localhost:5173
						*/

				emailRedirectTo: `${window.location.origin}/`,
			},
		});

		if (error) {
			return {
				error: error.message,

				needsEmailConfirmation: false,
			};
		}

		/*
				Skapa / uppdatera Scorely-profil.

				Observera att detta bara lyckas
				om RLS-policy tillåter användaren
				att skriva sin egen profil.
			*/

		if (data.user) {
			const { error: profileError } = await supabase
				.from("scorely_profiles")
				.upsert(
					{
						user_id: data.user.id,

						display_name: normalizedDisplayName,

						updated_at: new Date().toISOString(),
					},
					{
						onConflict: "user_id",
					},
				);

			/*
					Vi stoppar inte själva kontoskapandet
					om profilen skulle misslyckas.

					Auth-kontot kan fortfarande vara skapat.
				*/

			if (profileError) {
				console.error(
					"Could not create Scorely profile:",
					profileError,
				);
			}
		}

		/*
				Om email confirmation är aktivt
				returnerar Supabase normalt ingen
				aktiv session direkt.

				Då blir detta true.
			*/

		return {
			error: null,

			needsEmailConfirmation: !data.session,
		};
	};

	/*
		=====================================================
		SIGN IN
		=====================================================
	*/

	const signIn = async (email: string, password: string) => {
		const normalizedEmail = email.trim().toLowerCase();

		const { error } = await supabase.auth.signInWithPassword({
			email: normalizedEmail,

			password,
		});

		return {
			error: error?.message ?? null,
		};
	};

	/*
		=====================================================
		SIGN OUT
		=====================================================
	*/

	const signOut = async () => {
		const { error } = await supabase.auth.signOut();

		if (error) {
			throw error;
		}
	};

	/*
		=====================================================
		CONTEXT VALUE
		=====================================================
	*/

	const value = useMemo<AuthContextValue>(
		() => ({
			user: session?.user ?? null,

			session,

			isLoading,

			isAuthenticated: Boolean(session?.user),

			signUp,

			signIn,

			signOut,
		}),
		[session, isLoading],
	);

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}
