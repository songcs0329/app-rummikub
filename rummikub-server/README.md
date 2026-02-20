# 루미큐브 게임 서버

NestJS 11 기반 실시간 멀티플레이어 루미큐브 보드게임 WebSocket 서버입니다. 모든 클라이언트-서버 통신은 Socket.io를 통해 이루어지며, REST API 엔드포인트는 없습니다.

## 개요

- **프레임워크**: NestJS 11 + TypeScript
- **통신**: Socket.io WebSocket 게이트웨이 (REST 없음)
- **저장소**: 인메모리 Map 기반 (관계형 DB 미사용)
- **게임**: 2~4인 멀티플레이어 루미큐브
- **주요 기능**: 방 관리, 게임 로직, 타일 배분, 조합 검증, 턴 관리, 재접속 복구

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

### 환경 변수 설정 (`.env.development`)

```env
PORT=3000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

| 변수         | 기본값                | 설명          |
| ------------ | --------------------- | ------------- |
| `PORT`       | 3000                  | 서버 포트     |
| `CLIENT_URL` | http://localhost:5173 | CORS 허용 URL |
| `NODE_ENV`   | development           | 실행 환경     |

### 개발 서버 실행

```bash
cd rummikub-server
npm install
npm run start:dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

### npm 스크립트

| 명령어               | 설명                      |
| -------------------- | ------------------------- |
| `npm run start:dev`  | Watch 모드 개발 서버 실행 |
| `npm run build`      | 프로덕션 빌드 (`dist/`)   |
| `npm run start:prod` | 프로덕션 모드 실행        |

## 디렉토리 구조

```
rummikub-server/src/
├── modules/
│   ├── room/                         # 방 관리 모듈
│   │   ├── entities/
│   │   │   ├── room.entity.ts        # 방 데이터 모델
│   │   │   └── player.entity.ts      # 플레이어 데이터 모델
│   │   ├── dto/
│   │   │   ├── create-room.dto.ts    # 방 생성 DTO
│   │   │   ├── join-room.dto.ts      # 방 참가 DTO
│   │   │   ├── rejoin-room.dto.ts    # 재접속 DTO
│   │   │   ├── player-action.dto.ts  # 플레이어 액션 DTO
│   │   │   └── index.ts
│   │   ├── room.gateway.ts           # WebSocket 이벤트 핸들러
│   │   ├── room.service.ts           # 방/플레이어 비즈니스 로직
│   │   └── room.module.ts
│   │
│   └── game/                         # 게임 로직 모듈
│       ├── entities/
│       │   ├── tile.entity.ts        # 타일 데이터 모델
│       │   ├── combination.entity.ts # 조합(런/그룹) 데이터 모델
│       │   └── game-state.entity.ts  # 게임 상태 스냅샷 (클라이언트 전송용)
│       ├── game.service.ts           # 게임 규칙 및 검증 로직
│       └── game.module.ts
│
├── common/
│   └── constants/
│       └── game.constants.ts         # 게임 상수
│
├── app.module.ts                     # 루트 모듈
└── main.ts                           # 부트스트랩 진입점
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

```
클라이언트
  ↓ Socket.io 이벤트
RoomGateway (이벤트 수신 + DTO 검증)
  ↓
RoomService (방/플레이어 상태 변경)
  ↓
GameService (게임 규칙 검증)
  ↓
RoomGateway (결과 브로드캐스트)
  ↓ Socket.io 이벤트
클라이언트들
```

### 인메모리 저장소 (RoomService)

| Map              | 키         | 값         | 용도                 |
| ---------------- | ---------- | ---------- | -------------------- |
| `rooms`          | `roomCode` | `Room`     | 방 정보 저장         |
| `socketToRoom`   | `socketId` | `roomCode` | 소켓 → 방 매핑       |
| `socketToPlayer` | `socketId` | `playerId` | 소켓 → 플레이어 매핑 |

서버 재시작 시 모든 데이터가 초기화됩니다.

## Socket.io 이벤트

### 클라이언트 → 서버

| 이벤트             | DTO                   | 설명                   |
| ------------------ | --------------------- | ---------------------- |
| `createRoom`       | `CreateRoomDto`       | 새 방 생성 (호스트)    |
| `joinRoom`         | `JoinRoomDto`         | 기존 방 입장           |
| `findRoom`         | `{ roomCode }`        | 방 정보 조회           |
| `rejoinRoom`       | `RejoinRoomDto`       | 재접속 (기존 플레이어) |
| `playerReady`      | `PlayerActionDto`     | 준비 상태 토글         |
| `startGame`        | `PlayerActionDto`     | 게임 시작 (호스트만)   |
| `drawTile`         | `PlayerActionDto`     | 타일 한 개 뽑기        |
| `submitBoardState` | `SubmitBoardStateDto` | 보드 전체 상태 제출    |
| `endTurn`          | `PlayerActionDto`     | 턴 종료                |
| `leaveRoom`        | `PlayerActionDto`     | 방 나가기              |

### 서버 → 클라이언트

| 이벤트                | 페이로드                                         | 설명                          |
| --------------------- | ------------------------------------------------ | ----------------------------- |
| `roomCreated`         | `{ roomCode, player }`                           | 방 생성 성공                  |
| `joinedRoom`          | `{ roomCode, players, myPlayerId, isHost }`      | 방 입장 성공                  |
| `roomFound`           | `{ roomCode, players, gameStarted, maxPlayers }` | 방 정보 조회 결과             |
| `playerJoined`        | `{ players, newPlayer }`                         | 새 플레이어 입장              |
| `playerLeft`          | `{ players, leftPlayer }`                        | 플레이어 퇴장                 |
| `playerStatusChanged` | `{ players }`                                    | 준비 상태 변경                |
| `gameStarted`         | `{ gameState, myTiles, isMyTurn }`               | 게임 시작                     |
| `tileDrawn`           | `{ myTiles, deckCount }`                         | 타일 뽑기 완료 (자동 턴 종료) |
| `boardUpdated`        | `{ gameState }`                                  | 보드 업데이트                 |
| `myTilesUpdated`      | `{ tiles }`                                      | 손패 업데이트 (자동 턴 종료)  |
| `turnChanged`         | `{ gameState, currentPlayerId }`                 | 턴 변경                       |
| `yourTurn`            | `{ isMyTurn }`                                   | 내 턴 알림                    |
| `gameOver`            | `{ winner, gameState }`                          | 게임 종료                     |
| `deckUpdated`         | `{ deckCount }`                                  | 덱 상태 변경                  |
| `error`               | `{ message }`                                    | 오류 발생                     |

## 엔티티

### Room

```typescript
class Room {
  roomCode: string;           // 6자리 고유 코드
  players: Player[];
  maxPlayers: number;         // 기본값: 4
  gameStarted: boolean;
  currentTurnIndex: number;
  board: Combination[];       // 배치된 조합
  deck: Tile[];               // 남은 타일
  gameOver: boolean;
  winner: Player | null;
  consecutivePasses: number;  // 덱 소진 종료 조건
  placedThisTurn: boolean;
  drewTileThisTurn: boolean;

  get host(): Player          // 호스트 반환
  get currentPlayer(): Player // 현재 턴 플레이어
  nextTurn(): void
  canStart(): boolean         // 2명 이상 + 모두 준비
}
```

### Player

```typescript
class Player {
  id: string;                 // UUID
  socketId: string;
  nickname: string;
  tiles: Tile[];              // 손패
  isReady: boolean;
  isHost: boolean;
  hasInitialMeld: boolean;    // 첫 멜드 달성 여부
  score: number;              // 게임 종료 시 패널티 점수

  toPublicInfo(): PlayerPublicInfo  // 손패 제외 공개 정보
}
```

### Tile

```typescript
class Tile {
  id: string;                         // 타임스탬프 + 난수
  number: number;                     // 1~13 (조커: 0)
  color: 'red' | 'blue' | 'yellow' | 'black' | null;
  isJoker: boolean;
}
```

### Combination

```typescript
class Combination {
  id: string;
  tiles: Tile[];
  type: 'run' | 'group';

  getValue(): number          // 점수 합계 (조커 0점)
}
```

### GameState (클라이언트 전송용 스냅샷)

```typescript
class GameState {
  roomCode: string;
  players: PlayerPublicInfo[];        // 손패 제외
  currentPlayerId: string | null;
  board: Combination[];
  deckCount: number;
  gameStarted: boolean;
  gameOver: boolean;
  winner: PlayerPublicInfo | null;

  static fromRoom(room: Room): GameState
}
```

## 게임 로직

> 게임 규칙(조합 규칙, 점수 계산, 승리 조건)의 상세 내용은 루트 [README.md](../README.md#게임-규칙)를 참고하세요.

### 보드 상태 검증 (submitBoardState)

클라이언트가 보드 전체 상태를 제출하면 아래 순서로 검증합니다:

1. 모든 조합이 유효한 런 또는 그룹인지 확인
2. 기존 보드 타일이 모두 포함되는지 확인 (누락 불가)
3. 손패 + 기존 보드 타일 외 타일 사용 불가
4. 최소 1개 이상 손패 타일 배치 필수
5. **첫 멜드 전**: 손패 타일만으로 30점 이상 달성 + 기존 보드 타일 조작 불가

### 덱 생성

숫자 1~13 × 4색 × 2세트(104개) + 조커 2개 = **총 106개**, Fisher-Yates 알고리즘으로 섞기

### 턴 관리

- 타일 뽑기(`drawTile`) → **자동 턴 종료**
- 보드 제출(`submitBoardState`) → 수동 `endTurn` 필요
- `endTurn` 시 `nextTurn()`으로 순환, 게임 종료 조건 확인

## 연결 해제 및 재접속

연결 해제 시 30초(`DISCONNECT_GRACE_PERIOD_MS`) 유예 기간을 부여합니다.

| 상황 | 처리 |
| --- | --- |
| 30초 내 `rejoinRoom` 수신 | 손패·게임 상태·턴·첫 멜드 여부 전부 복구 |
| 30초 초과 | 플레이어 제거 + `playerLeft` 브로드캐스트 |

## 유효성 검증

모든 Socket.io 이벤트 페이로드는 `class-validator`로 검증됩니다.

| 필드       | 규칙               |
| ---------- | ------------------ |
| `nickname` | 문자열, 2~20자     |
| `roomCode` | 문자열, 정확히 6자 |
| `playerId` | UUID 형식          |

검증 실패 시 `error` 이벤트가 클라이언트로 전송됩니다.

## 게임 상수

파일: `src/common/constants/game.constants.ts`

| 상수                         | 값    | 설명                            |
| ---------------------------- | ----- | ------------------------------- |
| `MIN_PLAYERS`                | 2     | 최소 플레이어 수                |
| `MAX_PLAYERS`                | 4     | 최대 플레이어 수                |
| `INITIAL_TILES_PER_PLAYER`   | 14    | 게임 시작 시 플레이어당 타일 수 |
| `MIN_INITIAL_MELD_VALUE`     | 30    | 첫 멜드 최소 점수               |
| `MIN_COMBINATION_SIZE`       | 3     | 조합 최소 타일 수               |
| `MAX_TILE_NUMBER`            | 13    | 타일 최대 숫자                  |
| `JOKER_COUNT`                | 2     | 조커 개수                       |
| `TILES_PER_SET`              | 2     | 타일 세트 수                    |
| `ROOM_CODE_LENGTH`           | 6     | 방 코드 길이                    |
| `DISCONNECT_GRACE_PERIOD_MS` | 30000 | 재접속 유예 기간 (30초)         |

```typescript
TILE_COLORS = ["red", "blue", "yellow", "black"];
```

## 주요 서비스

### RoomService

| 메서드                                               | 설명                            |
| ---------------------------------------------------- | ------------------------------- |
| `generateRoomCode()`                                 | 6자리 고유 방 코드 생성         |
| `createRoom(socketId, nickname)`                     | 새 방 생성 (호스트 지정)        |
| `findRoom(roomCode)`                                 | 방 조회                         |
| `joinRoom(roomCode, socketId, nickname)`             | 플레이어 입장                   |
| `rejoinRoom(roomCode, playerId, newSocketId)`        | 재접속 처리                     |
| `togglePlayerReady(roomCode, socketId)`              | 준비 상태 토글                  |
| `startGame(roomCode, socketId)`                      | 게임 시작 (호스트 검증)         |
| `drawTile(roomCode, socketId)`                       | 타일 뽑기 + 자동 턴 종료        |
| `submitBoardState(roomCode, socketId, combinations)` | 보드 상태 검증 및 적용          |
| `endTurn(roomCode, socketId)`                        | 턴 종료 + 승리 조건 확인        |
| `handlePlayerDisconnect(socketId)`                   | 연결 해제 처리 (유예 기간 포함) |

### GameService

| 메서드                        | 설명                                 |
| ----------------------------- | ------------------------------------ |
| `generateDeck()`              | 106개 타일 덱 생성 및 섞기           |
| `dealTiles(deck, count)`      | 덱에서 타일 배분                     |
| `validateRun(tiles)`          | 런 조합 유효성 검증                  |
| `validateGroup(tiles)`        | 그룹 조합 유효성 검증                |
| `validateCombination(tiles)`  | 조합 유효성 검증 (런/그룹 자동 판별) |
| `validateBoard(combinations)` | 보드 전체 조합 검증                  |
| `validateInitialMeld(tiles)`  | 첫 멜드 검증 (30점 이상)             |
| `calculateTileValue(tile)`    | 단일 타일 점수                       |
| `calculatePlayerScore(tiles)` | 플레이어 손패 점수 합계              |

## CORS 설정

`main.ts`와 `room.gateway.ts` 양쪽에 `CLIENT_URL` 환경 변수로 허용 오리진을 설정합니다 (기본값: `http://localhost:5173`, `credentials: true`).

## 에러 처리

모든 예외는 try-catch로 처리되어 `error` 이벤트로 클라이언트에 전송됩니다.

| 에러 메시지                              | 상황                          |
| ---------------------------------------- | ----------------------------- |
| "방을 찾을 수 없습니다."                 | 존재하지 않는 방 코드         |
| "방이 가득 찼습니다."                    | 최대 플레이어 수 초과         |
| "게임이 이미 시작되었습니다."            | 진행 중인 게임에 입장 시도    |
| "방장만 게임을 시작할 수 있습니다."      | 비호스트 플레이어가 시작 시도 |
| "모든 플레이어가 준비되지 않았습니다."   | 준비 미완료 플레이어 존재     |
| "당신의 턴이 아닙니다."                  | 턴 외 액션 시도               |
| "유효하지 않은 조합입니다."              | 규칙에 맞지 않는 조합         |
| "첫 멜드는 최소 30점 이상이어야 합니다." | 첫 멜드 점수 미달             |
