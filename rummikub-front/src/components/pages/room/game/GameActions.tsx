import { Plus, SkipForward, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/useGameStore';
import { useSocketStore } from '@/store/useSocketStore';
import { useCustomerStore } from '@/store/useCustomerStore';
import { CombinationType, GAME_CONSTANTS } from '@/types/server.generated';

/** 게임 액션 버튼. 타일 뽑기, 조합 놓기, 턴 종료 */
function GameActions() {
  const socket = useSocketStore((state) => state.socket);
  const customer = useCustomerStore((state) => state.customer);
  const isMyTurn = useGameStore((state) => state.isMyTurn);
  const gameState = useGameStore((state) => state.gameState);
  const myTiles = useGameStore((state) => state.myTiles);
  const selectedTileIds = useGameStore((state) => state.selectedTileIds);
  const clearSelection = useGameStore((state) => state.clearSelection);
  const errorMessage = useGameStore((state) => state.errorMessage);

  if (!customer || !gameState) return null;

  const isGameOver = gameState.gameOver;
  const hasSelection = selectedTileIds.length >= GAME_CONSTANTS.MIN_COMBINATION_SIZE;

  const handlePlaceCombination = () => {
    if (!socket || !hasSelection) return;

    const selectedTiles = myTiles.filter((t) => selectedTileIds.includes(t.id));

    socket.emit('placeCombination', {
      roomCode: customer.roomCode,
      combination: {
        tiles: selectedTiles,
        type: CombinationType.RUN,
      },
    });
  };

  const handleDrawTile = () => {
    if (!socket) return;
    clearSelection();
    socket.emit('drawTile', { roomCode: customer.roomCode });
  };

  const handleEndTurn = () => {
    if (!socket) return;
    clearSelection();
    socket.emit('endTurn', { roomCode: customer.roomCode });
  };

  return (
    <div className="flex flex-col gap-2">
      {errorMessage && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{errorMessage}</div>}
      <Button size="lg" onClick={handlePlaceCombination} disabled={!isMyTurn || isGameOver || !hasSelection}>
        <CheckCircle className="size-4" />
        조합 놓기 ({selectedTileIds.length})
      </Button>
      <div className="flex gap-2">
        <Button
          size="lg"
          variant="outline"
          className="flex-1"
          onClick={handleDrawTile}
          disabled={!isMyTurn || isGameOver || gameState.deckCount === 0}
        >
          <Plus className="size-4" />
          타일 뽑기{gameState.deckCount === 0 ? ' (더미 소진)' : ''}
        </Button>
        <Button size="lg" className="flex-1" onClick={handleEndTurn} disabled={!isMyTurn || isGameOver}>
          <SkipForward className="size-4" />턴 종료
        </Button>
      </div>
    </div>
  );
}

export default GameActions;
