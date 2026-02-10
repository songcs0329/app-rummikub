import { useEffect } from 'react';
import { getSocket } from '@/lib/socketUtils';
import { useSocketStore } from '@/store/useSocketStore';

export function useSocket() {
  const setSocket = useSocketStore((state) => state.setSocket);
  const setIsConnected = useSocketStore((state) => state.setIsConnected);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (!socket.connected) {
      socket.connect();
    }
    setSocket(socket);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [setSocket, setIsConnected]);
}
