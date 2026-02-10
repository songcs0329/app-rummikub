import { Navigate, useParams } from 'react-router';
import { useFindRoom } from '@/hooks/useFindRoom';
import { useCustomerStore } from '@/store/useCustomerStore';

function Room() {
  const { roomCode } = useParams();

  const { customer } = useCustomerStore();

  useFindRoom(roomCode);

  if (!customer) return <Navigate to={`/?roomCode=${roomCode}`} replace />;

  return (
    <div>
      <h1>Room</h1>
      <div>{roomCode}</div>
      <div>{JSON.stringify(customer)}</div>
    </div>
  );
}

export default Room;
