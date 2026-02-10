import { useQuery } from '@tanstack/react-query';
import apiManager from '@/libs/apis/apiManager';

export const useTodo = (todoId: number | undefined) => {
  return useQuery({
    queryKey: ['todo', todoId],
    queryFn: async () => {
      const { data } = await apiManager.getTodo(todoId!);
      return data;
    },
    enabled: !!todoId,
  });
};
