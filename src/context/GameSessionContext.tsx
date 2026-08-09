/* eslint-disable react-refresh/only-export-components */

import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";

import type { ReactNode } from "react";

import type { Game } from "../types/game";
import type { Player } from "../types/player";

export type GameSessionStatus = "active" | "finished";

export type GameSession = {
	game: Game;
	players: Player[];

	protocolId?: string;
	protocolCreatedAt?: string;

	status?: GameSessionStatus;
};

type GameSessionContextType = {
	session: GameSession | null;

	setSession: (session: GameSession) => void;

	resetSession: () => void;
};

const STORAGE_KEY = "scorely:game-session";

function loadStoredSession(): GameSession | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);

		if (!raw) {
			return null;
		}

		const parsed: unknown = JSON.parse(raw);

		if (typeof parsed !== "object" || parsed === null) {
			return null;
		}

		const candidate = parsed as Partial<GameSession>;

		if (!candidate.game || !Array.isArray(candidate.players)) {
			return null;
		}

		return candidate as GameSession;
	} catch {
		return null;
	}
}

const GameSessionContext = createContext<GameSessionContextType | undefined>(
	undefined,
);

export function GameSessionProvider({ children }: { children: ReactNode }) {
	const [session, setSessionState] = useState<GameSession | null>(() =>
		loadStoredSession(),
	);

	const setSession = useCallback((nextSession: GameSession) => {
		const normalizedSession: GameSession = {
			...nextSession,

			status: nextSession.status ?? "active",
		};

		setSessionState(normalizedSession);

		try {
			localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify(normalizedSession),
			);
		} catch {
			// Scorely fortsätter fungera
			// även om localStorage
			// inte är tillgängligt.
		}
	}, []);

	const resetSession = useCallback(() => {
		setSessionState(null);

		try {
			localStorage.removeItem(STORAGE_KEY);
		} catch {
			// Ignorera storage-fel.
		}
	}, []);

	const value = useMemo(
		() => ({
			session,
			setSession,
			resetSession,
		}),
		[session, setSession, resetSession],
	);

	return (
		<GameSessionContext.Provider value={value}>
			{children}
		</GameSessionContext.Provider>
	);
}

export function useGameSession() {
	const context = useContext(GameSessionContext);

	if (!context) {
		throw new Error(
			"useGameSession must be used within a GameSessionProvider",
		);
	}

	return context;
}
