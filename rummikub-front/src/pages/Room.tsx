import { Navigate, useParams } from 'react-router';
import { useRoomEvents } from '@/hooks/useRoomEvents';
import { useCustomerStore } from '@/store/useCustomerStore';

function Room() {
  const { roomCode } = useParams();

  const customer = useCustomerStore((state) => state.customer);

  const { room } = useRoomEvents(roomCode);
  console.log('useRoomEvents ===>', room);

  if (!customer) return <Navigate to={`/?roomCode=${roomCode}`} replace />;

  return (
    <div>
      <h1>Room</h1>
      <div>{roomCode}</div>
      <div>{JSON.stringify(customer)}</div>
      {room && (
        <div className="flex flex-col gap-y-2">
          {room.players.map((player) => {
            return (
              <div key={player.id} className="border border-red-500">
                {JSON.stringify(player)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Room;
