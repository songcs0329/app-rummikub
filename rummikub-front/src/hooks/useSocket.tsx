import { useEffect } from 'react';
import { getSocket } from '@/lib/socketUtils';
import { useSocketStore } from '@/store/useSocketStore';

export function useSocket() {
  const setSocket = useSocketStore((state) => state.setSocket);
  const setIsConnected = useSocketStore((state) => state.setIsConnected);

  useEffect(() => {
    console.log('==== mounted useSocket.tsx ====');
    const socket = getSocket();

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', () => {
      console.log('==== socket is connect ====');
      onConnect();
    });
    socket.on('disconnect', () => {
      console.log('==== socket is disconnect ====');
      onDisconnect();
    });

    if (!socket.connected) {
      socket.connect();
    }
    setSocket(socket);

    return () => {
      console.log('==== unmounted useSocket.tsx ====');
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [setSocket, setIsConnected]);
}
