import { Navigate, useParams } from 'react-router';
import { useRoomEvents } from '@/hooks/useRoomEvents';
import { useCustomerStore } from '@/store/useCustomerStore';
import PlayersContainer from '@/components/pages/room/PlayersContainer';

function Room() {
  const { roomCode } = useParams();

  const customer = useCustomerStore((state) => state.customer);

  const { room } = useRoomEvents(roomCode);
  console.log('useRoomEvents ==>', room);

  if (!customer) return <Navigate to={`/?roomCode=${roomCode}`} replace />;

  if (!room) return <div>room loading...</div>;

  if (room?.gameStarted) {
    // 게임 시작됐을 때 랜더링할 컴포넌트
    return <div></div>;
  }

  // 게임 대기 때 랜더링할 컴포넌트
  return (
    <div>
      <h1>Room</h1>
      <div>{roomCode}</div>
      <div>{JSON.stringify(customer)}</div>
      {room && (
        <div className="flex flex-col gap-y-2 bg-red-100">
          <PlayersContainer players={room.players} />
        </div>
      )}
    </div>
  );
}

export default Room;
