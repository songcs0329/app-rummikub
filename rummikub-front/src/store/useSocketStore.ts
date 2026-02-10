import { create } from 'zustand';
import type { Socket } from '@/lib/socketUtils';

export interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
}

export interface SocketActions {
  setSocket: (socket: Socket | null) => void;
  setIsConnected: (isConnected: boolean) => void;
}

export type SocketStore = SocketState & SocketActions;

const initialState: SocketState = {
  socket: null,
  isConnected: false,
};

export const useSocketStore = create<SocketStore>((set) => ({
  ...initialState,
  setSocket: (socket) => set({ socket }),
  setIsConnected: (isConnected) => set({ isConnected }),
}));
