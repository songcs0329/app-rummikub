import { Tile } from '../../game/entities/tile.entity';

export class Player {
  id: string;
  socketId: string;
  nickname: string;
  tiles: Tile[];
  isReady: boolean;
  isHost: boolean;
  hasInitialMeld: boolean;
  score: number;

  constructor(
    id: string,
    socketId: string,
    nickname: string,
    isHost: boolean = false,
  ) {
    this.id = id;
    this.socketId = socketId;
    this.nickname = nickname;
    this.tiles = [];
    this.isReady = false;
    this.isHost = isHost;
    this.hasInitialMeld = false;
    this.score = 0;
  }

  toPublicInfo() {
    return {
      id: this.id,
      nickname: this.nickname,
      isReady: this.isReady,
      isHost: this.isHost,
      tileCount: this.tiles.length,
      hasInitialMeld: this.hasInitialMeld,
      score: this.score,
    };
  }
}
