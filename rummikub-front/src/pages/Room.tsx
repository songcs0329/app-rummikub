import { Navigate, useParams } from 'react-router';
import { useRoomEvents } from '@/hooks/useRoomEvents';
import { useCustomerStore } from '@/store/useCustomerStore';
import PlayersContainer from '@/components/pages/room/PlayersContainer';
import ShareRoom from '@/components/pages/room/ShareRoom';

function Room() {
  const { roomCode } = useParams();

  const customer = useCustomerStore((state) => state.customer);

  const { room } = useRoomEvents(roomCode);

  if (!customer) return <Navigate to={`/?roomCode=${roomCode}`} replace />;

  if (!room) return null;

  if (room.gameStarted) {
    // 게임 시작됐을 때 랜더링할 컴포넌트
    return <div></div>;
  }

  // 게임 대기 때 랜더링할 컴포넌트
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-2xl flex-col gap-y-4">
        <ShareRoom roomCode={roomCode!} />
        <PlayersContainer players={room.players} />
      </div>
    </div>
  );
}

export default Room;
