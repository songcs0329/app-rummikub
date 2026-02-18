import { Player } from './player.entity';
import { Combination } from '../../game/entities/combination.entity';
import { Tile } from '../../game/entities/tile.entity';

export class Room {
  roomCode: string;
  players: Player[];
  maxPlayers: number;
  createdAt: Date;
  gameStarted: boolean;
  currentTurnIndex: number;
  board: Combination[];
  deck: Tile[];
  gameOver: boolean;
  winner: Player | null;
  consecutivePasses: number;
  placedThisTurn: boolean;
  drewTileThisTurn: boolean;

  constructor(roomCode: string) {
    this.roomCode = roomCode;
    this.players = [];
    this.maxPlayers = 4;
    this.createdAt = new Date();
    this.gameStarted = false;
    this.currentTurnIndex = 0;
    this.board = [];
    this.deck = [];
    this.gameOver = false;
    this.winner = null;
    this.consecutivePasses = 0;
    this.placedThisTurn = false;
    this.drewTileThisTurn = false;
  }

  get host(): Player | null {
    return this.players.find((p) => p.isHost) || null;
  }

  get currentPlayer(): Player | null {
    if (!this.gameStarted || this.players.length === 0) return null;
    return this.players[this.currentTurnIndex];
  }

  nextTurn() {
    this.currentTurnIndex =
      (this.currentTurnIndex + 1) % this.players.length;
    this.placedThisTurn = false;
    this.drewTileThisTurn = false;
  }

  canStart(): boolean {
    return (
      this.players.length >= 2 &&
      this.players.every((p) => p.isReady || p.isHost)
    );
  }
}
