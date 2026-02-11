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
    <div className="h-full flex flex-1 flex-col justify-between">
      {/** 플레이어 목록 */}
      <PlayersContainer players={room.players} />
      {/** 액션버튼 */}
      <div className="bg-red-500 flex flex-col gap-4">
        {customer.isHost && <ShareRoom roomCode={roomCode!} />}
        <div className="bg-white">유저 동작</div>
      </div>
    </div>
  );
}

export default Room;
