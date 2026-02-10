import { useEffect } from 'react';
import type {
  RoomFoundPayload,
  PlayerJoinedPayload,
  PlayerLeftPayload,
  PlayerStatusChangedPayload,
} from '@/types/server.generated';
import { useSocketStore } from '@/store/useSocketStore';
import { useRoomStore } from '@/store/useRoomStore';
import { useCustomerStore } from '@/store/useCustomerStore';

export function useRoomEvents(roomCode: string | undefined) {
  const socket = useSocketStore((state) => state.socket);
  const isConnected = useSocketStore((state) => state.isConnected);

  const customer = useCustomerStore((state) => state.customer);

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

    /**
     * findRoom: 초기 방 정보 설정,
     * rejoinRoom: 기존 세션을 복구한다.
     * */
    socket.on('roomFound', handleRoomFound);
    // 새 플레이어 참여 시 players 갱신
    socket.on('playerJoined', handlePlayerJoined);
    // 플레이어 퇴장 시 players 갱신
    socket.on('playerLeft', handlePlayerLeft);
    // 레디 상태 변경 시 players 갱신
    socket.on('playerStatusChanged', handlePlayerStatusChanged);

    /**
     * 새로고침 시 플레이어가 방에서 제거되는 문제 해결.
     * 소켓 연결 해제 시 30초 유예 기간을 두고,
     * 클라이언트가 persist된 customer가 없을 경우 findRoom 이벤트,
     * 있을 경우 customer.playerId로 rejoinRoom 이벤트를 보내 기존 세션을 복구한다.
     */
    if (!customer) {
      socket.emit('findRoom', { roomCode });
    } else {
      socket.emit('rejoinRoom', { roomCode, playerId: customer.playerId });
    }

    return () => {
      socket.off('roomFound', handleRoomFound);
      socket.off('playerJoined', handlePlayerJoined);
      socket.off('playerLeft', handlePlayerLeft);
      socket.off('playerStatusChanged', handlePlayerStatusChanged);
      reset();
    };
  }, [socket, isConnected, customer, roomCode, setRoom, updatePlayers, reset]);

  return {
    room,
  };
}
