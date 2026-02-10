import { BrowserRouter, Routes, Route } from 'react-router';
import Home from '@/pages/Home';
import Room from '@/pages/Room';
import { useSocket } from '@/hooks/useSocket';

function App() {
  useSocket();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/room/:roomCode" element={<Room />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
