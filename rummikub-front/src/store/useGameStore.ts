import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import type { GameState, Tile, GameOverPayload } from '@/types/server.generated';

export interface GameStoreState {
  gameState: GameState | null;
  myTiles: Tile[];
  isMyTurn: boolean;
  selectedTileIds: string[];
  stagedCombinations: Tile[][];
  errorMessage: string | null;
}

export interface GameStoreActions {
  setGameState: (gameState: GameState) => void;
  setMyTiles: (tiles: Tile[]) => void;
  setIsMyTurn: (isMyTurn: boolean) => void;
  setDeckCount: (deckCount: number) => void;
  setGameOver: (data: GameOverPayload) => void;
  toggleTileSelection: (tileId: string) => void;
  clearSelection: () => void;
  stageCombination: () => void;
  unstageCombo: (index: number) => void;
  reorderStagedTile: (comboIndex: number, from: number, to: number) => void;
  clearAllStaged: () => void;
  setErrorMessage: (message: string | null) => void;
  reorderMyTiles: (activeIndex: number, overIndex: number) => void;
  reset: () => void;
}

export type GameStore = GameStoreState & GameStoreActions;

const initialState: GameStoreState = {
  gameState: null,
  myTiles: [],
  isMyTurn: false,
  selectedTileIds: [],
  stagedCombinations: [],
  errorMessage: null,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,
  setGameState: (gameState) => set({ gameState }),
  setMyTiles: (tiles) => set({ myTiles: tiles, selectedTileIds: [] }),
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
  stageCombination: () =>
    set((state) => {
      if (state.selectedTileIds.length === 0) return state;
      // selectedTileIds 순서대로 타일 추출 (조커 위치 보존)
      const tiles = state.selectedTileIds
        .map((id) => state.myTiles.find((t) => t.id === id))
        .filter((t): t is Tile => t !== undefined);
      const stagedIds = new Set(state.selectedTileIds);
      return {
        stagedCombinations: [...state.stagedCombinations, tiles],
        myTiles: state.myTiles.filter((t) => !stagedIds.has(t.id)),
        selectedTileIds: [],
      };
    }),
  unstageCombo: (index) =>
    set((state) => {
      const combo = state.stagedCombinations[index];
      if (!combo) return state;
      return {
        stagedCombinations: state.stagedCombinations.filter((_, i) => i !== index),
        myTiles: [...state.myTiles, ...combo],
      };
    }),
  reorderStagedTile: (comboIndex, from, to) =>
    set((state) => {
      const updated = state.stagedCombinations.map((combo, i) =>
        i === comboIndex ? arrayMove(combo, from, to) : combo,
      );
      return { stagedCombinations: updated };
    }),
  clearAllStaged: () => set({ stagedCombinations: [] }),
  setErrorMessage: (message) => set({ errorMessage: message }),
  reorderMyTiles: (activeIndex, overIndex) =>
    set((state) => ({
      myTiles: arrayMove(state.myTiles, activeIndex, overIndex),
    })),
  reset: () => set(initialState),
}));
