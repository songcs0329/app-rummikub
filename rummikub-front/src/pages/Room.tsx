import { Navigate, useParams } from 'react-router';
import { useRoomEvents } from '@/hooks/useRoomEvents';
import { useCustomerStore } from '@/store/useCustomerStore';
import PlayersContainer from '@/components/pages/room/PlayersContainer';

function Room() {
  const { roomCode } = useParams();

  const customer = useCustomerStore((state) => state.customer);

  const { room } = useRoomEvents(roomCode);

  if (!customer) return <Navigate to={`/?roomCode=${roomCode}`} replace />;

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
