import { create } from 'zustand';
import type { GameState, Tile, GameStartedPayload } from '@/types/server.generated';

export interface GameStoreState {
  gameState: GameState | null;
  myTiles: Tile[];
  isMyTurn: boolean;
}

export interface GameStoreActions {
  setGameStarted: (data: GameStartedPayload) => void;
  reset: () => void;
}

export type GameStore = GameStoreState & GameStoreActions;

const initialState: GameStoreState = {
  gameState: null,
  myTiles: [],
  isMyTurn: false,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,
  setGameStarted: (data) =>
    set({
      gameState: data.gameState,
      myTiles: data.myTiles,
      isMyTurn: data.isMyTurn,
    }),
  reset: () => set(initialState),
}));
