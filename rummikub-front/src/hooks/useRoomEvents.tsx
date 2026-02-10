import { useEffect } from 'react';
import type {
  RoomFoundPayload,
  PlayerJoinedPayload,
  PlayerLeftPayload,
  PlayerStatusChangedPayload,
} from '@/types/server.generated';
import { useSocketStore } from '@/store/useSocketStore';
import { useRoomStore } from '@/store/useRoomStore';

export function useRoomEvents(roomCode: string | undefined) {
  const socket = useSocketStore((state) => state.socket);
  const isConnected = useSocketStore((state) => state.isConnected);

  const room = useRoomStore((state) => state.room);
  const setRoom = useRoomStore((state) => state.setRoom);
  const updatePlayers = useRoomStore((state) => state.updatePlayers);
  const reset = useRoomStore((state) => state.reset);

  useEffect(() => {
    if (!socket || !isConnected || !roomCode) return;

    const handleRoomFound = (data: RoomFoundPayload) => {
      setRoom(data);
    };

    const handlePlayerJoined = (data: PlayerJoinedPayload) => {
      updatePlayers(data.players);
    };

    const handlePlayerLeft = (data: PlayerLeftPayload) => {
      updatePlayers(data.players);
    };

    const handlePlayerStatusChanged = (data: PlayerStatusChangedPayload) => {
      updatePlayers(data.players);
    };

    // 초기 방 정보 설정
    socket.on('roomFound', handleRoomFound);
    // 새 플레이어 참여 시 players 갱신
    socket.on('playerJoined', handlePlayerJoined);
    // 플레이어 퇴장 시 players 갱신
    socket.on('playerLeft', handlePlayerLeft);
    // 레디 상태 변경 시 players 갱신
    socket.on('playerStatusChanged', handlePlayerStatusChanged);

    socket.emit('findRoom', { roomCode });

    return () => {
      socket.off('roomFound', handleRoomFound);
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('playerLeft', handlePlayerLeft);
      socket.off('playerStatusChanged', handlePlayerStatusChanged);
      reset();
    };
  }, [socket, isConnected, roomCode, setRoom, updatePlayers, reset]);

  return {
    room,
  };
}
