import TileComponent from './TileComponent';
import { useGameStore } from '@/store/useGameStore';

/** 선택된 타일 조합 미리보기. 대시선 테두리로 배치 전 조합 확인 */
function StagingArea() {
  const myTiles = useGameStore((state) => state.myTiles);
  const selectedTileIds = useGameStore((state) => state.selectedTileIds);
  const clearSelection = useGameStore((state) => state.clearSelection);

  const selectedTiles = myTiles.filter((t) => selectedTileIds.includes(t.id));

  if (selectedTiles.length === 0) return null;

  return (
    <div className="rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50/50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-emerald-600">놓을 조합 미리보기</span>
        <button onClick={clearSelection} className="text-xs text-zinc-400 hover:text-zinc-600">
          선택 해제
        </button>
      </div>
      <div className="flex gap-0.5">
        {selectedTiles.map((tile) => (
          <TileComponent key={tile.id} tile={tile} size="sm" />
        ))}
      </div>
    </div>
  );
}

export default StagingArea;
