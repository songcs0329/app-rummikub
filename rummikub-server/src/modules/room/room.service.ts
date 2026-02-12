import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Room } from './entities/room.entity';
import { Player } from './entities/player.entity';
import { GameService } from '../game/game.service';
import { GAME_CONSTANTS } from '../../common/constants/game.constants';

@Injectable()
export class RoomService {
  private rooms: Map<string, Room> = new Map();
  private socketToRoom: Map<string, string> = new Map();
  private socketToPlayer: Map<string, string> = new Map();
  private disconnectTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(private readonly gameService: GameService) {}

  generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    do {
      code = '';
      for (let i = 0; i < GAME_CONSTANTS.ROOM_CODE_LENGTH; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.rooms.has(code));

    return code;
  }

  createRoom(socketId: string, nickname: string): Room {
    const roomCode = this.generateRoomCode();
    const playerId = uuidv4();

    const host = new Player(playerId, socketId, nickname, true);
    const room = new Room(roomCode);
    room.players.push(host);

    this.rooms.set(roomCode, room);
    this.socketToRoom.set(socketId, roomCode);
    this.socketToPlayer.set(socketId, playerId);

    return room;
  }

  findRoom(roomCode: string): Room {
    const room = this.rooms.get(roomCode);
    if (!room) {
      throw new NotFoundException('방을 찾을 수 없습니다.');
    }
    return room;
  }

  joinRoom(roomCode: string, socketId: string, nickname: string): Room {
    const room = this.findRoom(roomCode);

    if (room.players.length >= room.maxPlayers) {
      throw new BadRequestException('방이 가득 찼습니다.');
    }

    if (room.gameStarted) {
      throw new BadRequestException('게임이 이미 시작되었습니다.');
    }

    const playerId = uuidv4();
    const player = new Player(playerId, socketId, nickname, false);

    room.players.push(player);
    this.socketToRoom.set(socketId, roomCode);
    this.socketToPlayer.set(socketId, playerId);

    return room;
  }

  togglePlayerReady(roomCode: string, socketId: string): Room {
    const room = this.findRoom(roomCode);
    const player = this.findPlayerBySocket(room, socketId);

    if (!player) {
      throw new BadRequestException('플레이어를 찾을 수 없습니다.');
    }

    player.isReady = !player.isReady;
    return room;
  }

  startGame(roomCode: string, socketId: string): Room {
    const room = this.findRoom(roomCode);
    const player = this.findPlayerBySocket(room, socketId);

    if (!player?.isHost) {
      throw new BadRequestException('방장만 게임을 시작할 수 있습니다.');
    }

    if (!room.canStart()) {
      throw new BadRequestException(
        '모든 플레이어가 준비되지 않았습니다.',
      );
    }

    room.deck = this.gameService.generateDeck();

    room.players.forEach((p) => {
      const { dealt, remaining } = this.gameService.dealTiles(
        room.deck,
        GAME_CONSTANTS.INITIAL_TILES_PER_PLAYER,
      );
      p.tiles = dealt;
      room.deck = remaining;
    });

    room.gameStarted = true;
    room.currentTurnIndex = 0;
    room.consecutivePasses = 0;
    room.placedThisTurn = false;

    return room;
  }

  drawTile(
    roomCode: string,
    socketId: string,
  ): { tile: any; deckCount: number } {
    const room = this.findRoom(roomCode);
    const player = this.findPlayerBySocket(room, socketId);

    if (room.currentPlayer?.id !== player?.id) {
      throw new BadRequestException('당신의 턴이 아닙니다.');
    }

    if (room.deck.length === 0) {
      throw new BadRequestException('더 이상 뽑을 타일이 없습니다.');
    }

    const tile = room.deck.shift()!;
    player!.tiles.push(tile);

    return {
      tile,
      deckCount: room.deck.length,
    };
  }

  endTurn(roomCode: string, socketId: string): Room {
    const room = this.findRoom(roomCode);
    const player = this.findPlayerBySocket(room, socketId);

    if (room.currentPlayer?.id !== player?.id) {
      throw new BadRequestException('당신의 턴이 아닙니다.');
    }

    // 조건 ①: 손패를 모두 낸 플레이어가 승리
    if (player!.tiles.length === 0) {
      room.gameOver = true;
      room.winner = player ?? null;
      room.players.forEach((p) => {
        p.score = this.gameService.calculatePlayerScore(p.tiles);
      });
      return room;
    }

    // 연속 패스 추적 (조합을 놓지 않은 턴 = 패스)
    if (room.placedThisTurn) {
      room.consecutivePasses = 0;
    } else {
      room.consecutivePasses++;
    }

    // 조건 ②: 더미 소진 + 전원 연속 패스 → 남은 타일 합계가 가장 낮은 플레이어 승리
    if (
      room.deck.length === 0 &&
      room.consecutivePasses >= room.players.length
    ) {
      room.gameOver = true;
      room.players.forEach((p) => {
        p.score = this.gameService.calculatePlayerScore(p.tiles);
      });
      room.winner = room.players.reduce((min, p) =>
        p.score < min.score ? p : min,
      );
    } else {
      room.nextTurn();
    }

    return room;
  }

  handlePlayerDisconnect(
    socketId: string,
  ): { roomCode: string; leftPlayer: any; room: Room } | null {
    const roomCode = this.socketToRoom.get(socketId);
    if (!roomCode) return null;

    const room = this.rooms.get(roomCode);
    if (!room) return null;

    const player = this.findPlayerBySocket(room, socketId);
    if (!player) return null;

    const leftPlayerInfo = player.toPublicInfo();

    room.players = room.players.filter((p) => p.socketId !== socketId);

    if (room.players.length === 0) {
      this.rooms.delete(roomCode);
      this.socketToRoom.delete(socketId);
      this.socketToPlayer.delete(socketId);
      return null;
    }

    if (player.isHost && room.players.length > 0) {
      room.players[0].isHost = true;
    }

    if (room.gameStarted && room.currentTurnIndex >= room.players.length) {
      room.currentTurnIndex = 0;
    }

    this.socketToRoom.delete(socketId);
    this.socketToPlayer.delete(socketId);

    return { roomCode, leftPlayer: leftPlayerInfo, room };
  }

  private findPlayerBySocket(
    room: Room,
    socketId: string,
  ): Player | undefined {
    return room.players.find((p) => p.socketId === socketId);
  }

  getPlayerTiles(roomCode: string, socketId: string): any[] {
    const room = this.findRoom(roomCode);
    const player = this.findPlayerBySocket(room, socketId);
    return player ? player.tiles : [];
  }

  placeCombination(
    roomCode: string,
    socketId: string,
    combinationData: any,
  ): Room {
    const room = this.findRoom(roomCode);
    const player = this.findPlayerBySocket(room, socketId);

    if (!player || room.currentPlayer?.id !== player.id) {
      throw new BadRequestException('당신의 턴이 아닙니다.');
    }

    const combinationType = this.gameService.validateCombination(
      combinationData.tiles,
    );
    if (!combinationType) {
      throw new BadRequestException('유효하지 않은 조합입니다.');
    }

    if (!player.hasInitialMeld) {
      if (!this.gameService.validateInitialMeld(combinationData.tiles)) {
        throw new BadRequestException(
          '첫 멜드는 최소 30점 이상이어야 합니다.',
        );
      }
      player.hasInitialMeld = true;
    }

    room.board.push(combinationData);
    room.placedThisTurn = true;

    combinationData.tiles.forEach((tile: any) => {
      const index = player.tiles.findIndex((t) => t.id === tile.id);
      if (index !== -1) {
        player.tiles.splice(index, 1);
      }
    });

    return room;
  }

  /**
   * 소켓 연결 해제 시 소켓 매핑만 제거하고 플레이어는 방에 유지
   * playerId와 roomCode를 반환하여 gateway에서 타이머 설정 가능
   */
  markDisconnecting(socketId: string): { playerId: string; roomCode: string } | null {
    const roomCode = this.socketToRoom.get(socketId);
    if (!roomCode) return null;

    const playerId = this.socketToPlayer.get(socketId);
    if (!playerId) return null;

    // 소켓 매핑만 제거 (플레이어는 방에 유지)
    this.socketToRoom.delete(socketId);
    this.socketToPlayer.delete(socketId);

    return { playerId, roomCode };
  }

  setDisconnectTimer(playerId: string, timer: NodeJS.Timeout): void {
    this.disconnectTimers.set(playerId, timer);
  }

  cancelDisconnectTimer(playerId: string): void {
    const timer = this.disconnectTimers.get(playerId);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(playerId);
    }
  }

  /**
   * 유예 기간 후 실제로 플레이어를 방에서 제거
   */
  removeDisconnectedPlayer(
    playerId: string,
    roomCode: string,
  ): { leftPlayer: any; room: Room } | null {
    this.disconnectTimers.delete(playerId);

    const room = this.rooms.get(roomCode);
    if (!room) return null;

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return null;

    const leftPlayerInfo = player.toPublicInfo();
    room.players = room.players.filter((p) => p.id !== playerId);

    if (room.players.length === 0) {
      this.rooms.delete(roomCode);
      return null;
    }

    if (player.isHost && room.players.length > 0) {
      room.players[0].isHost = true;
    }

    if (room.gameStarted && room.currentTurnIndex >= room.players.length) {
      room.currentTurnIndex = 0;
    }

    return { leftPlayer: leftPlayerInfo, room };
  }

  /**
   * 재접속: 기존 플레이어의 소켓 ID를 새 것으로 교체
   */
  rejoinRoom(roomCode: string, playerId: string, newSocketId: string): Room {
    const room = this.findRoom(roomCode);
    const player = room.players.find((p) => p.id === playerId);

    if (!player) {
      throw new NotFoundException('플레이어를 찾을 수 없습니다.');
    }

    this.cancelDisconnectTimer(playerId);

    player.socketId = newSocketId;
    this.socketToRoom.set(newSocketId, roomCode);
    this.socketToPlayer.set(newSocketId, playerId);

    return room;
  }
}
