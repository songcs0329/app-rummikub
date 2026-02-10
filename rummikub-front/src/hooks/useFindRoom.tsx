import { useEffect } from 'react';
import type { RoomFoundData } from '@/types/rummikub-front.types';
import { useSocketStore } from '@/store/useSocketStore';

export function useFindRoom(roomCode: string | undefined) {
  const socket = useSocketStore((state) => state.socket);
  const isConnected = useSocketStore((state) => state.isConnected);

  useEffect(() => {
    if (!socket || !isConnected || !roomCode) return;

    const handleRoomFound = (data: RoomFoundData) => {
      console.log('Room found:', data);
    };

    socket.on('roomFound', handleRoomFound);
    socket.emit('findRoom', { roomCode });

    return () => {
      socket.off('roomFound', handleRoomFound);
    };
  }, [socket, isConnected, roomCode]);
}
