# Rummikub 프론트엔드

React 19 기반 실시간 멀티플레이어 루미큐브 보드게임 클라이언트입니다. Socket.io WebSocket을 통해 NestJS 백엔드와 통신하며, 모든 게임 상태 관리와 UI 렌더링을 담당합니다.

## 기술 스택

| 분류               | 라이브러리        | 버전    | 목적                                |
| ------------------ | ----------------- | ------- | ----------------------------------- |
| **프레임워크**     | React             | 19.1.0  | UI 렌더링                           |
| **빌드 도구**      | Vite              | 7.0.4   | 번들링 및 개발 서버                 |
| **언어**           | TypeScript        | ~5.8.3  | 타입 안정성                         |
| **상태 관리**      | Zustand           | 5.0.7   | 전역 상태 (persist 미들웨어 적용)   |
| **폼 검증**        | React Hook Form   | 7.71.1  | 폼 관리 및 유효성 검사              |
|                    | Zod               | 4.3.6   | 스키마 기반 검증                    |
| **API 통신**       | socket.io-client  | 4.8.3   | WebSocket 실시간 통신               |
| **라우팅**         | React Router      | 7.12.0  | 페이지 네비게이션                   |
| **UI 컴포넌트**    | shadcn/ui         | -       | 스타일된 컴포넌트 (New York 스타일) |
| **드래그 앤 드롭** | @dnd-kit/core     | 6.3.1   | 타일 정렬 UI                        |
|                    | @dnd-kit/sortable | 10.0.0  | 정렬 가능 기능                      |
| **스타일링**       | Tailwind CSS      | 4.1.18  | 유틸리티 기반 CSS                   |
| **애니메이션**     | Motion            | 12.34.0 | UI 애니메이션                       |
| **바텀 시트**      | react-modal-sheet | 5.2.1   | 게임 하단 영역 UI                   |

## 시작하기

### 사전 요구사항

- Node.js 18.0 이상
- 백엔드 서버 실행 중 (`http://localhost:3000`)

### 설치 및 실행

```bash
cd rummikub-front
npm install
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속합니다.

### 환경 변수 (`.env.development`)

```env
VITE_APP_API_URL=http://localhost:3000
```

## npm 스크립트

| 스크립트  | 명령어                 | 설명                               |
| --------- | ---------------------- | ---------------------------------- |
| `dev`     | `vite`                 | 개발 서버 시작                     |
| `build`   | `tsc -b && vite build` | TypeScript 컴파일 후 프로덕션 빌드 |
| `lint`    | `eslint .`             | ESLint 코드 검사                   |
| `preview` | `vite preview`         | 프로덕션 빌드 미리보기             |

## 디렉토리 구조

```
rummikub-front/src/
├── components/
│   ├── form/
│   │   └── InputFormField.tsx       # 공통 폼 필드
│   ├── Layout.tsx                   # 레이아웃 래퍼
│   ├── pages/
│   │   ├── home/
│   │   │   ├── CreateRoomForm.tsx   # 방 생성 폼
│   │   │   └── JoinRoomForm.tsx     # 방 참여 폼
│   │   └── room/
│   │       ├── PlayerActions.tsx    # 준비 버튼
│   │       ├── PlayerCard.tsx       # 플레이어 카드
│   │       ├── PlayersContainer.tsx # 대기실 플레이어 목록
│   │       ├── ShareRoom.tsx        # 방 코드 공유
│   │       └── game/
│   │           ├── GameView.tsx         # 게임 레이아웃 오케스트레이터
│   │           ├── GameHeader.tsx       # 현재 턴, 덱 수량 표시
│   │           ├── PlayerInfoBar.tsx    # 전체 플레이어 상태 바
│   │           ├── GameBoard.tsx        # 보드 조합 표시 (타일 선택 가능)
│   │           ├── TileRack.tsx         # 손패 (드래그 앤 드롭 정렬)
│   │           ├── TileComponent.tsx    # 개별 타일 컴포넌트
│   │           ├── SortableTile.tsx     # dnd-kit DnD 타일 래퍼
│   │           ├── StagingArea.tsx      # 조합 스테이징 미리보기
│   │           ├── GameActions.tsx      # 턴 액션 버튼 모음
│   │           ├── GameBottomSheet.tsx  # 하단 시트 레이아웃
│   │           └── GameResult.tsx       # 게임 종료 결과 화면
│   └── ui/                          # shadcn/ui 기본 컴포넌트
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── form.tsx
│       ├── input.tsx
│       └── label.tsx
│
├── hooks/
│   ├── useSocket.tsx          # Socket.io 연결 초기화
│   ├── useGameEvents.tsx      # 게임 소켓 이벤트 핸들러
│   ├── useRoomEvents.tsx      # 방 소켓 이벤트 핸들러
│   ├── useCreateRoomForm.tsx  # 방 생성 폼 훅
│   └── useJoinRoomForm.tsx    # 방 참여 폼 훅
│
├── pages/
│   ├── Home.tsx               # 홈 페이지 (방 생성/참여)
│   ├── Room.tsx               # 방 페이지 (대기실 + 게임)
│   └── NotFound.tsx           # 404 페이지
│
├── store/
│   ├── useGameStore.ts        # 게임 상태 (타일, 보드, 턴, 스테이징)
│   ├── useRoomStore.ts        # 방 정보 및 플레이어 목록
│   ├── useCustomerStore.ts    # 현재 플레이어 세션 (persist 적용)
│   └── useSocketStore.ts      # Socket.io 인스턴스 및 연결 상태
│
├── utils/
│   └── tileUtils.ts           # 타일 점수 계산, 자동 정렬
│
├── lib/
│   ├── socketUtils.ts         # Socket.io 싱글톤 패턴
│   └── utils.ts               # Tailwind 클래스명 병합
│
├── routers/
│   └── Router.tsx             # React Router 라우트 정의
│
├── types/
│   └── server.generated.ts    # 백엔드 타입 정의
│
├── App.tsx
├── main.tsx
└── index.css
```

## 주요 패턴

| 패턴 | 설명 |
| --- | --- |
| **Zustand 스토어 분리** | `useGameStore`(게임 상태·타일·스테이징), `useRoomStore`(방·플레이어), `useCustomerStore`(세션, localStorage persist), `useSocketStore`(소켓 인스턴스) 4개로 관심사 분리 |
| **세션 복구** | `useCustomerStore`가 localStorage에 플레이어 정보를 지속 저장 → 새로고침 후 `useRoomEvents`가 `rejoinRoom` 이벤트로 30초 이내 자동 재접속 |
| **소켓 이벤트 훅** | `useRoomEvents`(방 입퇴장·준비 상태), `useGameEvents`(턴·타일·보드) 훅으로 이벤트 구독을 컴포넌트에서 분리. 타일 뽑기/손패 갱신은 자동 턴 종료, 에러 메시지는 4초 후 자동 소거 |
| **타일 스테이징** | 손패/보드 타일 선택 → `StagingArea` 미리보기 → `submitBoardState` 전송 → 서버 검증 → `endTurn` 으로 턴 종료 |
| **자동 정렬** | `autoSortTiles()`가 그룹·런 조합을 탐지하고 조커를 활용해 손패를 자동 정렬, 조합 메타데이터도 반환해 시각적 그룹핑에 활용 |
| **Socket.io 싱글톤** | `socketUtils.ts`에서 단일 인스턴스 유지, `autoConnect: false`로 이벤트 리스너 등록 후 수동 연결해 중복 이벤트 방지 |
| **DnD 타일 정렬** | `@dnd-kit`의 `DndContext` + `SortableContext`로 손패 타일 드래그 앤 드롭 순서 변경 |

## Socket.io 이벤트

### 클라이언트 → 서버

| 이벤트             | 페이로드                     | 설명                |
| ------------------ | ---------------------------- | ------------------- |
| `createRoom`       | `{ nickname }`               | 방 생성             |
| `joinRoom`         | `{ roomCode, nickname }`     | 방 입장             |
| `findRoom`         | `{ roomCode }`               | 방 정보 조회        |
| `rejoinRoom`       | `{ roomCode, playerId }`     | 세션 복구 재접속    |
| `playerReady`      | `{ roomCode }`               | 준비 상태 토글      |
| `startGame`        | `{ roomCode }`               | 게임 시작 (호스트)  |
| `drawTile`         | `{ roomCode }`               | 타일 뽑기           |
| `submitBoardState` | `{ roomCode, combinations }` | 보드 전체 상태 제출 |
| `endTurn`          | `{ roomCode }`               | 턴 종료             |
| `leaveRoom`        | `{ roomCode }`               | 방 나가기           |

### 서버 → 클라이언트

| 이벤트                | 페이로드                                         | 설명               |
| --------------------- | ------------------------------------------------ | ------------------ |
| `roomCreated`         | `{ roomCode, player }`                           | 방 생성 성공       |
| `joinedRoom`          | `{ roomCode, players, myPlayerId, isHost }`      | 방 입장 성공       |
| `roomFound`           | `{ roomCode, players, gameStarted, maxPlayers }` | 방 정보 응답       |
| `playerJoined`        | `{ players, newPlayer }`                         | 다른 플레이어 입장 |
| `playerLeft`          | `{ players, leftPlayer }`                        | 플레이어 퇴장      |
| `playerStatusChanged` | `{ players }`                                    | 준비 상태 변경     |
| `gameStarted`         | `{ gameState, myTiles, isMyTurn }`               | 게임 시작          |
| `tileDrawn`           | `{ myTiles, deckCount }`                         | 타일 뽑기 완료     |
| `boardUpdated`        | `{ gameState }`                                  | 보드 변경          |
| `myTilesUpdated`      | `{ tiles }`                                      | 내 손패 갱신       |
| `turnChanged`         | `{ gameState, currentPlayerId }`                 | 턴 변경            |
| `yourTurn`            | `{ isMyTurn }`                                   | 내 턴 알림         |
| `gameOver`            | `{ winner, gameState }`                          | 게임 종료          |
| `deckUpdated`         | `{ deckCount }`                                  | 덱 수량 변경       |
| `error`               | `{ message }`                                    | 오류 발생          |
