import { useForm } from 'react-hook-form';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CustomerPlayer } from '@/types/rummikub-front.types';
import { useSocketStore } from '@/store/useSocketStore';
import { useCustomerStore } from '@/store/useCustomerStore';

const createRoomSchema = z.object({
  nickname: z.string().min(2, '닉네임은 최소 2자 이상이어야 합니다.').max(20, '닉네임은 최대 20자까지 가능합니다.'),
});

type CreateRoomFormValues = z.infer<typeof createRoomSchema>;

export function useCreateRoomForm() {
  const navigate = useNavigate();

  const { socket } = useSocketStore();
  const { setCustomer } = useCustomerStore();

  const form = useForm<CreateRoomFormValues>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      nickname: '',
    },
  });

  // 폼 제출 핸들러: 서버에 'createRoom' 이벤트를 emit하여 방 생성 요청
  const onSubmit = useCallback(
    (values: CreateRoomFormValues) => {
      if (!socket) return;
      socket.emit('createRoom', { nickname: values.nickname });
    },
    [socket],
  );

  // 서버 소켓 이벤트 리스너 등록/해제
  useEffect(() => {
    if (!socket) return;

    // 방 생성 성공 시: 서버로부터 roomCode, player 정보를 받아 고객 상태 업데이트
    const handleRoomCreated = (data: { roomCode: string; player: CustomerPlayer }) => {
      setCustomer({
        nickname: data.player.nickname,
        playerId: data.player.id,
        roomCode: data.roomCode,
        isHost: data.player.isHost,
      });

      navigate(`/room/${data.roomCode}`);
    };

    // 에러 발생 시: 서버 에러 메시지를 폼의 root 에러로 설정하여 UI에 표시
    const handleError = (data: { message: string }) => {
      form.setError('root', { message: data.message });
    };

    socket.on('roomCreated', handleRoomCreated);
    socket.on('error', handleError);

    // 언마운트 시 리스너 정리 (메모리 누수 방지)
    return () => {
      socket.off('roomCreated', handleRoomCreated);
      socket.off('error', handleError);
    };
  }, [socket, form, setCustomer, navigate]);

  return { form, onSubmit };
}
