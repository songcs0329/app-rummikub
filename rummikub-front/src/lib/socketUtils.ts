import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000';

export const createSocket = (): Socket => {
  return io(SOCKET_URL, {
    autoConnect: false,
    transports: ['websocket'],
  });
};

export type { Socket };
