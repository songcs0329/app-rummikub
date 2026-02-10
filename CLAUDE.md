# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

실시간 멀티플레이어 루미큐브 보드게임. React 프론트엔드와 NestJS 백엔드가 Socket.io WebSocket으로 통신한다. 워크스페이스가 아닌 단일 저장소에 두 개의 독립 패키지가 존재한다.

## 명령어

### 프론트엔드 (`rummikub-front/`)

```bash
npm run dev          # Vite 개발 서버 (http://localhost:5173)
npm run build        # tsc -b && vite build
npm run lint         # ESLint
npm run preview      # 프로덕션 빌드 미리보기
```

### 백엔드 (`rummikub-server/`)

```bash
npm run start:dev    # NestJS watch 모드 (http://localhost:3000)
npm run build        # nest build
npm run start:prod   # node dist/main
npm run test         # Jest 단위 테스트
npm run test:watch   # Jest watch 모드
npm run test:e2e     # E2E 테스트
```

### shadcn/ui 컴포넌트 추가

```bash
cd rummikub-front && npx shadcn@latest add <컴포넌트명>
```

## 아키텍처

### 통신: Socket.io 이벤트 (REST 없음)

모든 클라이언트-서버 통신은 Socket.io WebSocket 이벤트를 사용한다. REST API 엔드포인트는 없다.

**클라이언트 -> 서버:** `createRoom`, `joinRoom`, `findRoom`, `playerReady`, `startGame`, `drawTile`, `placeCombination`, `endTurn`, `leaveRoom`

**서버 -> 클라이언트:** `roomCreated`, `joinedRoom`, `roomFound`, `playerJoined`, `playerLeft`, `playerStatusChanged`, `gameStarted`, `tileDrawn`, `boardUpdated`, `myTilesUpdated`, `turnChanged`, `yourTurn`, `gameOver`, `deckUpdated`, `error`

### 프론트엔드 스택 및 패턴

- **React 19 + Vite 7 + TypeScript**, 경로 별칭 `@/*` -> `./src/*`
- **Zustand** 스토어에 persist 미들웨어 적용 — 플레이어 세션(`useCustomerStore`), 소켓 인스턴스(`useSocketStore`)
- **React Hook Form + Zod** 폼 검증 패턴: Zod 스키마 정의 -> 타입 추론 -> `useForm`에 `zodResolver` -> shadcn `Form`/`FormField` 컴포넌트
- **shadcn/ui** (New York 스타일) UI 컴포넌트, `src/components/ui/`에 위치
- **커스텀 훅**이 소켓 이벤트 처리와 폼 로직을 캡슐화 (`useSocket`, `useCreateRoomForm`, `useJoinRoomForm`, `useFindRoom`)
- **@dnd-kit** 타일 드래그 앤 드롭
- **라우팅:** React Router 7, `/` (Home)과 `/room/:roomCode` (Room) 두 경로

### 백엔드 스택 및 패턴

- **NestJS 11 + TypeScript**, WebSocket 게이트웨이만 사용 (REST 컨트롤러 없음)
- **인메모리 저장소** — `RoomService`의 Map 3개 (rooms, socketToRoom, socketToPlayer)
- **NestJS 모듈:** `RoomModule`(게이트웨이 + 서비스)이 `GameModule`(게임 로직 서비스)을 import
- **DTO**에 class-validator 데코레이터로 소켓 이벤트 페이로드 검증
- **엔티티 클래스** 도메인 모델: `Room`, `Player`, `Tile`, `Combination`, `GameState`
- **GameService** 담당: 덱 생성(Fisher-Yates 셔플), 타일 배분, 조합 검증(런/그룹), 첫 멜드 검증(30점 이상), 점수 계산

### 주요 게임 규칙 (`game.constants.ts`)

- 2~4인, 초기 타일 14개씩
- 첫 멜드 합계 30점 이상 필수
- 조합 최소 3개 타일
- 타일: 숫자 1~13, 4색(빨강/파랑/노랑/검정), 2세트 + 조커 2개 = 총 106개
- 방 코드: 영숫자 6자리

## 환경 변수

프론트엔드 `.env`: `VITE_APP_API_URL=http://localhost:3000`
백엔드 `.env`: `PORT=3000`, `CLIENT_URL=http://localhost:5173`, `NODE_ENV=development`

## 코드 스타일

- Prettier: 작은따옴표, 세미콜론, 2칸 들여쓰기, 120자 줄 너비, 후행 쉼표
- ESLint: TypeScript + React Hooks + Prettier 통합
- `@typescript-eslint/no-explicit-any` 비활성화 (any 허용)
- 사용자 노출 문자열과 주석은 한국어, 코드 식별자는 영어
