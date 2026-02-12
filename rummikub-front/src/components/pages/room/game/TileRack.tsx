import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import SortableTile from './SortableTile';
import { useGameStore } from '@/store/useGameStore';

/** 내 타일 영역. 보유 타일 표시 및 선택/정렬 지원 */
function TileRack() {
  const myTiles = useGameStore((state) => state.myTiles);
  const selectedTileIds = useGameStore((state) => state.selectedTileIds);
  const toggleTileSelection = useGameStore((state) => state.toggleTileSelection);
  const isMyTurn = useGameStore((state) => state.isMyTurn);

  const tileIds = myTiles.map((t) => t.id);

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
      <div className="mb-2 text-xs font-medium text-zinc-500">
        내 타일 ({myTiles.length})
        {selectedTileIds.length > 0 && <span className="ml-2 text-emerald-600">{selectedTileIds.length}개 선택됨</span>}
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
  );
}

export default TileRack;
