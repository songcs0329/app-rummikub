export enum TileColor {
  RED = 'red',
  BLUE = 'blue',
  YELLOW = 'yellow',
  BLACK = 'black',
}

export class Tile {
  id: string;
  number: number;
  color: TileColor | null;
  isJoker: boolean;

  constructor(
    number: number,
    color: TileColor | null,
    isJoker: boolean = false,
  ) {
    this.id = `${color || 'joker'}-${number}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.number = number;
    this.color = color;
    this.isJoker = isJoker;
  }
}
