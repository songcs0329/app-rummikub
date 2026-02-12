import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useRoomEvents } from '@/hooks/useRoomEvents';
import { useCustomerStore } from '@/store/useCustomerStore';
import PlayersContainer from '@/components/pages/room/PlayersContainer';
import ShareRoom from '@/components/pages/room/ShareRoom';
import PlayerActions from '@/components/pages/room/PlayerActions';
import GameView from '@/components/pages/room/game/GameView';
import { useGameStore } from '@/store/useGameStore';
import { Button } from '@/components/ui/button';

function Room() {
  const { roomCode } = useParams();
  const navigate = useNavigate();

  const customer = useCustomerStore((state) => state.customer);
  console.log('customer', customer);

  const gameState = useGameStore((state) => state.gameState);
  console.log('gameState', gameState);

  const { room } = useRoomEvents(roomCode);
  console.log('room', room);

  const handleJoinRoom = useCallback(() => {
    navigate(`/?roomCode=${roomCode}`);
  }, [roomCode, navigate]);

  const handleGoHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const renderRoomContents = useMemo(() => {
    if (!customer || !room) {
      return (
        <div className="flex flex-col gap-4 p-4 h-full justify-center">
          <Button variant="default" size="lg" className="w-full" onClick={handleJoinRoom}>
            방 참여하기
          </Button>
          <Button variant="secondary" size="lg" className="w-full" onClick={handleGoHome}>
            홈으로
          </Button>
        </div>
      );
    }

    // 게임 시작 때 랜더링할 컴포넌트
    if (gameState) {
      return <GameView />;
    }

    // 게임 대기 때 랜더링할 컴포넌트
    return (
      <>
        {/** 플레이어 목록 */}
        <PlayersContainer players={room.players} />
        {/** 액션버튼 */}
        <div className="flex flex-col gap-4">
          {customer.isHost && <ShareRoom roomCode={roomCode!} />}
          <PlayerActions />
        </div>
      </>
    );
  }, [customer, room, gameState, roomCode, handleJoinRoom, handleGoHome]);

  return <div className="h-full flex flex-1 flex-col justify-between p-4 overflow-auto">{renderRoomContents}</div>;
}

export default Room;
