import TileComponent from './TileComponent';
import { useGameStore } from '@/store/useGameStore';

/** 게임 보드. 보드 위에 놓인 조합(Combination) 목록 표시 */
function GameBoard() {
  const gameState = useGameStore((state) => state.gameState);

  if (!gameState) return null;

  return (
    <div className="flex-1 overflow-y-auto rounded-lg border border-zinc-200 bg-emerald-50 p-4">
      {gameState.board.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-zinc-400">
          아직 보드에 놓인 조합이 없습니다
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {gameState.board.map((combination) => (
            <div key={combination.id} className="flex gap-0.5 rounded-md bg-white/80 p-1.5 shadow-sm">
              {combination.tiles.map((tile) => (
                <TileComponent key={tile.id} tile={tile} size="sm" />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GameBoard;
