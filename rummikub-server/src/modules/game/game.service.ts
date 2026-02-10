import { Injectable } from '@nestjs/common';
import { Tile, TileColor } from './entities/tile.entity';
import { CombinationType } from './entities/combination.entity';
import {
  GAME_CONSTANTS,
  TILE_COLORS,
} from '../../common/constants/game.constants';

@Injectable()
export class GameService {
  generateDeck(): Tile[] {
    const tiles: Tile[] = [];

    for (let set = 0; set < GAME_CONSTANTS.TILES_PER_SET; set++) {
      for (const color of TILE_COLORS) {
        for (
          let number = 1;
          number <= GAME_CONSTANTS.MAX_TILE_NUMBER;
          number++
        ) {
          tiles.push(new Tile(number, color as TileColor, false));
        }
      }
    }

    for (let i = 0; i < GAME_CONSTANTS.JOKER_COUNT; i++) {
      tiles.push(new Tile(0, null, true));
    }

    return this.shuffleDeck(tiles);
  }

  private shuffleDeck(deck: Tile[]): Tile[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  dealTiles(
    deck: Tile[],
    count: number,
  ): { dealt: Tile[]; remaining: Tile[] } {
    const dealt = deck.splice(0, count);
    return { dealt, remaining: deck };
  }

  validateRun(tiles: Tile[]): boolean {
    if (tiles.length < GAME_CONSTANTS.MIN_COMBINATION_SIZE) return false;

    const nonJokers = tiles.filter((t) => !t.isJoker);
    if (nonJokers.length === 0) return false;

    const color = nonJokers[0].color;
    if (!nonJokers.every((t) => t.color === color)) return false;

    const sorted = [...tiles]
      .filter((t) => !t.isJoker)
      .sort((a, b) => a.number - b.number);
    let jokerCount = tiles.filter((t) => t.isJoker).length;

    if (sorted.length === 0) return jokerCount >= GAME_CONSTANTS.MIN_COMBINATION_SIZE;

    let expected = sorted[0].number;
    for (const tile of sorted) {
      while (tile.number > expected && jokerCount > 0) {
        jokerCount--;
        expected++;
      }
      if (tile.number !== expected) return false;
      expected++;
    }

    return true;
  }

  validateGroup(tiles: Tile[]): boolean {
    if (tiles.length < GAME_CONSTANTS.MIN_COMBINATION_SIZE) return false;
    if (tiles.length > 4) return false;

    const nonJokers = tiles.filter((t) => !t.isJoker);
    if (nonJokers.length === 0) return false;

    const number = nonJokers[0].number;
    if (!nonJokers.every((t) => t.number === number)) return false;

    const colors = new Set(nonJokers.map((t) => t.color));
    if (colors.size !== nonJokers.length) return false;

    return true;
  }

  validateCombination(tiles: Tile[]): CombinationType | null {
    if (this.validateRun(tiles)) return CombinationType.RUN;
    if (this.validateGroup(tiles)) return CombinationType.GROUP;
    return null;
  }

  validateBoard(combinations: { tiles: Tile[] }[]): boolean {
    return combinations.every(
      (comb) => this.validateCombination(comb.tiles) !== null,
    );
  }

  validateInitialMeld(tiles: Tile[]): boolean {
    const totalValue = tiles.reduce(
      (sum, t) => sum + (t.isJoker ? 0 : t.number),
      0,
    );
    return totalValue >= GAME_CONSTANTS.MIN_INITIAL_MELD_VALUE;
  }

  calculateTileValue(tile: Tile): number {
    if (tile.isJoker) return 30;
    return tile.number;
  }

  calculatePlayerScore(tiles: Tile[]): number {
    return tiles.reduce(
      (sum, tile) => sum + this.calculateTileValue(tile),
      0,
    );
  }
}
