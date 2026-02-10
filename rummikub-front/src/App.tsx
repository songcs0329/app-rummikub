import { BrowserRouter, Routes, Route } from 'react-router';
import Home from '@/pages/Home';
import Todos from '@/pages/Todos';
import TodoDetail from '@/pages/Todos/TodoDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/todos" element={<Todos />} />
        <Route path="/todos/:todoId" element={<TodoDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
