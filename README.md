# 루미큐브 온라인 멀티플레이어 게임

실시간 멀티플레이어 루미큐브 보드게임입니다. React 프론트엔드와 NestJS 백엔드가 Socket.io WebSocket으로 통신하며, REST API 없이 완전히 이벤트 기반 아키텍처로 구성되어 있습니다.

## 기술 스택

### 프론트엔드 (`rummikub-front/`)

- **React 19 + Vite 7** — 빠른 개발 환경과 번들링
- **TypeScript** — 타입 안정성
- **Zustand** — 상태 관리 (persist 미들웨어 적용)
- **shadcn/ui** (New York 스타일) — 프로덕션 품질의 UI 컴포넌트
- **React Hook Form + Zod** — 폼 검증 및 타입 추론
- **@dnd-kit** — 타일 드래그 앤 드롭
- **socket.io-client** — WebSocket 클라이언트
- **React Router 7** — 라우팅
- **Tailwind CSS** — 유틸리티 기반 스타일링

### 백엔드 (`rummikub-server/`)

- **NestJS 11 + TypeScript** — 확장 가능한 서버 아키텍처
- **Socket.io** — WebSocket 게이트웨이
- **class-validator** — 데이터 검증
- **in-memory storage** — Room, Player, GameState 저장소

### 통신

**REST API 없음** - 모든 통신은 Socket.io WebSocket 이벤트 기반입니다.

**클라이언트 → 서버:** `createRoom`, `joinRoom`, `findRoom`, `playerReady`, `startGame`, `drawTile`, `placeCombination`, `endTurn`, `leaveRoom`

**서버 → 클라이언트:** `roomCreated`, `joinedRoom`, `roomFound`, `playerJoined`, `playerLeft`, `playerStatusChanged`, `gameStarted`, `tileDrawn`, `boardUpdated`, `myTilesUpdated`, `turnChanged`, `yourTurn`, `gameOver`, `deckUpdated`, `error`

## 프로젝트 구조

```
app-rummikub/
├── rummikub-front/        # React 프론트엔드
│   ├── src/
│   │   ├── components/    # React 컴포넌트
│   │   ├── hooks/         # 커스텀 훅
│   │   ├── pages/         # 페이지
│   │   ├── store/         # Zustand 스토어
│   │   └── types/         # TypeScript 타입
│   ├── package.json
│   └── vite.config.ts
│
├── rummikub-server/       # NestJS 백엔드
│   ├── src/
│   │   ├── modules/       # NestJS 모듈 (room, game)
│   │   │   ├── room/      # 방 관리 (gateway, service, dto, entities)
│   │   │   └── game/      # 게임 로직 (service, entities)
│   │   └── common/        # 공통 (constants)
│   ├── package.json
│   └── nest-cli.json
│
└── README.md             # 이 파일
```

## 빠른 시작

### 사전 요구사항

- **Node.js** 18.0 이상
- **npm** 또는 **yarn**

### 1단계: 저장소 클론

```bash
git clone <repository-url>
cd app-rummikub
```

### 2단계: 프론트엔드 설정

```bash
cd rummikub-front
npm install
# .env 파일 생성 (아래 환경 변수 섹션 참고)
npm run dev
```

개발 서버가 `http://localhost:5173`에서 실행됩니다.

### 3단계: 백엔드 설정

새 터미널에서:

```bash
cd rummikub-server
npm install
# .env 파일 생성 (아래 환경 변수 섹션 참고)
npm run start:dev
```

백엔드가 `http://localhost:3000`에서 실행됩니다.

### 4단계: 브라우저에서 접속

브라우저를 열고 `http://localhost:5173`으로 접속합니다.

## 환경 변수

### 프론트엔드 (`.env`)

```env
VITE_APP_API_URL=http://localhost:3000
```

### 백엔드 (`.env`)

```env
PORT=3000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## 주요 명령어

### 프론트엔드 (`rummikub-front/`)

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | Vite 개발 서버 시작 (http://localhost:5173) |
| `npm run build` | TypeScript 컴파일 후 프로덕션 빌드 |
| `npm run lint` | ESLint로 코드 검사 |
| `npm run preview` | 프로덕션 빌드 미리보기 |
| `npm run generate:types` | 타입 정의 자동 생성 |

### 백엔드 (`rummikub-server/`)

| 명령어 | 설명 |
|--------|------|
| `npm run start:dev` | NestJS watch 모드 실행 |
| `npm run build` | TypeScript 컴파일 및 NestJS 빌드 |
| `npm run start:prod` | 프로덕션 모드 실행 |

## 게임 규칙

### 기본 규칙

- **플레이어 수:** 2~4명
- **초기 타일:** 플레이어 당 14개
- **방 코드:** 영숫자 6자리

### 타일 구성

- 숫자: 1 ~ 13
- 색상: 빨강, 파랑, 노랑, 검정 (4색)
- 세트: 2개 (각 색상 당 1~13 숫자 × 2)
- 조커: 2개 (와일드 카드 역할)
- **총 106개 타일**

### 첫 멜드 규칙 (초기 조합)

- 합계가 **30점 이상**이어야 함
- 여러 개의 조합으로 이루어질 수 있음
- 한 번 메모(첫 조합)하면 이후 턴부터 추가 조합 및 수정 가능

### 조합 규칙

조합은 다음 두 가지 형태만 가능합니다:

1. **런(Run):** 같은 색 연속 숫자 (예: 빨강 5, 6, 7, 8)
   - 최소 3개 타일 필수

2. **그룹(Group):** 같은 숫자 다른 색 (예: 검정 7, 파랑 7, 노랑 7)
   - 최소 3개 타일 필수
   - 같은 색 중복 불가

### 점수 계산

- 숫자 1~12: 숫자 값만큼의 점수
- 숫자 13: 13점
- 조커: 30점

### 승리 조건

첫 멜드 후 모든 타일을 먼저 내려놓는 플레이어가 승리합니다.

## 개발 가이드

### 코드 스타일

- **Prettier:** 작은따옴표, 세미콜론, 2칸 들여쓰기, 120자 줄 너비, 후행 쉼표
- **ESLint:** TypeScript + React Hooks + Prettier 통합
- **주석 및 문자열:** 한국어
- **코드 식별자:** 영어

### shadcn/ui 컴포넌트 추가

```bash
cd rummikub-front
npx shadcn@latest add <component-name>
```

### 폼 구현 패턴

프론트엔드는 React Hook Form + Zod를 사용합니다:

1. Zod 스키마로 검증 규칙 정의
2. `useForm`에 `zodResolver` 연결
3. shadcn의 `Form` / `FormField` 컴포넌트 사용

### Socket.io 이벤트 처리

백엔드는 WebSocket 게이트웨이에서 모든 클라이언트-서버 통신을 처리합니다.
REST 엔드포인트는 없으며, 모든 데이터 교환이 Socket.io 이벤트를 통합니다.

## 프로젝트 구조 (상세)

### 프론트엔드

- `src/components/` — React 컴포넌트 (UI 컴포넌트는 `src/components/ui/`)
- `src/hooks/` — 커스텀 훅 (소켓 이벤트, 폼 로직 캡슐화)
- `src/pages/` — 페이지 컴포넌트
- `src/store/` — Zustand 상태 관리 (persist 미들웨어)
- `src/types/` — TypeScript 타입 정의

### 백엔드

- `src/modules/room/` — 방 관리 모듈 (gateway, service, dto, entities)
- `src/modules/game/` — 게임 로직 모듈 (service, entities)
- `src/common/constants/` — 게임 규칙 상수 (`game.constants.ts`)

## 아키텍처 특징

### 프론트엔드

- **경로 별칭:** `@/*` → `./src/*`
- **상태 관리:** Zustand (플레이어 세션, 소켓 인스턴스 persist)
- **라우팅:** React Router 7 (Home `/`, Room `/room/:roomCode`)
- **드래그 드롭:** @dnd-kit로 타일 이동

### 백엔드

- **WebSocket만 사용:** REST 엔드포인트 없음
- **인메모리 저장소:** 3개 Map (rooms, socketToRoom, socketToPlayer)
- **모듈 구조:** RoomModule → GameModule 의존
- **게임 로직:** 덱 생성(Fisher-Yates), 타일 배분, 조합 검증, 점수 계산

## 라이센스

MIT

## 기여 가이드

이 프로젝트에 기여하려면:

1. 포크하고 브랜치 생성
2. 변경사항 커밋
3. 풀 요청 제출

코드는 기존 스타일 가이드를 따르고, Prettier와 ESLint를 통과해야 합니다.
