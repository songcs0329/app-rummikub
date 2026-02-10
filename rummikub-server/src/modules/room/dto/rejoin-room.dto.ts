import { IsString, IsUUID, Length } from 'class-validator';

export class RejoinRoomDto {
  @IsString()
  @Length(6, 6, { message: '방 코드는 6자리여야 합니다.' })
  roomCode: string;

  @IsString()
  @IsUUID()
  playerId: string;
}
