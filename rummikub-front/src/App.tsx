import { useSocket } from '@/hooks/useSocket';
import Router from '@/routers/Router';

function App() {
  useSocket();

  return <Router />;
}

export default App;
