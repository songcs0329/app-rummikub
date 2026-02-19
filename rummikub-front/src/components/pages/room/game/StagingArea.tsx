import { X } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TileComponent from './TileComponent';
import type { Tile } from '@/types/server.generated';
import { useGameStore } from '@/store/useGameStore';

/** 스테이징 영역 내 개별 정렬 가능한 타일 */
function StagedSortableTile({ tile }: { tile: Tile }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tile.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="cursor-grab touch-none">
      <TileComponent tile={tile} size="sm" />
    </div>
  );
}

/** 단일 스테이징 조합 (DnD 재정렬 지원) */
function StagedCombo({ tiles, comboIndex }: { tiles: Tile[]; comboIndex: number }) {
  const reorderStagedTile = useGameStore((state) => state.reorderStagedTile);
  const unstageCombo = useGameStore((state) => state.unstageCombo);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = tiles.findIndex((t) => t.id === active.id);
    const to = tiles.findIndex((t) => t.id === over.id);
    if (from !== -1 && to !== -1) {
      reorderStagedTile(comboIndex, from, to);
    }
  };

  return (
    <div className="flex items-center gap-1 rounded-md border border-emerald-200 bg-white/80 p-1.5 shadow-sm">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tiles.map((t) => t.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex gap-0.5 w-full overflow-hidden flex-wrap">
            {tiles.map((tile) => (
              <StagedSortableTile key={tile.id} tile={tile} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <button
        onClick={() => unstageCombo(comboIndex)}
        className="ml-1 flex-shrink-0 rounded p-0.5 text-zinc-400 hover:bg-red-50 hover:text-red-500"
        title="조합 제거"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

/** 선택된 타일 조합 미리보기 + 스테이징된 조합 목록 */
function StagingArea() {
  const gameState = useGameStore((state) => state.gameState);
  const myTiles = useGameStore((state) => state.myTiles);
  const selectedTileIds = useGameStore((state) => state.selectedTileIds);
  const selectedBoardTileIds = useGameStore((state) => state.selectedBoardTileIds);
  const clearSelection = useGameStore((state) => state.clearSelection);
  const clearBoardSelection = useGameStore((state) => state.clearBoardSelection);
  const stagedCombinations = useGameStore((state) => state.stagedCombinations);

  // 손패에서 선택된 타일 (선택 순서 유지)
  const selectedHandTiles = selectedTileIds
    .map((id) => myTiles.find((t) => t.id === id))
    .filter((t): t is Tile => t !== undefined);

  // 보드에서 선택된 타일
  const boardTileMap = new Map<string, Tile>();
  gameState?.board.forEach((combo) => combo.tiles.forEach((t) => boardTileMap.set(t.id, t)));
  const selectedBoardTiles = selectedBoardTileIds
    .map((id) => boardTileMap.get(id))
    .filter((t): t is Tile => t !== undefined);

  const totalSelected = selectedHandTiles.length + selectedBoardTiles.length;
  const hasAnything = totalSelected > 0 || stagedCombinations.length > 0;
  if (!hasAnything) return null;

  const hasBoardSelection = selectedBoardTileIds.length > 0;

  return (
    <div className="flex flex-col gap-2 rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-3">
      {/* 현재 선택 미리보기 (손패 + 보드 타일 통합) */}
      {totalSelected > 0 && (
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600">
              선택 중 ({totalSelected}개{hasBoardSelection ? ` · 보드 ${selectedBoardTiles.length}장 포함` : ''})
            </span>
            <div className="flex gap-2">
              {hasBoardSelection && (
                <button onClick={clearBoardSelection} className="text-xs text-blue-400 hover:text-blue-600">
                  보드 선택 해제
                </button>
              )}
              {selectedHandTiles.length > 0 && (
                <button onClick={clearSelection} className="text-xs text-zinc-400 hover:text-zinc-600">
                  손패 선택 해제
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-0.5">
            {selectedHandTiles.map((tile) => (
              <TileComponent key={tile.id} tile={tile} size="sm" />
            ))}
            {selectedBoardTiles.map((tile) => (
              <div key={tile.id} className="rounded ring-2 ring-blue-400">
                <TileComponent tile={tile} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 스테이징된 조합 목록 */}
      {stagedCombinations.length > 0 && (
        <div>
          <span className="mb-1.5 block text-xs font-medium text-zinc-500">
            제출 대기 조합 ({stagedCombinations.length}개)
          </span>
          <div className="flex flex-col gap-1.5">
            {stagedCombinations.map((combo, i) => (
              <StagedCombo key={i} tiles={combo} comboIndex={i} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StagingArea;
