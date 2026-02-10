import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000';

/**
 * 싱글톤 패턴: 앱 전체에서 하나의 소켓 인스턴스만 유지한다.
 * 여러 컴포넌트가 각각 소켓을 생성하면 서버와 중복 연결이 발생하고,
 * 이벤트 리스너가 꼬이거나 방/플레이어 매핑이 깨질 수 있다.
 */
let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      /**
       * 소켓 생성 시점과 연결 시점을 분리한다.
       * 컴포넌트가 이벤트 리스너를 먼저 등록한 뒤 명시적으로 connect()를 호출해야
       * 연결 직후 서버가 보내는 이벤트를 놓치지 않는다.
       */
      autoConnect: false,
      /**
       * polling 폴백 없이 WebSocket만 사용한다.
       * 루미큐브는 실시간 게임이라 HTTP 롱폴링의 지연이 부적합하고,
       * 불필요한 프로토콜 업그레이드 핸드셰이크를 건너뛰어 초기 연결이 빨라진다.
       */
      transports: ['websocket'],
    });
  }
  return socket;
};

/** 소비자가 socket.io-client를 직접 의존하지 않아도 Socket 타입을 쓸 수 있도록 재export한다. */
export type { Socket };
