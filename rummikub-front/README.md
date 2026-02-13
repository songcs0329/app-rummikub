# Rummikub 프론트엔드

React 19 기반 실시간 멀티플레이어 루미큐브 보드게임 클라이언트입니다. Socket.io WebSocket을 통해 NestJS 백엔드와 통신하며, 모든 게임 상태 관리과 UI 렌더링을 담당합니다.

## 개요

루미큐브는 타일 기반 전략 게임으로, 2~4명의 플레이어가 타일을 조합하여 런(연속 숫자)이나 그룹(같은 숫자)을 만드는 게임입니다.

**이 프론트엔드의 핵심 책임:**

- Socket.io를 통한 실시간 서버 통신
- Zustand 스토어로 게임 상태 관리 (플레이어, 방, 게임 상태)
- React Hook Form + Zod를 사용한 폼 검증
- @dnd-kit을 활용한 타일 드래그 앤 드롭
- 반응형 UI (shadcn/ui + Tailwind CSS)

## 기술 스택

| 분류                | 라이브러리           | 버전    | 목적                                |
| ------------------- | -------------------- | ------- | ----------------------------------- |
| **프레임워크**      | React                | 19.1.0  | UI 렌더링                           |
| **빌드 도구**       | Vite                 | 7.0.4   | 번들링 및 개발 서버                 |
| **언어**            | TypeScript           | ~5.8.3  | 타입 안정성                         |
| **상태 관리**       | Zustand              | 5.0.7   | 전역 상태 (persist 미들웨어 적용)   |
| **폼 검증**         | React Hook Form      | 7.71.1  | 폼 관리 및 유효성 검사              |
|                     | Zod                  | 4.3.6   | 스키마 기반 검증                    |
| **API 통신**        | socket.io-client     | 4.8.3   | WebSocket 실시간 통신               |
| **라우팅**          | React Router         | 7.12.0  | 페이지 네비게이션                   |
| **UI 컴포넌트**     | shadcn/ui            | -       | 스타일된 컴포넌트 (New York 스타일) |
| **드래그 앤 드롭**  | @dnd-kit/core        | 6.3.1   | 타일 정렬 UI                        |
|                     | @dnd-kit/sortable    | 10.0.0  | 정렬 가능 기능                      |
| **스타일링**        | Tailwind CSS         | 4.1.18  | 유틸리티 기반 CSS                   |
| **HTTP 클라이언트** | Axios                | 1.13.2  | REST 요청 (선택적)                  |
| **쿼리 관리**       | TanStack React Query | 5.90.19 | 서버 상태 캐싱                      |
| **애니메이션**      | Motion               | 12.34.0 | UI 애니메이션                       |
| **바텀 시트**       | react-modal-sheet    | 5.2.1   | 게임 하단 영역 UI                   |

## 시작하기

### 사전 요구사항

- Node.js 18.0 이상
- npm 또는 yarn
- 백엔드 서버 실행 중 (http://localhost:3000)

### 설치

프로젝트 의존성을 설치합니다.

```bash
cd rummikub-front
npm install
```

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가합니다.

```env
# .env
VITE_APP_API_URL=http://localhost:3000
```

개발 환경의 경우 `.env.development` 파일이 이미 존재합니다:

```env
# .env.development (기존)
VITE_APP_API_URL=http://localhost:3000
```

### 개발 서버 실행

Vite 개발 서버를 시작합니다.

```bash
npm run dev
```

브라우저에서 http://localhost:5173 으로 접속합니다.

### 프로덕션 빌드

타입 체크 후 최적화된 번들을 생성합니다.

```bash
npm run build
```

빌드 결과물은 `dist/` 디렉토리에 생성됩니다.

### 빌드 미리보기

프로덕션 빌드를 로컬에서 미리 봅니다.

```bash
npm run preview
```

## npm 스크립트

| 스크립트         | 명령어                            | 설명                               |
| ---------------- | --------------------------------- | ---------------------------------- |
| `dev`            | `vite`                            | 개발 서버 시작 (hot reload 지원)   |
| `build`          | `tsc -b && vite build`            | TypeScript 컴파일 후 프로덕션 빌드 |
| `lint`           | `eslint .`                        | ESLint로 코드 스타일 검사          |
| `preview`        | `vite preview`                    | 프로덕션 빌드 미리보기             |
| `generate:types` | `node scripts/generate-types.mjs` | 서버 타입 정의 자동 생성           |

## 디렉토리 구조

```
rummikub-front/
├── src/
│   ├── components/          # React 컴포넌트
│   │   ├── ui/             # shadcn/ui 컴포넌트 (button, card, form 등)
│   │   ├── form/           # 폼 관련 컴포넌트 (InputFormField)
│   │   ├── pages/          # 페이지별 컴포넌트
│   │   │   ├── home/       # 홈 페이지 컴포넌트 (CreateRoomForm, JoinRoomForm)
│   │   │   └── room/       # 방 페이지 컴포넌트 (플레이어, 게임 화면)
│   │   │       └── game/   # 게임 플레이 컴포넌트 (보드, 타일, 액션 등)
│   │   ├── Layout.tsx      # 메인 레이아웃 컴포넌트
│   │
│   ├── pages/              # 라우트 페이지
│   │   ├── Home.tsx        # 홈페이지 (방 생성/참여)
│   │   ├── Room.tsx        # 방 페이지 (게임 플레이)
│   │   └── NotFound.tsx    # 404 페이지
│   │
│   ├── hooks/              # 커스텀 React 훅
│   │   ├── useSocket.tsx         # Socket.io 연결 관리
│   │   ├── useCreateRoomForm.tsx # 방 생성 폼 로직
│   │   ├── useJoinRoomForm.tsx   # 방 참여 폼 로직
│   │   ├── useRoomEvents.tsx     # 방 이벤트 핸들러
│   │   └── useGameEvents.tsx     # 게임 이벤트 핸들러
│   │
│   ├── store/              # Zustand 전역 상태 스토어
│   │   ├── useCustomerStore.ts   # 플레이어 세션 (persist 적용)
│   │   ├── useSocketStore.ts     # Socket.io 인스턴스 및 연결 상태
│   │   ├── useRoomStore.ts       # 방 정보 및 플레이어 목록
│   │   └── useGameStore.ts       # 게임 상태 (타일, 턴, 보드)
│   │
│   ├── types/              # TypeScript 타입 정의
│   │   └── server.generated.ts   # 백엔드 API 타입 (자동 생성)
│   │
│   ├── utils/              # 유틸리티 함수
│   │   └── tileUtils.ts    # 타일 정렬 및 조합 검증 로직
│   │
│   ├── lib/                # 라이브러리 래퍼
│   │   ├── socketUtils.ts  # Socket.io 싱글톤 패턴
│   │   └── utils.ts        # Tailwind 클래스명 병합 (clsx + tailwind-merge)
│   │
│   ├── routers/            # 라우팅 설정
│   │   └── Router.tsx      # React Router 라우트 정의
│   │
│   ├── App.tsx             # 메인 앱 컴포넌트
│   ├── main.tsx            # 앱 진입점 (React Root)
│   └── index.css           # 글로벌 스타일
│
├── .env.development        # 개발 환경 변수
├── vite.config.ts          # Vite 설정
├── tsconfig.json           # TypeScript 루트 설정
├── tsconfig.app.json       # TypeScript 앱 컴파일 설정
├── tsconfig.node.json      # TypeScript 노드 설정
├── eslint.config.mjs       # ESLint 설정
├── package.json            # 의존성 및 스크립트
└── README.md               # 이 파일
```

## 주요 패턴

### 1. Zustand 상태 관리

**Store 구조:** 상태와 액션을 분리하여 타입 안정성과 가독성을 확보합니다.

```typescript
// src/store/useCustomerStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Customer {
  nickname: string;
  playerId: string;
  roomCode: string;
  isHost: boolean;
}

export const useCustomerStore = create<CustomerStore>()(
  persist(
    (set) => ({
      customer: null,
      setCustomer: (data) => set({ customer: data }),
      reset: () => set({ customer: null }),
    }),
    {
      name: 'customer-storage', // localStorage 키
    },
  ),
);
```

**사용 예:**

```typescript
const customer = useCustomerStore((state) => state.customer);
const setCustomer = useCustomerStore((state) => state.setCustomer);
```

**주요 스토어:**

- `useCustomerStore`: 플레이어 세션 정보 (persist 적용, localStorage에 저장)
- `useSocketStore`: Socket.io 인스턴스 및 연결 상태
- `useRoomStore`: 방 정보 및 플레이어 목록
- `useGameStore`: 현재 게임 상태 (타일, 턴, 보드 상태)

### 2. React Hook Form + Zod 폼 검증

**패턴:** Zod 스키마 정의 → 타입 추론 → `useForm`에 `zodResolver` → shadcn `Form`/`FormField`

**Zod 스키마 정의:**

```typescript
// 방 생성 폼
const createRoomSchema = z.object({
  nickname: z.string().min(2, '닉네임은 최소 2자 이상이어야 합니다.').max(20, '닉네임은 최대 20자까지 가능합니다.'),
});

type CreateRoomFormValues = z.infer<typeof createRoomSchema>;
```

**useForm 초기화:**

```typescript
const form = useForm<CreateRoomFormValues>({
  resolver: zodResolver(createRoomSchema),
  defaultValues: {
    nickname: '',
  },
});
```

**컴포넌트 렌더링:**

```typescript
<Form {...form}>
  <FormField
    control={form.control}
    name="nickname"
    render={({ field }) => (
      <FormItem>
        <FormLabel>닉네임</FormLabel>
        <FormControl>
          <Input placeholder="닉네임 입력" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>
```

### 3. 커스텀 훅 기반 Socket 이벤트 처리

**Socket 연결 초기화:** `useSocket` 훅이 앱 시작 시 Socket.io를 초기화하고 연결합니다.

```typescript
// src/hooks/useSocket.tsx
export function useSocket() {
  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    if (!socket.connected) {
      socket.connect();
    }
    setSocket(socket);

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [setSocket, setIsConnected]);
}
```

**방 생성/참여 폼:** 폼 제출 시 Socket 이벤트를 emit하고, 서버 응답을 받아 상태를 업데이트합니다.

```typescript
// src/hooks/useCreateRoomForm.tsx
export function useCreateRoomForm() {
  const form = useForm<CreateRoomFormValues>({
    resolver: zodResolver(createRoomSchema),
  });

  const onSubmit = (values) => {
    if (!socket) return;
    socket.emit('createRoom', { nickname: values.nickname });
  };

  useEffect(() => {
    socket.on('roomCreated', (data: RoomCreatedPayload) => {
      setCustomer({
        nickname: data.player.nickname,
        playerId: data.player.id,
        roomCode: data.roomCode,
        isHost: data.player.isHost,
      });
      navigate(`/room/${data.roomCode}`);
    });

    socket.on('error', (data) => {
      form.setError('root', { message: data.message });
    });

    return () => {
      socket.off('roomCreated');
      socket.off('error');
    };
  }, [socket, form]);

  return { form, onSubmit };
}
```

### 4. @dnd-kit 타일 드래그 앤 드롭

**타일 정렬:** 플레이어가 손패의 타일을 드래그하여 순서를 변경합니다.

```typescript
// src/components/pages/room/game/TileRack.tsx
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableTile } from './SortableTile';

<DndContext
  sensors={useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  )}
  collisionDetection={closestCenter}
  onDragEnd={(event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderMyTiles(activeIndex, overIndex);
    }
  }}
>
  <SortableContext items={myTiles} strategy={verticalListSortingStrategy}>
    {myTiles.map((tile) => (
      <SortableTile key={tile.id} tile={tile} />
    ))}
  </SortableContext>
</DndContext>
```

### 5. Socket.io 싱글톤 패턴

**목적:** 앱 전체에서 하나의 Socket 인스턴스만 유지하여 중복 연결 방지

```typescript
// src/lib/socketUtils.ts
const SOCKET_URL = import.meta.env.VITE_APP_API_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      autoConnect: false, // 명시적 connect() 호출 대기
      transports: ['websocket'], // WebSocket만 사용
    });
  }
  return socket;
};
```

**핵심 설정:**

- `autoConnect: false` - 컴포넌트가 이벤트 리스너를 등록한 후 connect() 호출
- `transports: ['websocket']` - HTTP 롱폴링 폴백 제거로 빠른 연결 및 실시간 성능 확보

### 6. 경로 별칭 (Path Alias)

**설정:**

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**사용:**

```typescript
// 절대 경로로 깔끔한 import
import { useSocketStore } from '@/store/useSocketStore';
import Layout from '@/components/Layout';
import { getSocket } from '@/lib/socketUtils';

// 상대 경로 사용 필요 없음
// import { useSocketStore } from '../../../store/useSocketStore';
```

## shadcn/ui 컴포넌트 추가

shadcn/ui는 Radix UI와 Tailwind CSS를 기반으로 한 컴포넌트 라이브러리입니다. 프로젝트에 필요한 컴포넌트를 선택적으로 추가할 수 있습니다.

### 컴포넌트 추가 명령어

```bash
npx shadcn@latest add <컴포넌트명>
```

### 자주 사용되는 컴포넌트

| 컴포넌트 | 설명                 | 추가 명령어                    |
| -------- | -------------------- | ------------------------------ |
| Button   | 클릭 가능한 버튼     | `npx shadcn@latest add button` |
| Input    | 텍스트 입력 필드     | `npx shadcn@latest add input`  |
| Card     | 카드 컨테이너        | `npx shadcn@latest add card`   |
| Form     | React Hook Form 통합 | `npx shadcn@latest add form`   |
| Label    | 폼 라벨              | `npx shadcn@latest add label`  |
| Badge    | 상태 표시 배지       | `npx shadcn@latest add badge`  |
| Dialog   | 모달 다이얼로그      | `npx shadcn@latest add dialog` |

### 컴포넌트 경로

추가된 컴포넌트는 `src/components/ui/` 디렉토리에 저장됩니다.

```bash
# 추가 후
src/components/ui/
├── button.tsx
├── card.tsx
├── form.tsx
├── input.tsx
├── label.tsx
├── badge.tsx
└── ...
```

### 컴포넌트 사용 예

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>제목</CardTitle>
      </CardHeader>
      <CardContent>
        <Label htmlFor="input">라벨</Label>
        <Input id="input" placeholder="입력하세요" />
        <Button>클릭</Button>
      </CardContent>
    </Card>
  );
}
```

## 라우팅

React Router 7을 사용하여 페이지를 관리합니다.

### 라우트 구조

```typescript
// src/routers/Router.tsx
const routes: RouteObject[] = [
  {
    Component: Layout,
    children: [
      { index: true, Component: Home }, // /
      { path: '/room/:roomCode', Component: Room }, // /room/:roomCode
      { path: '*', Component: NotFound }, // 404
    ],
  },
];
```

### 페이지 구성

| 경로              | 컴포넌트   | 설명                    |
| ----------------- | ---------- | ----------------------- |
| `/`               | `Home`     | 홈페이지 (방 생성/참여) |
| `/room/:roomCode` | `Room`     | 게임 플레이 페이지      |
| `*`               | `NotFound` | 404 에러 페이지         |

### 네비게이션

```typescript
import { useNavigate } from 'react-router';

function MyComponent() {
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    // 방 생성 후 이동
    navigate(`/room/${roomCode}`);
  };

  return <button onClick={handleCreateRoom}>방 생성</button>;
}
```

## Socket.io 이벤트

모든 클라이언트-서버 통신은 Socket.io WebSocket 이벤트를 통합니다. REST API 엔드포인트는 없습니다.

### 클라이언트 → 서버 이벤트

| 이벤트             | 페이로드                                 | 설명                 |
| ------------------ | ---------------------------------------- | -------------------- |
| `createRoom`       | `{ nickname: string }`                   | 방 생성 요청         |
| `joinRoom`         | `{ roomCode: string; nickname: string }` | 방 참여 요청         |
| `findRoom`         | `{ roomCode: string }`                   | 방 정보 조회         |
| `rejoinRoom`       | `{ roomCode: string; playerId: string }` | 재접속               |
| `playerReady`      | `{ roomCode: string }`                   | 플레이어 준비 완료   |
| `startGame`        | `{ roomCode: string }`                   | 게임 시작 (호스트만) |
| `drawTile`         | `{ roomCode: string }`                   | 덱에서 타일 드로우   |
| `placeCombination` | `{ roomCode: string; combination: any }` | 조합 배치            |
| `endTurn`          | `{ roomCode: string }`                   | 턴 종료              |
| `leaveRoom`        | `{ roomCode: string }`                   | 방 나가기            |

### 서버 → 클라이언트 이벤트

| 이벤트         | 페이로드                                   | 설명               |
| -------------- | ------------------------------------------ | ------------------ |
| `roomCreated`  | `{ roomCode: string; player: Player }`     | 방 생성 성공       |
| `joinedRoom`   | `{ roomCode: string; players: Player[] }`  | 방 참여 성공       |
| `playerJoined` | `{ player: Player }`                       | 다른 플레이어 입장 |
| `gameStarted`  | `{ gameState: GameState }`                 | 게임 시작          |
| `yourTurn`     | -                                          | 현재 플레이어의 턴 |
| `tileDrawn`    | `{ tile: Tile }`                           | 타일 드로우 성공   |
| `boardUpdated` | `{ gameState: GameState }`                 | 보드 상태 변경     |
| `gameOver`     | `{ winner: Player; gameState: GameState }` | 게임 종료          |
| `error`        | `{ message: string }`                      | 에러 발생          |

## 개발 팁

### TypeScript 타입 검사

```bash
npm run build  # 전체 빌드 (타입 체크 포함)
```

또는 IDE의 TypeScript 기능을 사용하여 실시간 오류를 확인합니다.

### 자동 타입 생성

백엔드 API 응답 타입을 자동으로 생성합니다:

```bash
npm run generate:types
```

생성된 타입은 `src/types/server.generated.ts`에 저장됩니다.

## 환경별 빌드

### 개발 환경

```bash
npm run dev
```

### 프로덕션 환경

```bash
npm run build
npm run preview
```

환경 변수를 변경하려면 `.env` 또는 `.env.production` 파일을 수정합니다.

## 문제 해결

### 포트 5173이 이미 사용 중인 경우

```bash
npm run dev -- --port 5174
```

### Socket.io 연결 실패

1. **백엔드 서버 확인:** `http://localhost:3000`에서 실행 중인지 확인
2. **환경 변수 확인:** `.env`의 `VITE_APP_API_URL` 값 확인
3. **방화벽 확인:** WebSocket 포트(3000) 차단 여부 확인
4. **브라우저 콘솔 확인:** 네트워크 탭에서 WebSocket 연결 상태 확인

### 타일 렌더링 오류

- 타일의 고유 ID(`id`) 속성이 올바른지 확인
- `@dnd-kit` 관련 에러는 드래그 컨텍스트 설정 확인

## 참고 문서

- [React 공식 문서](https://react.dev)
- [Vite 공식 문서](https://vite.dev)
- [TypeScript 공식 문서](https://www.typescriptlang.org)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [React Hook Form 공식 문서](https://react-hook-form.com)
- [Zod 공식 문서](https://zod.dev)
- [shadcn/ui 공식 문서](https://ui.shadcn.com)
- [Socket.io 클라이언트 문서](https://socket.io/docs/v4/client-api/)
- [React Router 공식 문서](https://reactrouter.com)
- [Tailwind CSS 공식 문서](https://tailwindcss.com)
- [@dnd-kit 공식 문서](https://docs.dnd-kit.com)
