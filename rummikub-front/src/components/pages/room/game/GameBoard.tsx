import TileComponent from './TileComponent';
import { useGameStore } from '@/store/useGameStore';

/** 게임 보드. 보드 위에 놓인 조합(Combination) 목록 표시 */
function GameBoard() {
  const gameState = useGameStore((state) => state.gameState);
  const isMyTurn = useGameStore((state) => state.isMyTurn);
  const selectedBoardTileIds = useGameStore((state) => state.selectedBoardTileIds);
  const stagedCombinations = useGameStore((state) => state.stagedCombinations);
  const toggleBoardTileSelection = useGameStore((state) => state.toggleBoardTileSelection);

  if (!gameState) return null;

  // 첫 공개 완료 후에만 보드 조작 가능 (RULES.md: 첫 공개 전에는 기존 조합 조작 불가)
  const myPlayer = gameState.players.find((p) => p.id === gameState.currentPlayerId);
  const canManipulateBoard = isMyTurn && (myPlayer?.hasInitialMeld ?? false);

  // 이미 스테이징된 보드 타일 ID Set
  const boardTileIdSet = new Set(gameState.board.flatMap((combo) => combo.tiles.map((t) => t.id)));
  const stagedBoardTileIds = new Set(
    stagedCombinations.flatMap((combo) => combo.map((t) => t.id)).filter((id) => boardTileIdSet.has(id)),
  );

  const handleBoardTileClick = (tileId: string) => {
    if (!canManipulateBoard) return;
    if (stagedBoardTileIds.has(tileId)) return;
    toggleBoardTileSelection(tileId);
  };

  return (
    <div className="flex-1 overflow-y-auto rounded-lg border border-zinc-200 bg-emerald-50 p-4">
      {canManipulateBoard && (
        <p className="mb-2 text-xs text-emerald-600">보드 타일을 클릭하여 조합 재배열 가능 (첫 공개 완료)</p>
      )}
      {gameState.board.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-zinc-400">
          아직 보드에 놓인 조합이 없습니다
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {gameState.board.map((combination, index) => {
            return (
              <div key={index} className="flex gap-0.5 rounded-md bg-white/80 p-1.5 shadow-sm flex-wrap">
                {combination.tiles
                  .sort((a, b) => a.number - b.number)
                  .map((tile) => {
                    const isSelected = selectedBoardTileIds.includes(tile.id);
                    const isStaged = stagedBoardTileIds.has(tile.id);
                    return (
                      <div
                        key={tile.id}
                        onClick={() => handleBoardTileClick(tile.id)}
                        className={[
                          canManipulateBoard && !isStaged ? 'cursor-pointer' : '',
                          isSelected ? 'rounded ring-2 ring-blue-400' : '',
                          isStaged ? 'opacity-30' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <TileComponent tile={tile} size="sm" />
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default GameBoard;
