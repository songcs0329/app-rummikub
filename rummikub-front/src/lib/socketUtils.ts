import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket'],
    });
  }
  return socket;
};

export type { Socket };
