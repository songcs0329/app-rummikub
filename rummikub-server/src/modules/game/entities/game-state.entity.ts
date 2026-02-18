import { Room } from '../../room/entities/room.entity';

export class GameState {
  roomCode: string;
  players: any[];
  currentPlayerId: string | null;
  board: any[];
  deckCount: number;
  gameStarted: boolean;
  gameOver: boolean;
  winner: any | null;
  placedThisTurn: boolean;
  drewTileThisTurn: boolean;

  static fromRoom(room: Room) {
    const state = new GameState();
    state.roomCode = room.roomCode;
    state.players = room.players.map((p) => p.toPublicInfo());
    state.currentPlayerId = room.currentPlayer?.id || null;
    state.board = room.board;
    state.deckCount = room.deck.length;
    state.gameStarted = room.gameStarted;
    state.gameOver = room.gameOver;
    state.winner = room.winner ? room.winner.toPublicInfo() : null;
    state.placedThisTurn = room.placedThisTurn;
    state.drewTileThisTurn = room.drewTileThisTurn;
    return state;
  }
}
