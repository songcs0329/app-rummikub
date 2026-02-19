import { IsString, IsArray } from 'class-validator';

export class PlayerActionDto {
  @IsString()
  roomCode: string;
}

export class PlaceCombinationDto extends PlayerActionDto {
  combination: any;
}

export class PlaceMultipleCombinationsDto extends PlayerActionDto {
  combinations: any[];
}

export class SubmitBoardStateDto extends PlayerActionDto {
  @IsArray()
  combinations: { tiles: { id: string; number: number; color: string | null; isJoker: boolean }[] }[];
}
