import { useMemo, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import SortableTile from './SortableTile';
import TileComponent from './TileComponent';
import { useGameStore } from '@/store/useGameStore';
import { calculateScore } from '@/lib/tileUtils';

/** 내 타일 영역. 보유 타일 표시 및 선택/드래그 재정렬 지원 */
function TileRack() {
  const myTiles = useGameStore((state) => state.myTiles);
  const selectedTileIds = useGameStore((state) => state.selectedTileIds);
  const toggleTileSelection = useGameStore((state) => state.toggleTileSelection);
  const isMyTurn = useGameStore((state) => state.isMyTurn);
  const reorderMyTiles = useGameStore((state) => state.reorderMyTiles);

  const [activeTileId, setActiveTileId] = useState<string | null>(null);
  const tileIds = myTiles.map((t) => t.id);
  const score = useMemo(() => calculateScore(myTiles), [myTiles]);
  const activeTile = activeTileId ? myTiles.find((t) => t.id === activeTileId) : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTileId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTileId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = myTiles.findIndex((t) => t.id === active.id);
    const newIndex = myTiles.findIndex((t) => t.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderMyTiles(oldIndex, newIndex);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-zinc-500">
          <span>내 타일 ({myTiles.length})</span>
          <span className="text-zinc-300">|</span>
          <span>{score}점</span>
          {selectedTileIds.length > 0 && <span className="text-emerald-600">{selectedTileIds.length}개 선택됨</span>}
        </div>
        <SortableContext items={tileIds} strategy={rectSortingStrategy}>
          <div className="flex flex-wrap gap-1">
            {myTiles.map((tile) => (
              <SortableTile
                key={tile.id}
                tile={tile}
                isSelected={selectedTileIds.includes(tile.id)}
                onSelect={() => toggleTileSelection(tile.id)}
                disabled={!isMyTurn}
              />
            ))}
          </div>
        </SortableContext>
      </div>
      <DragOverlay style={{ zIndex: 50 }}>
        {activeTile ? <TileComponent tile={activeTile} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default TileRack;
