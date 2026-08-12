import { createContext, useContext, useEffect, useMemo, useState } from "react";

import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";

type AuthContextValue = {
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

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [session, setSession] = useState<Session | null>(null);

	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let mounted = true;

		const loadSession = async () => {
			const { data } = await supabase.auth.getSession();

			if (!mounted) {
				return;
			}

			setSession(data.session);

			setIsLoading(false);
		};

		void loadSession();

		const { data: subscription } = supabase.auth.onAuthStateChange(
			(_event, nextSession) => {
				setSession(nextSession);

				setIsLoading(false);
			},
		);

		return () => {
			mounted = false;

			subscription.subscription.unsubscribe();
		};
	}, []);

	const signUp = async (
		email: string,
		password: string,
		displayName: string,
	) => {
		const { data, error } = await supabase.auth.signUp({
			email,

			password,

			options: {
				data: {
					display_name: displayName,
				},
			},
		});

		if (error) {
			return {
				error: error.message,

				needsEmailConfirmation: false,
			};
		}

		if (data.user) {
			await supabase.from("scorely_profiles").upsert(
				{
					user_id: data.user.id,

					display_name: displayName,

					updated_at: new Date().toISOString(),
				},

				{
					onConflict: "user_id",
				},
			);
		}

		return {
			error: null,

			needsEmailConfirmation: !data.session,
		};
	};

	const signIn = async (email: string, password: string) => {
		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		return {
			error: error?.message ?? null,
		};
	};

	const signOut = async () => {
		await supabase.auth.signOut();
	};

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

export function useAuth() {
	const context = useContext(AuthContext);

	if (!context) {
		throw new Error("useAuth måste användas inne i AuthProvider.");
	}

	return context;
}
