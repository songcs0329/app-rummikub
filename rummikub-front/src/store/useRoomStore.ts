import { create } from 'zustand';
import type { RoomFoundPayload, PlayerPublicInfo } from '@/types/server.generated';

export interface RoomState {
  room: RoomFoundPayload | null;
}

export interface RoomActions {
  setRoom: (room: RoomFoundPayload) => void;
  updatePlayers: (players: PlayerPublicInfo[]) => void;
  reset: () => void;
}

export type RoomStore = RoomState & RoomActions;

const initialState: RoomState = {
  room: null,
};

export const useRoomStore = create<RoomStore>((set) => ({
  ...initialState,
  setRoom: (room) => set({ room }),
  updatePlayers: (players) =>
    set((state) => {
      if (!state.room) return state;
      return { room: { ...state.room, players } };
    }),
  reset: () => set(initialState),
}));
