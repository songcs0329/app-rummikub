import { Plus, SkipForward, PackagePlus, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/useGameStore';
import { useSocketStore } from '@/store/useSocketStore';
import { useCustomerStore } from '@/store/useCustomerStore';
import { GAME_CONSTANTS } from '@/types/server.generated';

/** 게임 액션 버튼. 타일 뽑기, 조합 추가, 모두 제출, 턴 종료 */
function GameActions() {
  const socket = useSocketStore((state) => state.socket);
  const customer = useCustomerStore((state) => state.customer);
  const isMyTurn = useGameStore((state) => state.isMyTurn);
  const gameState = useGameStore((state) => state.gameState);
  const selectedTileIds = useGameStore((state) => state.selectedTileIds);
  const selectedBoardTileIds = useGameStore((state) => state.selectedBoardTileIds);
  const stagedCombinations = useGameStore((state) => state.stagedCombinations);
  const clearSelection = useGameStore((state) => state.clearSelection);
  const clearBoardSelection = useGameStore((state) => state.clearBoardSelection);
  const stageCombination = useGameStore((state) => state.stageCombination);
  const errorMessage = useGameStore((state) => state.errorMessage);

  if (!customer || !gameState) return null;

  const isGameOver = gameState.gameOver;
  const totalSelected = selectedTileIds.length + selectedBoardTileIds.length;
  const hasSelection = totalSelected >= GAME_CONSTANTS.MIN_COMBINATION_SIZE;
  const hasStaged = stagedCombinations.length > 0;
  const hasBoardSelection = selectedBoardTileIds.length > 0;

  // 보드 조작 중(선택된 보드 타일 있음)이거나 조합 제출/드로우한 경우 타일 뽑기 불가
  const canDraw =
    isMyTurn &&
    !isGameOver &&
    !gameState.placedThisTurn &&
    !gameState.drewTileThisTurn &&
    !hasStaged &&
    !hasBoardSelection &&
    gameState.deckCount > 0;

  /** 선택된 타일(손패 + 보드)을 스테이징 영역에 조합으로 추가 (서버 미전송) */
  const handleStageCombination = () => {
    if (!hasSelection) return;
    stageCombination();
  };

  /**
   * 스테이징된 모든 조합을 보드 전체 상태로 서버에 제출 (submitBoardState)
   * RULES.md: 기존 조합 조작 포함, 조커 교체도 이 방식으로 처리
   */
  const handleSubmitAll = () => {
    if (!socket || !hasStaged) return;

    // 스테이징된 보드 타일 ID Set
    const boardTileIdSet = new Set(gameState.board.flatMap((combo) => combo.tiles.map((t) => t.id)));
    const stagedBoardTileIds = new Set(
      stagedCombinations.flatMap((tiles) => tiles.map((t) => t.id)).filter((id) => boardTileIdSet.has(id)),
    );

    // 원래 보드 조합에서 스테이징된 보드 타일을 제외한 나머지 유지
    const remainingBoardCombos = gameState.board
      .map((combo) => ({ tiles: combo.tiles.filter((t) => !stagedBoardTileIds.has(t.id)) }))
      .filter((combo) => combo.tiles.length > 0);

    // 새 보드 = 나머지 기존 조합 + 스테이징된 새 조합
    const newBoard = [
      ...remainingBoardCombos,
      ...stagedCombinations.map((tiles) => ({ tiles })),
    ];

    socket.emit('submitBoardState', {
      roomCode: customer.roomCode,
      combinations: newBoard,
    });
  };

  const handleDrawTile = () => {
    if (!socket) return;
    clearSelection();
    clearBoardSelection();
    socket.emit('drawTile', { roomCode: customer.roomCode });
  };

  const handleEndTurn = () => {
    if (!socket) return;
    clearSelection();
    clearBoardSelection();
    socket.emit('endTurn', { roomCode: customer.roomCode });
  };

  const drawTileLabel = () => {
    if (gameState.deckCount === 0) return '타일 뽑기 (더미 소진)';
    if (gameState.drewTileThisTurn) return '타일 뽑기 (이미 뽑음)';
    return '타일 뽑기';
  };

  return (
    <div className="flex flex-col gap-2">
      {errorMessage && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</div>}

      <div className="flex gap-2">
        {/* 선택한 타일(손패+보드)을 스테이징에 추가 */}
        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          onClick={handleStageCombination}
          disabled={!isMyTurn || isGameOver || !hasSelection}
        >
          <PackagePlus className="size-4" />
          조합 추가 ({totalSelected})
        </Button>

        {/* 스테이징된 조합 모두 제출 (submitBoardState) */}
        <Button size="lg" className="flex-1" onClick={handleSubmitAll} disabled={!isMyTurn || isGameOver || !hasStaged}>
          <Send className="size-4" />
          모두 제출 ({stagedCombinations.length})
        </Button>
      </div>

      <div className="flex gap-2">
        <Button size="lg" variant="outline" className="flex-1" onClick={handleDrawTile} disabled={!canDraw}>
          <Plus className="size-4" />
          {drawTileLabel()}
        </Button>
        <Button size="lg" className="flex-1" onClick={handleEndTurn} disabled={!isMyTurn || isGameOver}>
          <SkipForward className="size-4" />턴 종료
        </Button>
      </div>
    </div>
  );
}

export default GameActions;
