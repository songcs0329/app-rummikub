import { create } from 'zustand';
import { arrayMove } from '@dnd-kit/sortable';
import type { GameState, Tile, GameOverPayload } from '@/types/server.generated';

export interface GameStoreState {
  gameState: GameState | null;
  myTiles: Tile[];
  isMyTurn: boolean;
  selectedTileIds: string[];
  selectedBoardTileIds: string[];
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
  toggleBoardTileSelection: (tileId: string) => void;
  clearSelection: () => void;
  clearBoardSelection: () => void;
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
  selectedBoardTileIds: [],
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
  toggleBoardTileSelection: (tileId) =>
    set((state) => ({
      selectedBoardTileIds: state.selectedBoardTileIds.includes(tileId)
        ? state.selectedBoardTileIds.filter((id) => id !== tileId)
        : [...state.selectedBoardTileIds, tileId],
    })),
  clearSelection: () => set({ selectedTileIds: [] }),
  clearBoardSelection: () => set({ selectedBoardTileIds: [] }),
  stageCombination: () =>
    set((state) => {
      const hasHandTiles = state.selectedTileIds.length > 0;
      const hasBoardTiles = state.selectedBoardTileIds.length > 0;
      if (!hasHandTiles && !hasBoardTiles) return state;

      // 손패 타일: selectedTileIds 순서대로 추출 (조커 위치 보존)
      const handTiles = state.selectedTileIds
        .map((id) => state.myTiles.find((t) => t.id === id))
        .filter((t): t is Tile => t !== undefined);

      // 보드 타일: gameState.board에서 추출
      const boardTileMap = new Map<string, Tile>();
      state.gameState?.board.forEach((combo) => combo.tiles.forEach((t) => boardTileMap.set(t.id, t)));
      const boardTiles = state.selectedBoardTileIds
        .map((id) => boardTileMap.get(id))
        .filter((t): t is Tile => t !== undefined);

      const allTiles = [...handTiles, ...boardTiles];
      const stagedHandIds = new Set(state.selectedTileIds);

      return {
        stagedCombinations: [...state.stagedCombinations, allTiles],
        myTiles: state.myTiles.filter((t) => !stagedHandIds.has(t.id)),
        selectedTileIds: [],
        selectedBoardTileIds: [],
      };
    }),
  unstageCombo: (index) =>
    set((state) => {
      const combo = state.stagedCombinations[index];
      if (!combo) return state;

      // 보드 타일 식별 (gameState.board에 ID가 있는 타일)
      const allBoardTileIds = new Set(
        state.gameState?.board.flatMap((c) => c.tiles.map((t) => t.id)) ?? [],
      );

      // 손패 타일 → myTiles로 반환, 보드 타일 → selectedBoardTileIds로 반환
      const handTilesInCombo = combo.filter((t) => !allBoardTileIds.has(t.id));
      const boardTileIdsInCombo = combo
        .filter((t) => allBoardTileIds.has(t.id))
        .map((t) => t.id);

      return {
        stagedCombinations: state.stagedCombinations.filter((_, i) => i !== index),
        myTiles: [...state.myTiles, ...handTilesInCombo],
        selectedBoardTileIds: [...state.selectedBoardTileIds, ...boardTileIdsInCombo],
      };
    }),
  reorderStagedTile: (comboIndex, from, to) =>
    set((state) => {
      const updated = state.stagedCombinations.map((combo, i) =>
        i === comboIndex ? arrayMove(combo, from, to) : combo,
      );
      return { stagedCombinations: updated };
    }),
  clearAllStaged: () => set({ stagedCombinations: [], selectedBoardTileIds: [] }),
  setErrorMessage: (message) => set({ errorMessage: message }),
  reorderMyTiles: (activeIndex, overIndex) =>
    set((state) => ({
      myTiles: arrayMove(state.myTiles, activeIndex, overIndex),
    })),
  reset: () => set(initialState),
}));
