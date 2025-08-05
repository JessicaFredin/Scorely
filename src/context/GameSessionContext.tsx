/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

import type { Game } from "../types/game";
import type { Player } from "../types/player";

type GameSession = {
	game: Game;
	players: Player[];
};

type GameSessionContextType = {
	session: GameSession | null;
	setSession: (session: GameSession) => void;
	resetSession: () => void;
};

const GameSessionContext = createContext<GameSessionContextType | undefined>(
	undefined
);

export function GameSessionProvider({ children }: { children: ReactNode }) {
	const [session, setSessionState] = useState<GameSession | null>(null);

	const setSession = (session: GameSession) => {
		setSessionState(session);
	};

	const resetSession = () => {
		setSessionState(null);
	};

	return (
		<GameSessionContext.Provider
			value={{ session, setSession, resetSession }}
		>
			{children}
		</GameSessionContext.Provider>
	);
}

export function useGameSession() {
	const context = useContext(GameSessionContext);
	if (!context) {
		throw new Error(
			"useGameSession must be used within a GameSessionProvider"
		);
	}
	return context;
}
