// /* eslint-disable react-refresh/only-export-components */
// import { createContext, useContext, useState } from "react";
// import type { ReactNode } from "react";

// import type { Game } from "../types/game";
// import type { Player } from "../types/player";

// type GameSession = {
// 	game: Game;
// 	players: Player[];

// 	// players: SessionPlayer[];
// 	protocolId?: string;
// 	protocolCreatedAt?: string;
// };

// // type SessionPlayer = {
// // 	name: string;
// // 	scores: number[];
// // };

// type GameSessionContextType = {
// 	session: GameSession | null;
// 	setSession: (session: GameSession) => void;
// 	resetSession: () => void;
// };

// const GameSessionContext = createContext<GameSessionContextType | undefined>(
// 	undefined,
// );

// export function GameSessionProvider({ children }: { children: ReactNode }) {
// 	const [session, setSessionState] = useState<GameSession | null>(null);

// 	const setSession = (session: GameSession) => {
// 		setSessionState(session);
// 	};

// 	const resetSession = () => {
// 		setSessionState(null);
// 	};

// 	return (
// 		<GameSessionContext.Provider
// 			value={{ session, setSession, resetSession }}
// 		>
// 			{children}
// 		</GameSessionContext.Provider>
// 	);
// }

// export function useGameSession() {
// 	const context = useContext(GameSessionContext);
// 	if (!context) {
// 		throw new Error(
// 			"useGameSession must be used within a GameSessionProvider",
// 		);
// 	}
// 	return context;
// }


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

const GameSessionContext = createContext<GameSessionContextType | undefined>(
	undefined,
);

export function GameSessionProvider({ children }: { children: ReactNode }) {
	const [session, setSessionState] = useState<GameSession | null>(null);

	const setSession = useCallback((nextSession: GameSession) => {
		setSessionState(nextSession);
	}, []);

	const resetSession = useCallback(() => {
		setSessionState(null);
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