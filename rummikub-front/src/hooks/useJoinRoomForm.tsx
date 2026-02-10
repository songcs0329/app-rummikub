import { useForm } from 'react-hook-form';
import { useCallback, useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { CustomerPlayer } from '@/types/rummikub-front.types';
import { useSocketStore } from '@/store/useSocketStore';
import { useCustomerStore } from '@/store/useCustomerStore';

const joinRoomSchema = z.object({
  roomCode: z.string().length(6, '방 코드는 6자리여야 합니다.'),
  nickname: z.string().min(2, '닉네임은 최소 2자 이상이어야 합니다.').max(20, '닉네임은 최대 20자까지 가능합니다.'),
});

type JoinRoomFormValues = z.infer<typeof joinRoomSchema>;

export function useJoinRoomForm(initialRoomCode?: string) {
  const { socket } = useSocketStore();
  const { setCustomer } = useCustomerStore();

  const form = useForm<JoinRoomFormValues>({
    resolver: zodResolver(joinRoomSchema),
    defaultValues: {
      roomCode: initialRoomCode ?? '',
      nickname: '',
    },
  });

  // 폼 제출 핸들러: 서버에 'joinRoom' 이벤트를 emit하여 방 참여 요청
  const onSubmit = useCallback(
    (values: JoinRoomFormValues) => {
      if (!socket) return;
      socket.emit('joinRoom', {
        roomCode: values.roomCode,
        nickname: values.nickname,
      });
    },
    [socket],
  );

  // 서버 소켓 이벤트 리스너 등록/해제
  useEffect(() => {
    if (!socket) return;

    // 방 참여 성공 시: 플레이어 목록에서 본인 정보를 찾아 고객 상태 업데이트
    const handleJoinedRoom = (data: {
      roomCode: string;
      players: CustomerPlayer[];
      myPlayerId: string;
      isHost: boolean;
    }) => {
      const myPlayer = data.players.find((p) => p.id === data.myPlayerId);
      setCustomer({
        nickname: myPlayer?.nickname ?? '',
        playerId: data.myPlayerId,
        roomCode: data.roomCode,
        isHost: data.isHost,
      });
    };

    // 에러 발생 시: 서버 에러 메시지를 폼의 root 에러로 설정하여 UI에 표시
    const handleError = (data: { message: string }) => {
      form.setError('root', { message: data.message });
    };

    socket.on('joinedRoom', handleJoinedRoom);
    socket.on('error', handleError);

    // 언마운트 시 리스너 정리 (메모리 누수 방지)
    return () => {
      socket.off('joinedRoom', handleJoinedRoom);
      socket.off('error', handleError);
    };
  }, [socket, setCustomer, form]);

  return { form, onSubmit };
}
