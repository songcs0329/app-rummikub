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
- **Motion** — UI 애니메이션

### 백엔드 (`rummikub-server/`)

- **NestJS 11 + TypeScript** — 확장 가능한 서버 아키텍처
- **Socket.io** — WebSocket 게이트웨이
- **class-validator / class-transformer** — 데이터 검증
- **in-memory storage** — Room, Player, GameState 저장소

## 통신 방식

**REST API 없음** - 모든 통신은 Socket.io WebSocket 이벤트 기반입니다.

### 클라이언트 → 서버

| 이벤트             | 설명                 |
| ------------------ | -------------------- |
| `createRoom`       | 새 방 생성           |
| `joinRoom`         | 방 입장              |
| `findRoom`         | 방 정보 조회         |
| `rejoinRoom`       | 재접속               |
| `playerReady`      | 준비 상태 토글       |
| `startGame`        | 게임 시작 (호스트만) |
| `drawTile`         | 타일 뽑기            |
| `submitBoardState` | 보드 전체 상태 제출  |
| `endTurn`          | 턴 종료              |
| `leaveRoom`        | 방 나가기            |

### 서버 → 클라이언트

| 이벤트                | 설명                          |
| --------------------- | ----------------------------- |
| `roomCreated`         | 방 생성 성공                  |
| `joinedRoom`          | 방 입장 성공                  |
| `roomFound`           | 방 정보 응답                  |
| `playerJoined`        | 새 플레이어 입장              |
| `playerLeft`          | 플레이어 퇴장                 |
| `playerStatusChanged` | 준비 상태 변경                |
| `gameStarted`         | 게임 시작                     |
| `tileDrawn`           | 타일 뽑기 완료 (자동 턴 종료) |
| `boardUpdated`        | 보드 상태 변경                |
| `myTilesUpdated`      | 내 손패 업데이트              |
| `turnChanged`         | 턴 변경                       |
| `yourTurn`            | 현재 플레이어 턴 알림         |
| `gameOver`            | 게임 종료                     |
| `deckUpdated`         | 덱 상태 변경                  |
| `error`               | 오류 발생                     |

## 빠른 시작

### 사전 요구사항

- **Node.js** 18.0 이상
- **npm** 또는 **yarn**

### 1단계: 저장소 클론

```bash
git clone <repository-url>
cd app-rummikub
```

### 2단계: 백엔드 실행

```bash
cd rummikub-server
npm install
# .env.development 파일 생성 (환경 변수 섹션 참고)
npm run start:dev
```

백엔드가 `http://localhost:3000`에서 실행됩니다.

### 3단계: 프론트엔드 실행

새 터미널에서:

```bash
cd rummikub-front
npm install
# .env.development 파일이 이미 존재 (환경 변수 섹션 참고)
npm run dev
```

개발 서버가 `http://localhost:5173`에서 실행됩니다.

### 4단계: 브라우저에서 접속

브라우저를 열고 `http://localhost:5173`으로 접속합니다.

## 환경 변수

### 프론트엔드 (`.env.development`)

```env
VITE_APP_API_URL=http://localhost:3000
```

### 백엔드 (`.env.development`)

```env
PORT=3000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

## 주요 명령어

### 프론트엔드 (`rummikub-front/`)

| 명령어            | 설명                               |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Vite 개발 서버 시작                |
| `npm run build`   | TypeScript 컴파일 후 프로덕션 빌드 |
| `npm run lint`    | ESLint 코드 검사                   |
| `npm run preview` | 프로덕션 빌드 미리보기             |

### 백엔드 (`rummikub-server/`)

| 명령어               | 설명                             |
| -------------------- | -------------------------------- |
| `npm run start:dev`  | NestJS watch 모드 실행           |
| `npm run build`      | TypeScript 컴파일 및 NestJS 빌드 |
| `npm run start:prod` | 프로덕션 모드 실행               |

## 게임 규칙

### 기본 규칙

- **플레이어 수:** 2~4명
- **초기 타일:** 플레이어당 14개
- **방 코드:** 영숫자 6자리

### 타일 구성

- 숫자: 1~13
- 색상: 빨강, 파랑, 노랑, 검정 (4색)
- 세트: 2개 (각 색상별 1~13 × 2)
- 조커: 2개
- **총 106개 타일**

### 조합 규칙

1. **런(Run):** 같은 색 연속 숫자 (최소 3개, 조커로 빈자리 가능)
2. **그룹(Group):** 같은 숫자 다른 색 (최소 3개, 최대 4개, 같은 색 중복 불가)

### 첫 멜드 규칙

- 합계 **30점 이상** 필수
- 여러 조합으로 구성 가능
- 첫 멜드 이후 기존 보드 타일 조작 가능

### 점수 계산

- 숫자 1~13: 숫자값 그대로
- 조커: 30점

### 게임 종료 조건

1. **손패 소진:** 가장 먼저 손패를 모두 내려놓은 플레이어 승리
2. **덱 소진 + 전원 연속 패스:** 남은 손패 합계가 가장 낮은 플레이어 승리

### 재접속 기능

연결이 끊긴 후 **30초 이내** 재접속 시 기존 게임 상태(손패, 턴, 점수)가 완전히 복구됩니다.
