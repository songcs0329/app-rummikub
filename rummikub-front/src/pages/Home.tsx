import { useSearchParams } from 'react-router';
import CreateRoomForm from '@/components/pages/home/CreateRoomForm';
import JoinRoomForm from '@/components/pages/home/JoinRoomForm';

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
