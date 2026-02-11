import { useNavigate } from 'react-router';
import { LogOut, Play, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomerStore } from '@/store/useCustomerStore';
import { useSocketStore } from '@/store/useSocketStore';
import { useRoomStore } from '@/store/useRoomStore';
import { GAME_CONSTANTS } from '@/types/server.generated';

function PlayerActions() {
  const navigate = useNavigate();

  const customer = useCustomerStore((state) => state.customer);
  const resetCustomer = useCustomerStore((state) => state.reset);

  const socket = useSocketStore((state) => state.socket);
  const room = useRoomStore((state) => state.room);

  if (!customer || !room) return null;

  const currentPlayer = room.players.find((p) => p.id === customer.playerId);
  const isReady = currentPlayer?.isReady ?? false;

  const handleLeaveRoom = () => {
    if (!socket) return;
    socket.emit('leaveRoom', { roomCode: customer.roomCode });
    resetCustomer();
    navigate('/');
  };

  const handleToggleReady = () => {
    if (!socket) return;
    socket.emit('playerReady', { roomCode: customer.roomCode });
  };

  const handleStartGame = () => {
    if (!socket) return;
    socket.emit('startGame', { roomCode: customer.roomCode });
  };

  // 게임 시작 가능 여부 체크 (호스트용)
  const canStartGame = () => {
    if (room.players.length < GAME_CONSTANTS.MIN_PLAYERS) return false;
    const nonHostPlayers = room.players.filter((p) => !p.isHost);
    return nonHostPlayers.every((p) => p.isReady);
  };

  return (
    <div className="flex flex-col gap-2">
      {customer.isHost ? (
        <Button size="lg" className="w-full" onClick={handleStartGame} disabled={!canStartGame()}>
          <Play />
          게임 시작
        </Button>
      ) : (
        <Button size="lg" className="w-full" variant={isReady ? 'secondary' : 'default'} onClick={handleToggleReady}>
          {isReady ? <X /> : <Check />}
          {isReady ? '준비 취소' : '준비'}
        </Button>
      )}
      <Button size="lg" className="w-full" variant="destructive" onClick={handleLeaveRoom}>
        <LogOut />방 나가기
      </Button>
    </div>
  );
}

export default PlayerActions;
