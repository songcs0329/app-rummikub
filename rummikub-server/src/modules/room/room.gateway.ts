import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from './room.service';
import {
  CreateRoomDto,
  JoinRoomDto,
  PlayerActionDto,
  PlaceCombinationDto,
  PlaceMultipleCombinationsDto,
  RejoinRoomDto,
} from './dto';
import { GameState } from '../game/entities/game-state.entity';
import { GAME_CONSTANTS } from '../../common/constants/game.constants';

@WebSocketGateway({
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  },
})
export class RoomGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly roomService: RoomService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);

    const info = this.roomService.markDisconnecting(client.id);
    if (!info) return;

    const timer = setTimeout(() => {
      const result = this.roomService.removeDisconnectedPlayer(
        info.playerId,
        info.roomCode,
      );
      if (result) {
        this.server.to(info.roomCode).emit('playerLeft', {
          players: result.room.players.map((p) => p.toPublicInfo()),
          leftPlayer: result.leftPlayer,
        });
      }
    }, GAME_CONSTANTS.DISCONNECT_GRACE_PERIOD_MS);

    this.roomService.setDisconnectTimer(info.playerId, timer);
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateRoomDto,
  ) {
    try {
      const room = this.roomService.createRoom(client.id, data.nickname);
      client.join(room.roomCode);

      client.emit('roomCreated', {
        roomCode: room.roomCode,
        player: room.host!.toPublicInfo(),
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: JoinRoomDto,
  ) {
    try {
      const room = this.roomService.joinRoom(
        data.roomCode,
        client.id,
        data.nickname,
      );
      client.join(data.roomCode);

      const newPlayer = room.players.find(
        (p) => p.socketId === client.id,
      );

      client.to(data.roomCode).emit('playerJoined', {
        players: room.players.map((p) => p.toPublicInfo()),
        newPlayer: newPlayer?.toPublicInfo(),
      });

      client.emit('joinedRoom', {
        roomCode: room.roomCode,
        players: room.players.map((p) => p.toPublicInfo()),
        myPlayerId: newPlayer?.id,
        isHost: newPlayer?.isHost,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('findRoom')
  handleFindRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string },
  ) {
    try {
      const room = this.roomService.findRoom(data.roomCode);

      client.emit('roomFound', {
        roomCode: room.roomCode,
        players: room.players.map((p) => p.toPublicInfo()),
        gameStarted: room.gameStarted,
        maxPlayers: room.maxPlayers,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('rejoinRoom')
  handleRejoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: RejoinRoomDto,
  ) {
    try {
      const room = this.roomService.rejoinRoom(
        data.roomCode,
        data.playerId,
        client.id,
      );
      client.join(data.roomCode);

      client.emit('roomFound', {
        roomCode: room.roomCode,
        players: room.players.map((p) => p.toPublicInfo()),
        gameStarted: room.gameStarted,
        maxPlayers: room.maxPlayers,
      });

      // 게임이 진행 중이면 게임 상태도 전송
      if (room.gameStarted) {
        const player = room.players.find((p) => p.id === data.playerId);
        if (player) {
          const gameState = GameState.fromRoom(room);
          client.emit('gameStarted', {
            gameState,
            myTiles: player.tiles,
            isMyTurn: room.currentPlayer?.id === player.id,
          });
        }
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('playerReady')
  handlePlayerReady(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: PlayerActionDto,
  ) {
    try {
      const room = this.roomService.togglePlayerReady(
        data.roomCode,
        client.id,
      );

      this.server.to(data.roomCode).emit('playerStatusChanged', {
        players: room.players.map((p) => p.toPublicInfo()),
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('startGame')
  handleStartGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: PlayerActionDto,
  ) {
    try {
      const room = this.roomService.startGame(data.roomCode, client.id);
      const gameState = GameState.fromRoom(room);

      room.players.forEach((player) => {
        this.server.to(player.socketId).emit('gameStarted', {
          gameState,
          myTiles: player.tiles,
          isMyTurn: room.currentPlayer?.id === player.id,
        });
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('drawTile')
  handleDrawTile(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: PlayerActionDto,
  ) {
    try {
      const result = this.roomService.drawTile(data.roomCode, client.id);
      const myTiles = this.roomService.getPlayerTiles(
        data.roomCode,
        client.id,
      );

      client.emit('tileDrawn', {
        myTiles,
        deckCount: result.deckCount,
      });

      client.to(data.roomCode).emit('deckUpdated', {
        deckCount: result.deckCount,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('placeCombination')
  handlePlaceCombination(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: PlaceCombinationDto,
  ) {
    try {
      const room = this.roomService.placeCombination(
        data.roomCode,
        client.id,
        data.combination,
      );

      const gameState = GameState.fromRoom(room);

      this.server.to(data.roomCode).emit('boardUpdated', {
        gameState,
      });

      const myTiles = this.roomService.getPlayerTiles(
        data.roomCode,
        client.id,
      );
      client.emit('myTilesUpdated', {
        tiles: myTiles,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('placeMultipleCombinations')
  handlePlaceMultipleCombinations(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: PlaceMultipleCombinationsDto,
  ) {
    try {
      const room = this.roomService.placeMultipleCombinations(
        data.roomCode,
        client.id,
        data.combinations,
      );

      const gameState = GameState.fromRoom(room);

      this.server.to(data.roomCode).emit('boardUpdated', {
        gameState,
      });

      const myTiles = this.roomService.getPlayerTiles(
        data.roomCode,
        client.id,
      );
      client.emit('myTilesUpdated', {
        tiles: myTiles,
      });
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('endTurn')
  handleEndTurn(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: PlayerActionDto,
  ) {
    try {
      const room = this.roomService.endTurn(data.roomCode, client.id);
      const gameState = GameState.fromRoom(room);

      if (room.gameOver) {
        this.server.to(data.roomCode).emit('gameOver', {
          winner: room.winner?.toPublicInfo(),
          gameState,
        });
      } else {
        this.server.to(data.roomCode).emit('turnChanged', {
          gameState,
          currentPlayerId: room.currentPlayer?.id,
        });

        if (room.currentPlayer) {
          this.server
            .to(room.currentPlayer.socketId)
            .emit('yourTurn', {
              isMyTurn: true,
            });
        }
      }
    } catch (error) {
      client.emit('error', { message: error.message });
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: PlayerActionDto,
  ) {
    const result = this.roomService.handlePlayerDisconnect(client.id);
    if (result) {
      client.leave(data.roomCode);
      this.server.to(result.roomCode).emit('playerLeft', {
        players: result.room.players.map((p) => p.toPublicInfo()),
        leftPlayer: result.leftPlayer,
      });
    }
  }
}
