import { Fragment, useMemo } from 'react';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { ArrowUpDown } from 'lucide-react';
import SortableTile from './SortableTile';
import { useGameStore } from '@/store/useGameStore';
import { calculateScore } from '@/lib/tileUtils';

/** 내 타일 영역. 보유 타일 표시 및 선택/정렬 지원 */
function TileRack() {
  const myTiles = useGameStore((state) => state.myTiles);
  const selectedTileIds = useGameStore((state) => state.selectedTileIds);
  const toggleTileSelection = useGameStore((state) => state.toggleTileSelection);
  const isMyTurn = useGameStore((state) => state.isMyTurn);
  const sortMyTiles = useGameStore((state) => state.sortMyTiles);
  const tileSortResult = useGameStore((state) => state.tileSortResult);

  const tileIds = myTiles.map((t) => t.id);
  const score = useMemo(() => calculateScore(myTiles), [myTiles]);
  const setEndIndices = tileSortResult?.setEndIndices ?? [];

  return (
    <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium text-zinc-500">
        <span>내 타일 ({myTiles.length})</span>
        <span className="text-zinc-300">|</span>
        <span>{score}점</span>
        {selectedTileIds.length > 0 && <span className="text-emerald-600">{selectedTileIds.length}개 선택됨</span>}
        <button
          onClick={sortMyTiles}
          className="ml-auto flex items-center gap-1 rounded-md px-2 py-0.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600"
          title="타일 자동 정렬"
        >
          <ArrowUpDown className="size-3" />
          정렬
        </button>
      </div>
      <SortableContext items={tileIds} strategy={rectSortingStrategy}>
        <div className="flex flex-wrap gap-1">
          {myTiles.map((tile, index) => (
            <Fragment key={tile.id}>
              <SortableTile
                tile={tile}
                isSelected={selectedTileIds.includes(tile.id)}
                onSelect={() => toggleTileSelection(tile.id)}
                disabled={!isMyTurn}
              />
              {setEndIndices.includes(index) && index < myTiles.length - 1 && (
                <div className="mx-0.5 w-px self-stretch bg-zinc-300" />
              )}
            </Fragment>
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export default TileRack;
