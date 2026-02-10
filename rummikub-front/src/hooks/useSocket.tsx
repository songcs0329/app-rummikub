import { useEffect } from 'react';
import { createSocket } from '@/lib/socketUtils';
import { useSocketStore } from '@/store/useSocketStore';

export function useSocket() {
  const { setSocket, setIsConnected } = useSocketStore();

  useEffect(() => {
    const socket = createSocket();

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.connect();
    setSocket(socket);

    return () => {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [setSocket, setIsConnected]);
}
