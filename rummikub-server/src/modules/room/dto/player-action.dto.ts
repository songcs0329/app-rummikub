import { IsString } from 'class-validator';

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
