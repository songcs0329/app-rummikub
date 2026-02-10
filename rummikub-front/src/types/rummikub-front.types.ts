export interface CustomerPlayer {
  id: string;
  nickname: string;
  isHost: boolean;
}

export interface PlayerPublicInfo extends CustomerPlayer {
  isReady: boolean;
  tileCount: number;
  hasInitialMeld: boolean;
  score: number;
}

export interface RoomFoundData {
  roomCode: string;
  players: PlayerPublicInfo[];
  gameStarted: boolean;
  maxPlayers: number;
}
