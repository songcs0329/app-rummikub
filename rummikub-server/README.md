# 루미큐브 게임 서버

NestJS 11 기반 실시간 멀티플레이어 루미큐브 보드게임 WebSocket 서버입니다. 모든 클라이언트-서버 통신은 Socket.io를 통해 이루어지며, REST API 엔드포인트는 없습니다.

## 개요

- **프레임워크**: NestJS 11 + TypeScript
- **통신**: Socket.io WebSocket 게이트웨이 (REST 없음)
- **저장소**: 인메모리 맵 기반 (관계형 DB 미사용)
- **게임**: 2~4인 멀티플레이어 루미큐브
- **주요 기능**: 방 관리, 게임 로직, 타일 배분, 조합 검증, 턴 관리

## 기술 스택

| 기술              | 버전    | 용도                |
| ----------------- | ------- | ------------------- |
| NestJS            | ^11.0.0 | 서버 프레임워크     |
| TypeScript        | ~5.8.3  | 언어                |
| Socket.io         | ^4.8.0  | WebSocket 통신      |
| class-validator   | ^0.14.1 | DTO 검증            |
| class-transformer | ^0.5.1  | DTO 변환            |
| UUID              | ^11.1.0 | 플레이어/방 ID 생성 |
| NestJS Config     | ^4.0.0  | 환경 변수 관리      |

## 시작하기

### 1. 환경 설정

#### 패키지 설치

```bash
cd rummikub-server
npm install
```

#### 환경 변수 설정

`.env.development` 파일을 생성하고 다음 내용을 추가합니다:

```env
PORT=3000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**환경 변수 설명:**

| 변수         | 기본값                | 설명                               |
| ------------ | --------------------- | ---------------------------------- |
| `PORT`       | 3000                  | 서버 포트                          |
| `CLIENT_URL` | http://localhost:5173 | 클라이언트 CORS 허용 URL           |
| `NODE_ENV`   | development           | 실행 환경 (development/production) |

### 2. 개발 서버 실행

```bash
npm run start:dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

콘솔에 다음 메시지가 표시됩니다:

```
Server is running on http://localhost:3000
```

### 3. 프로덕션 빌드

```bash
npm run build
npm run start:prod
```

## npm 스크립트

| 스크립트             | 설명                                    |
| -------------------- | --------------------------------------- |
| `npm run build`      | NestJS 프로덕션 빌드 → `dist/` 디렉토리 |
| `npm run start`      | 컴파일된 코드 실행                      |
| `npm run start:dev`  | Watch 모드로 개발 서버 실행             |
| `npm run start:prod` | 프로덕션 모드로 서버 실행               |

## 디렉토리 구조

```
rummikub-server/
├── src/
│   ├── modules/
│   │   ├── room/                    # 방 관리 모듈
│   │   │   ├── entities/
│   │   │   │   ├── room.entity.ts  # 방 데이터 모델
│   │   │   │   └── player.entity.ts # 플레이어 데이터 모델
│   │   │   ├── dto/
│   │   │   │   ├── create-room.dto.ts     # 방 생성 DTO
│   │   │   │   ├── join-room.dto.ts       # 방 참가 DTO
│   │   │   │   ├── rejoin-room.dto.ts     # 재접속 DTO
│   │   │   │   ├── player-action.dto.ts   # 플레이어 액션 DTO
│   │   │   │   └── index.ts
│   │   │   ├── room.gateway.ts     # WebSocket 게이트웨이 (이벤트 핸들러)
│   │   │   ├── room.service.ts     # 방/플레이어 비즈니스 로직
│   │   │   └── room.module.ts      # 모듈 정의
│   │   │
│   │   └── game/                    # 게임 로직 모듈
│   │       ├── entities/
│   │       │   ├── tile.entity.ts        # 타일 데이터 모델
│   │       │   ├── combination.entity.ts # 조합(런/그룹) 데이터 모델
│   │       │   └── game-state.entity.ts  # 게임 상태 스냅샷
│   │       ├── game.service.ts     # 게임 규칙 비즈니스 로직
│   │       └── game.module.ts      # 모듈 정의
│   │
│   ├── common/
│   │   └── constants/
│   │       └── game.constants.ts    # 게임 상수 (플레이어 수, 타일 개수 등)
│   │
│   ├── app.module.ts               # 루트 모듈
│   └── main.ts                     # 부트스트랩 진입점
│
├── dist/                           # 빌드 출력 (생성됨)
├── package.json
├── tsconfig.json
├── nest-cli.json
└── README.md
```

## 아키텍처

### 모듈 구조

```
AppModule
├── ConfigModule (환경 변수)
├── RoomModule
│   ├── RoomGateway (WebSocket 이벤트 핸들러)
│   ├── RoomService (방/플레이어 로직)
│   └── imports: GameModule
└── GameModule
    └── GameService (게임 규칙)
```

### 데이터 흐름

1. **클라이언트** → Socket.io 이벤트 전송
2. **RoomGateway** → 이벤트 수신 및 유효성 검증
3. **RoomService** → 방/플레이어 상태 변경
4. **GameService** → 게임 규칙 검증 (조합, 점수 등)
5. **RoomGateway** → 결과를 모든 클라이언트에 브로드캐스트

### 저장소 (인메모리)

RoomService는 세 개의 Map으로 상태를 관리합니다:

| Map              | 용도                         |
| ---------------- | ---------------------------- |
| `rooms`          | `roomCode` → `Room` 매핑     |
| `socketToRoom`   | `socketId` → `roomCode` 매핑 |
| `socketToPlayer` | `socketId` → `playerId` 매핑 |

서버 재시작 시 모든 데이터가 초기화됩니다.

## Socket.io 이벤트

### 클라이언트 → 서버 (요청)

| 이벤트             | DTO/페이로드           | 설명                    |
| ------------------ | ---------------------- | ----------------------- |
| `createRoom`       | `CreateRoomDto`        | 새 방 생성 (호스트)     |
| `joinRoom`         | `JoinRoomDto`          | 기존 방 입장            |
| `findRoom`         | `{ roomCode: string }` | 방 정보 조회            |
| `rejoinRoom`       | `RejoinRoomDto`        | 재접속 (기존 플레이어)  |
| `playerReady`      | `PlayerActionDto`      | 플레이어 준비 상태 토글 |
| `startGame`        | `PlayerActionDto`      | 게임 시작 (호스트만)    |
| `drawTile`         | `PlayerActionDto`      | 타일 한 개 뽑기         |
| `placeCombination` | `PlaceCombinationDto`  | 조합 배치               |
| `endTurn`          | `PlayerActionDto`      | 턴 종료                 |
| `leaveRoom`        | `PlayerActionDto`      | 방 나가기               |

### 서버 → 클라이언트 (응답/이벤트)

| 이벤트                | 페이로드                                                                                      | 설명                           |
| --------------------- | --------------------------------------------------------------------------------------------- | ------------------------------ |
| `roomCreated`         | `{ roomCode: string; player: PlayerPublicInfo }`                                              | 방 생성 성공                   |
| `joinedRoom`          | `{ roomCode: string; players: PlayerPublicInfo[]; myPlayerId: string; isHost: boolean }`      | 방 입장 성공                   |
| `roomFound`           | `{ roomCode: string; players: PlayerPublicInfo[]; gameStarted: boolean; maxPlayers: number }` | 방 정보 조회 결과              |
| `playerJoined`        | `{ players: PlayerPublicInfo[]; newPlayer: PlayerPublicInfo }`                                | 새 플레이어 입장               |
| `playerLeft`          | `{ players: PlayerPublicInfo[]; leftPlayer: PlayerPublicInfo }`                               | 플레이어 퇴장                  |
| `playerStatusChanged` | `{ players: PlayerPublicInfo[] }`                                                             | 플레이어 상태 변경 (준비 상태) |
| `gameStarted`         | `{ gameState: GameState; myTiles: Tile[]; isMyTurn: boolean }`                                | 게임 시작                      |
| `tileDrawn`           | `{ myTiles: Tile[]; deckCount: number }`                                                      | 타일 뽑기 완료                 |
| `boardUpdated`        | `{ gameState: GameState }`                                                                    | 보드 업데이트 (조합 배치 후)   |
| `myTilesUpdated`      | `{ tiles: Tile[] }`                                                                           | 내 손패 업데이트               |
| `turnChanged`         | `{ gameState: GameState; currentPlayerId: string }`                                           | 턴 변경                        |
| `yourTurn`            | `{ isMyTurn: boolean }`                                                                       | 당신의 턴입니다                |
| `gameOver`            | `{ winner: PlayerPublicInfo; gameState: GameState }`                                          | 게임 종료                      |
| `deckUpdated`         | `{ deckCount: number }`                                                                       | 덱 상태 변경                   |
| `error`               | `{ message: string }`                                                                         | 오류 발생                      |

## 게임 로직

### 덱 생성 (GameService.generateDeck)

1. **기본 타일**: 숫자 1~13, 4가지 색(빨강/파랑/노랑/검정), 2세트
   - 계산: 13 × 4 × 2 = 104개
2. **조커**: 2개
3. **총합**: 106개
4. **섞기**: Fisher-Yates 알고리즘으로 무작위 순서 섞기

### 타일 배분

게임 시작 시 각 플레이어에게 14개씩 배분합니다.

### 조합 검증 (GameService.validateCombination)

#### 런 (Run)

연속된 숫자 + 같은 색 조합:

- 최소 3개 타일
- 모든 논조커 타일이 같은 색
- 숫자가 연속 (조커로 빈자리 메우기 가능)

**예시:**

- 유효: `[빨강 3, 빨강 4, 빨강 5]`, `[파랑 5, 파랑 6, 조커]` (조커가 7)
- 무효: `[빨강 3, 파랑 4, 빨강 5]` (색이 다름), `[빨강 1, 빨강 3]` (2개만)

#### 그룹 (Group)

같은 숫자 + 다른 색 조합:

- 최소 3개, 최대 4개 타일 (4가지 색)
- 모든 논조커 타일이 같은 숫자
- 색이 중복되지 않음

**예시:**

- 유효: `[빨강 7, 파랑 7, 노랑 7]`, `[검정 10, 빨강 10, 파랑 10, 노랑 10]`
- 무효: `[빨강 5, 파랑 5]` (2개만), `[빨강 7, 파랑 7, 노랑 7, 검정 7, 조커]` (5개)

### 첫 멜드 (Initial Meld) 검증

플레이어의 첫 번째 조합 배치 시 반드시 충족:

- **최소 점수**: 30점 이상
- **계산**: 각 타일의 수(조커는 0점)의 합
- **예시**: `[빨강 10, 빨강 11, 빨강 12]` = 10 + 11 + 12 = 33점 ✓

첫 멜드 통과 후 플레이어의 `hasInitialMeld` 플래그가 활성화되고, 이후 제약 없이 조합 배치 가능합니다.

### 점수 계산

**타일 값:**

- 숫자 타일: 해당 숫자 (1~13)
- 조커: 30점

**플레이어 점수:**
모든 손패 타일 값의 합입니다. 게임 종료 시 계산됩니다.

```typescript
// 예시
tiles = [숫자 5, 숫자 8, 조커]
score = 5 + 8 + 30 = 43점
```

### 게임 종료 조건

#### 조건 ①: 손패 완전 소진 (즉시 종료)

플레이어가 모든 손패를 배치하면 그 플레이어가 승리합니다.

#### 조건 ②: 덱 소진 + 전원 연속 패스

1. **덱이 비어있고** (타일 뽑기 불가)
2. **모든 플레이어가 연속으로 턴 중 조합을 배치하지 않음** (패스)

게임 종료 시 남은 손패 점수가 가장 낮은 플레이어가 승리합니다.

### 턴 관리

1. **턴 시작**: 첫 플레이어부터 시작 (`currentTurnIndex = 0`)
2. **턴 액션**:
   - 조합 배치 (선택)
   - 타일 뽑기 (필수)
3. **턴 종료**: `endTurn` 후 다음 플레이어로 변경
4. **순환**: 마지막 플레이어 다음은 첫 플레이어 (`currentTurnIndex % playerCount`)

## 엔티티

### Room

```typescript
{
  roomCode: string;           // 6자리 고유 코드 (ABCD12 형식)
  players: Player[];          // 방 내 플레이어 배열
  maxPlayers: number;         // 최대 플레이어 수 (기본값: 4)
  createdAt: Date;            // 방 생성 시간
  gameStarted: boolean;       // 게임 시작 여부
  currentTurnIndex: number;   // 현재 턴 플레이어 인덱스
  board: Combination[];       // 배치된 조합 배열
  deck: Tile[];               // 남은 타일 배열
  gameOver: boolean;          // 게임 종료 여부
  winner: Player | null;      // 우승자
  consecutivePasses: number;  // 연속 패스 카운트
  placedThisTurn: boolean;    // 이번 턴에 조합 배치 여부
}
```

**메서드:**

- `get host()`: 호스트 플레이어 반환
- `get currentPlayer()`: 현재 턴 플레이어 반환
- `nextTurn()`: 다음 플레이어로 턴 변경
- `canStart()`: 게임 시작 가능 여부 (2명 이상, 모두 준비 또는 호스트)

### Player

```typescript
{
  id: string;                // UUID
  socketId: string;          // Socket.io 연결 ID
  nickname: string;          // 플레이어 이름
  tiles: Tile[];             // 손패 타일 배열
  isReady: boolean;          // 준비 여부
  isHost: boolean;           // 호스트 여부
  hasInitialMeld: boolean;   // 첫 멜드 달성 여부
  score: number;             // 최종 점수 (게임 종료 시)
}
```

**메서드:**

- `toPublicInfo()`: 클라이언트에 노출 가능한 정보 반환 (손패 제외)

### Tile

```typescript
{
  id: string; // 고유 ID (타임스탐프 + 난수)
  number: number; // 1~13 (조커는 0)
  color: TileColor | null; // 'red' | 'blue' | 'yellow' | 'black' | null
  isJoker: boolean; // 조커 여부
}
```

### Combination

```typescript
{
  id: string;               // 고유 ID
  tiles: Tile[];            // 조합의 타일 배열
  type: CombinationType;    // 'run' | 'group'
}
```

**메서드:**

- `getValue()`: 조합의 점수 합계 (조커는 0점)

### GameState

게임 상태의 스냅샷입니다. 클라이언트에 전송될 때 사용됩니다.

```typescript
{
  roomCode: string;
  players: PlayerPublicInfo[];
  currentPlayerId: string | null;
  board: Combination[];
  deckCount: number;
  gameStarted: boolean;
  gameOver: boolean;
  winner: PlayerPublicInfo | null;
}
```

**정적 메서드:**

- `fromRoom(room: Room)`: Room 객체에서 GameState 생성

## 게임 상수

파일: `src/common/constants/game.constants.ts`

| 상수                         | 값    | 설명                              |
| ---------------------------- | ----- | --------------------------------- |
| `MIN_PLAYERS`                | 2     | 최소 플레이어 수                  |
| `MAX_PLAYERS`                | 4     | 최대 플레이어 수                  |
| `INITIAL_TILES_PER_PLAYER`   | 14    | 게임 시작 시 플레이어당 타일 개수 |
| `MIN_INITIAL_MELD_VALUE`     | 30    | 첫 멜드 최소 점수                 |
| `MIN_COMBINATION_SIZE`       | 3     | 조합 최소 타일 개수               |
| `MAX_TILE_NUMBER`            | 13    | 타일 최대 숫자                    |
| `JOKER_COUNT`                | 2     | 조커 개수                         |
| `TILES_PER_SET`              | 2     | 타일 세트 개수                    |
| `ROOM_CODE_LENGTH`           | 6     | 방 코드 길이                      |
| `DISCONNECT_GRACE_PERIOD_MS` | 30000 | 재접속 유예 기간 (30초)           |

**색상 배열:**

```typescript
TILE_COLORS = ["red", "blue", "yellow", "black"];
```

## 주요 서비스

### RoomService

방과 플레이어 상태 관리:

| 메서드                                                  | 설명                      |
| ------------------------------------------------------- | ------------------------- |
| `generateRoomCode()`                                    | 6자리 고유한 방 코드 생성 |
| `createRoom(socketId, nickname)`                        | 새 방 생성 (호스트)       |
| `findRoom(roomCode)`                                    | 방 조회                   |
| `joinRoom(roomCode, socketId, nickname)`                | 플레이어 입장             |
| `rejoinRoom(roomCode, playerId, newSocketId)`           | 플레이어 재접속           |
| `togglePlayerReady(roomCode, socketId)`                 | 플레이어 준비 상태 토글   |
| `startGame(roomCode, socketId)`                         | 게임 시작 (호스트만)      |
| `drawTile(roomCode, socketId)`                          | 플레이어가 타일 뽑기      |
| `placeCombination(roomCode, socketId, combinationData)` | 조합 배치                 |
| `endTurn(roomCode, socketId)`                           | 턴 종료                   |
| `handlePlayerDisconnect(socketId)`                      | 플레이어 연결 해제 처리   |
| `getPlayerTiles(roomCode, socketId)`                    | 플레이어 손패 조회        |

### GameService

게임 규칙과 검증:

| 메서드                        | 설명                            |
| ----------------------------- | ------------------------------- |
| `generateDeck()`              | 106개 타일 덱 생성 및 섞기      |
| `dealTiles(deck, count)`      | 덱에서 타일 배분                |
| `validateRun(tiles)`          | 런 조합 유효성 검증             |
| `validateGroup(tiles)`        | 그룹 조합 유효성 검증           |
| `validateCombination(tiles)`  | 조합 유효성 검증 (런/그룹)      |
| `validateBoard(combinations)` | 보드의 모든 조합 검증           |
| `validateInitialMeld(tiles)`  | 첫 멜드 유효성 검증 (30점 이상) |
| `calculateTileValue(tile)`    | 단일 타일 점수 계산             |
| `calculatePlayerScore(tiles)` | 플레이어 점수 계산              |

## 연결 해제 및 재접속

### 연결 해제 흐름

1. **클라이언트 연결 해제** → `handleDisconnect` 호출
2. **30초 유예 기간 시작** (`DISCONNECT_GRACE_PERIOD_MS`)
3. **30초 내 재접속 → 게임 복구** (`rejoinRoom` 이벤트)
4. **30초 초과 → 플레이어 제거** (`playerLeft` 이벤트 브로드캐스트)

### 재접속 시 데이터 복구

재접속 시 플레이어의:

- 손패 타일
- 게임 상태
- 턴 정보
- 준비 상태

가 모두 복구됩니다.

## 유효성 검증

모든 Socket.io 이벤트 페이로드는 class-validator를 사용하여 검증됩니다:

```typescript
// 예: CreateRoomDto
@IsString()
@MinLength(2)
@MaxLength(20)
nickname: string;
```

검증 실패 시 자동으로 거부되고 `error` 이벤트가 클라이언트로 전송됩니다.

**주요 검증 규칙:**

- 닉네임: 2~20자 문자열
- 방 코드: 정확히 6자리
- 플레이어 ID: UUID 형식

## CORS 설정

서버는 클라이언트 URL에서만 WebSocket 연결을 허용합니다:

```typescript
// main.ts
app.enableCors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
});

// room.gateway.ts
@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
})
```

프로덕션 환경에서는 `.env.production`에서 `CLIENT_URL`을 정확히 설정하세요.

## 에러 처리

모든 예외는 try-catch로 처리되며, 클라이언트에 `error` 이벤트로 전송됩니다:

```typescript
{
  message: "error message";
}
```

**일반적인 에러:**

| 에러                                     | 상황                               |
| ---------------------------------------- | ---------------------------------- |
| "방을 찾을 수 없습니다."                 | 존재하지 않는 방 코드              |
| "방이 가득 찼습니다."                    | 플레이어 수 제한 도달              |
| "게임이 이미 시작되었습니다."            | 진행 중인 게임에 입장 시도         |
| "방장만 게임을 시작할 수 있습니다."      | 호스트가 아닌 플레이어가 시작 시도 |
| "모든 플레이어가 준비되지 않았습니다."   | 준비 완료되지 않은 플레이어가 있음 |
| "당신의 턴이 아닙니다."                  | 턴이 아닌 플레이어의 액션          |
| "유효하지 않은 조합입니다."              | 규칙에 맞지 않는 조합              |
| "첫 멜드는 최소 30점 이상이어야 합니다." | 첫 멜드 점수 미달                  |

## 개발 팁

### 로깅

콘솔 메시지:

```
Client connected: socket-id
Client disconnected: socket-id
```

필요시 `console.log()`를 추가하여 디버깅할 수 있습니다.

### 타입스크립트 컴파일 확인

```bash
npx tsc --noEmit
```

### 모듈 재로드 (Watch 모드)

`npm run start:dev` 실행 중 파일 변경 시 자동으로 재컴파일됩니다.

## 참고

- **프론트엔드**: `/Users/songchangseok/songcs/02_study/app-rummikub/rummikub-front/`
- **CLAUDE.md**: 프로젝트 개요 및 전체 아키텍처
- **Socket.io 문서**: https://socket.io/docs/
- **NestJS 문서**: https://docs.nestjs.com/
