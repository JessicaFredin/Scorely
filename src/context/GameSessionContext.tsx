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

type GameSession = {
	game: Game;
	players: Player[];
	protocolId?: string;
	protocolCreatedAt?: string;
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

		const parsed = JSON.parse(raw) as GameSession;

		if (
			!parsed ||
			typeof parsed !== "object" ||
			!parsed.game ||
			!Array.isArray(parsed.players)
		) {
			return null;
		}

		return parsed;
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
		setSessionState(nextSession);

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
		} catch {
			// Scorely fungerar fortfarande även om
			// localStorage skulle vara otillgängligt.
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
