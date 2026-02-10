import { IsString, MinLength, MaxLength, Length } from 'class-validator';

export class JoinRoomDto {
  @IsString()
  @Length(6, 6, { message: '방 코드는 6자리여야 합니다.' })
  roomCode: string;

  @IsString()
  @MinLength(2)
  @MaxLength(20)
  nickname: string;
}
