import { useParams } from 'react-router';
import { useTodo } from '@/hooks/useTodo';

function TodoDetail() {
  const { todoId } = useParams<{ todoId: string }>();
  const { data: todo, isLoading, isError } = useTodo(todoId ? Number(todoId) : undefined);

  if (!todo || isError || isLoading) return null;

  return (
    <ul>
      <li>Title: {todo.title}</li>
      <li>ID: {todo.id}</li>
      <li>User ID: {todo.userId}</li>
      <li>Completed: {todo.completed.toString()}</li>
    </ul>
  );
}

export default TodoDetail;
