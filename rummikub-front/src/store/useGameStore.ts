import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import type { GameState, Tile, GameOverPayload } from '@/types/server.generated';
import { autoSortTiles, type SortResult } from '@/lib/tileUtils';

export interface GameStoreState {
  gameState: GameState | null;
  myTiles: Tile[];
  isMyTurn: boolean;
  selectedTileIds: string[];
  errorMessage: string | null;
  tileSortResult: SortResult | null;
}

export interface GameStoreActions {
  setGameState: (gameState: GameState) => void;
  setMyTiles: (tiles: Tile[]) => void;
  setIsMyTurn: (isMyTurn: boolean) => void;
  setDeckCount: (deckCount: number) => void;
  setGameOver: (data: GameOverPayload) => void;
  toggleTileSelection: (tileId: string) => void;
  clearSelection: () => void;
  setErrorMessage: (message: string | null) => void;
  reorderMyTiles: (activeIndex: number, overIndex: number) => void;
  sortMyTiles: () => void;
  reset: () => void;
}

export type GameStore = GameStoreState & GameStoreActions;

const initialState: GameStoreState = {
  gameState: null,
  myTiles: [],
  isMyTurn: false,
  selectedTileIds: [],
  errorMessage: null,
  tileSortResult: null,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,
  setGameState: (gameState) => set({ gameState }),
  setMyTiles: (tiles) => {
    const result = autoSortTiles(tiles);
    return set({ myTiles: result.tiles, selectedTileIds: [], tileSortResult: result });
  },
  setIsMyTurn: (isMyTurn) => set({ isMyTurn }),
  setDeckCount: (deckCount) =>
    set((state) => ({
      gameState: state.gameState ? { ...state.gameState, deckCount } : null,
    })),
  setGameOver: (data) =>
    set({
      gameState: data.gameState,
      isMyTurn: false,
    }),
  toggleTileSelection: (tileId) =>
    set((state) => ({
      selectedTileIds: state.selectedTileIds.includes(tileId)
        ? state.selectedTileIds.filter((id) => id !== tileId)
        : [...state.selectedTileIds, tileId],
    })),
  clearSelection: () => set({ selectedTileIds: [] }),
  setErrorMessage: (message) => set({ errorMessage: message }),
  reorderMyTiles: (activeIndex, overIndex) =>
    set((state) => ({
      myTiles: arrayMove(state.myTiles, activeIndex, overIndex),
      tileSortResult: null,
    })),
  sortMyTiles: () =>
    set((state) => {
      const result = autoSortTiles(state.myTiles);
      return { myTiles: result.tiles, selectedTileIds: [], tileSortResult: result };
    }),
  reset: () => set(initialState),
}));
