import { TileColor, type Tile } from '@/types/server.generated';

// ─── 점수 계산 ───────────────────────────────────────────

const JOKER_SCORE = 30;

/** 타일 하나의 점수를 계산한다 */
export function getTileValue(tile: Tile): number {
  return tile.isJoker ? JOKER_SCORE : tile.number;
}

/** 타일 배열의 총 점수를 계산한다 */
export function calculateScore(tiles: Tile[]): number {
  return tiles.reduce((sum, tile) => sum + getTileValue(tile), 0);
}

// ─── 자동 정렬 ───────────────────────────────────────────

export interface TileSet {
  tiles: Tile[];
  type: 'run' | 'group';
}

export interface SortResult {
  tiles: Tile[]; // 정렬된 전체 타일 배열
  sets: TileSet[]; // 감지된 조합 정보
  setEndIndices: number[]; // 각 조합이 끝나는 인덱스 (시각적 구분선용)
}

/** 색상 우선순위 매핑 (빨 → 파 → 검 → 노) */
const COLOR_ORDER: Record<TileColor, number> = {
  [TileColor.RED]: 0,
  [TileColor.BLUE]: 1,
  [TileColor.BLACK]: 2,
  [TileColor.YELLOW]: 3,
};

/** 색상 우선순위로 타일 비교 */
function compareByColorThenNumber(a: Tile, b: Tile): number {
  if (a.isJoker) return 1;
  if (b.isJoker) return -1;

  const colorA = COLOR_ORDER[a.color!];
  const colorB = COLOR_ORDER[b.color!];

  if (colorA !== colorB) return colorA - colorB;
  return a.number - b.number;
}

/**
 * 그룹 찾기: 같은 숫자, 다른 색상 3~4개
 * 각 색상당 최대 1개만 사용 (중복 타일 고려)
 */
function findGroups(tiles: Tile[], usedIds: Set<string>): TileSet[] {
  const groups: TileSet[] = [];
  const availableTiles = tiles.filter((t) => !usedIds.has(t.id) && !t.isJoker);

  // 숫자별로 그룹화
  const byNumber = new Map<number, Tile[]>();
  for (const tile of availableTiles) {
    if (!byNumber.has(tile.number)) {
      byNumber.set(tile.number, []);
    }
    byNumber.get(tile.number)!.push(tile);
  }

  // 각 숫자에 대해 그룹 생성
  for (const [, candidates] of byNumber) {
    // 색상별로 그룹화 (각 색상당 최대 1개)
    const byColor = new Map<TileColor, Tile>();
    for (const tile of candidates) {
      if (!byColor.has(tile.color!)) {
        byColor.set(tile.color!, tile);
      }
    }

    // 3개 이상이면 그룹 형성
    if (byColor.size >= 3) {
      const groupTiles = Array.from(byColor.values()).sort((a, b) => COLOR_ORDER[a.color!] - COLOR_ORDER[b.color!]);

      groups.push({ tiles: groupTiles, type: 'group' });
      groupTiles.forEach((t) => usedIds.add(t.id));
    }
  }

  return groups;
}

/** 런 찾기: 같은 색상, 연속된 숫자 3개 이상 */
function findRuns(tiles: Tile[], usedIds: Set<string>): TileSet[] {
  const runs: TileSet[] = [];
  const availableTiles = tiles.filter((t) => !usedIds.has(t.id) && !t.isJoker);

  // 색상별로 그룹화
  const byColor = new Map<TileColor, Tile[]>();
  for (const tile of availableTiles) {
    if (!byColor.has(tile.color!)) {
      byColor.set(tile.color!, []);
    }
    byColor.get(tile.color!)!.push(tile);
  }

  // 각 색상에 대해 런 찾기
  for (const colorTiles of byColor.values()) {
    colorTiles.sort((a, b) => a.number - b.number);

    let currentRun: Tile[] = [];
    for (const tile of colorTiles) {
      if (currentRun.length === 0) {
        currentRun.push(tile);
      } else {
        const lastNum = currentRun[currentRun.length - 1].number;
        if (tile.number === lastNum + 1) {
          currentRun.push(tile);
        } else {
          // 현재 런이 3개 이상이면 저장
          if (currentRun.length >= 3) {
            runs.push({ tiles: [...currentRun], type: 'run' });
            currentRun.forEach((t) => usedIds.add(t.id));
          }
          currentRun = [tile];
        }
      }
    }

    // 마지막 런 처리
    if (currentRun.length >= 3) {
      runs.push({ tiles: currentRun, type: 'run' });
      currentRun.forEach((t) => usedIds.add(t.id));
    }
  }

  return runs;
}

/**
 * 조커로 2타일 준-조합을 완성
 * - 같은 숫자, 다른 색상 2개 → 그룹
 * - 같은 색상, 연속/1칸 띄어진 2개 → 런
 */
function tryJokerCompletion(remainingTiles: Tile[], jokers: Tile[]): TileSet[] {
  const completedSets: TileSet[] = [];
  const usedTileIds = new Set<string>();
  const usedJokerIds = new Set<string>();

  // 숫자별 그룹화 (그룹 시도)
  const byNumber = new Map<number, Tile[]>();
  for (const tile of remainingTiles) {
    if (tile.isJoker) continue;
    if (!byNumber.has(tile.number)) {
      byNumber.set(tile.number, []);
    }
    byNumber.get(tile.number)!.push(tile);
  }

  for (const [, candidates] of byNumber) {
    const byColor = new Map<TileColor, Tile>();
    for (const tile of candidates) {
      if (usedTileIds.has(tile.id)) continue;
      if (!byColor.has(tile.color!)) {
        byColor.set(tile.color!, tile);
      }
    }

    if (byColor.size === 2 && jokers.length > usedJokerIds.size) {
      const availableJoker = jokers.find((j) => !usedJokerIds.has(j.id));
      if (availableJoker) {
        const groupTiles = Array.from(byColor.values()).sort((a, b) => COLOR_ORDER[a.color!] - COLOR_ORDER[b.color!]);
        groupTiles.push(availableJoker);

        completedSets.push({ tiles: groupTiles, type: 'group' });
        groupTiles.forEach((t) => {
          if (t.isJoker) usedJokerIds.add(t.id);
          else usedTileIds.add(t.id);
        });
      }
    }
  }

  // 색상별 그룹화 (런 시도)
  const byColor = new Map<TileColor, Tile[]>();
  for (const tile of remainingTiles) {
    if (tile.isJoker || usedTileIds.has(tile.id)) continue;
    if (!byColor.has(tile.color!)) {
      byColor.set(tile.color!, []);
    }
    byColor.get(tile.color!)!.push(tile);
  }

  for (const colorTiles of byColor.values()) {
    colorTiles.sort((a, b) => a.number - b.number);

    for (let i = 0; i < colorTiles.length - 1; i++) {
      const tile1 = colorTiles[i];
      const tile2 = colorTiles[i + 1];

      if (usedTileIds.has(tile1.id) || usedTileIds.has(tile2.id)) continue;

      const gap = tile2.number - tile1.number;
      if ((gap === 1 || gap === 2) && jokers.length > usedJokerIds.size) {
        const availableJoker = jokers.find((j) => !usedJokerIds.has(j.id));
        if (availableJoker) {
          const runTiles = [tile1, availableJoker, tile2];
          completedSets.push({ tiles: runTiles, type: 'run' });

          usedTileIds.add(tile1.id);
          usedTileIds.add(tile2.id);
          usedJokerIds.add(availableJoker.id);
        }
      }
    }
  }

  return completedSets;
}

/** 런 타일 정렬 (조커를 올바른 위치에 배치) */
function sortRunTiles(tiles: Tile[]): Tile[] {
  const jokers = tiles.filter((t) => t.isJoker);
  const numbered = tiles.filter((t) => !t.isJoker).sort((a, b) => a.number - b.number);

  if (jokers.length === 0) return numbered;

  const result: Tile[] = [];
  let jokerIndex = 0;

  for (let i = 0; i < numbered.length; i++) {
    const current = numbered[i];
    const next = numbered[i + 1];

    // 시작 부분에 조커 필요
    if (i === 0 && current.number > 1 && jokerIndex < jokers.length) {
      result.push(jokers[jokerIndex++]);
    }

    result.push(current);

    // 다음 타일과 갭이 있으면 조커 삽입
    if (next && next.number - current.number > 1 && jokerIndex < jokers.length) {
      result.push(jokers[jokerIndex++]);
    }
  }

  // 남은 조커는 끝에 추가
  while (jokerIndex < jokers.length) {
    result.push(jokers[jokerIndex++]);
  }

  return result;
}

/** 메인 정렬 함수 */
export function autoSortTiles(tiles: Tile[]): SortResult {
  if (tiles.length === 0) {
    return { tiles: [], sets: [], setEndIndices: [] };
  }

  const usedIds = new Set<string>();
  const allSets: TileSet[] = [];

  // 1. 조커 분리
  const jokers = tiles.filter((t) => t.isJoker);
  const numbered = tiles.filter((t) => !t.isJoker);

  // 2. 그룹 찾기 (더 제약적이므로 먼저)
  const groups = findGroups(numbered, usedIds);
  allSets.push(...groups);

  // 3. 런 찾기
  const runs = findRuns(numbered, usedIds);
  allSets.push(...runs);

  // 4. 조커로 준-조합 완성
  const remaining = numbered.filter((t) => !usedIds.has(t.id));
  const jokerCompleted = tryJokerCompletion(remaining, jokers);
  allSets.push(...jokerCompleted);

  // 사용된 조커 추적
  const usedJokers = new Set<string>();
  for (const set of jokerCompleted) {
    for (const tile of set.tiles) {
      if (tile.isJoker) {
        usedJokers.add(tile.id);
        usedIds.add(tile.id);
      } else {
        usedIds.add(tile.id);
      }
    }
  }

  // 5. 최종 정렬된 배열 구성
  const sortedTiles: Tile[] = [];
  const setEndIndices: number[] = [];

  // 조합 타일 추가
  for (const set of allSets) {
    if (set.type === 'run') {
      const sortedRun = sortRunTiles(set.tiles);
      sortedTiles.push(...sortedRun);
    } else {
      sortedTiles.push(...set.tiles);
    }
    setEndIndices.push(sortedTiles.length - 1);
  }

  // 남은 타일 정렬 (색상 → 숫자 순)
  const leftover = tiles.filter((t) => !usedIds.has(t.id) && !t.isJoker);
  leftover.sort(compareByColorThenNumber);
  sortedTiles.push(...leftover);

  // 사용되지 않은 조커는 맨 끝
  const unusedJokers = jokers.filter((j) => !usedJokers.has(j.id));
  sortedTiles.push(...unusedJokers);

  return {
    tiles: sortedTiles,
    sets: allSets,
    setEndIndices,
  };
}
