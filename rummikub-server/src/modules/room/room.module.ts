import { Module } from '@nestjs/common';
import { RoomGateway } from './room.gateway';
import { RoomService } from './room.service';
import { GameModule } from '../game/game.module';

@Module({
  imports: [GameModule],
  providers: [RoomGateway, RoomService],
})
export class RoomModule {}
