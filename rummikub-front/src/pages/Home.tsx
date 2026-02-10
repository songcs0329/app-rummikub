import { useSearchParams } from 'react-router';
import { useSocket } from '@/hooks/useSocket';
import CreateRoomForm from '@/components/CreateRoomForm';
import JoinRoomForm from '@/components/JoinRoomForm';

function Home() {
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get('roomCode');
  useSocket();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {roomCode ? <JoinRoomForm roomCode={roomCode} /> : <CreateRoomForm />}
    </div>
  );
}

export default Home;
