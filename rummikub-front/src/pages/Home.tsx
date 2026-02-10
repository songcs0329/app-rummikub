import { useSearchParams } from 'react-router';
import CreateRoomForm from '@/components/CreateRoomForm';
import JoinRoomForm from '@/components/JoinRoomForm';

function Home() {
  const [searchParams] = useSearchParams();
  const roomCode = searchParams.get('roomCode');

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {roomCode ? <JoinRoomForm roomCode={roomCode} /> : <CreateRoomForm />}
    </div>
  );
}

export default Home;
