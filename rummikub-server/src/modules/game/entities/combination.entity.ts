import { Tile } from './tile.entity';

export enum CombinationType {
  RUN = 'run',
  GROUP = 'group',
}

export class Combination {
  id: string;
  tiles: Tile[];
  type: CombinationType;

  constructor(tiles: Tile[], type: CombinationType) {
    this.id = `comb-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.tiles = tiles;
    this.type = type;
  }

  getValue(): number {
    return this.tiles.reduce(
      (sum, tile) => sum + (tile.isJoker ? 0 : tile.number),
      0,
    );
  }
}
