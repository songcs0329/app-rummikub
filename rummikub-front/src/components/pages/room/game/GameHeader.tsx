import { Layers, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useGameStore } from '@/store/useGameStore';

/** 게임 상태 헤더. 현재 턴 표시(내 턴/상대 턴)와 덱 잔여 타일 수 */
function GameHeader() {
  const gameState = useGameStore((state) => state.gameState);
  const isMyTurn = useGameStore((state) => state.isMyTurn);

  if (!gameState) return null;

  const currentPlayer = gameState.players.find((p) => p.id === gameState.currentPlayerId);

  return (
    <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-3">
      <div className="flex items-center gap-2">
        <User className="size-4 text-zinc-500" />
        {isMyTurn ? (
          <Badge className="bg-emerald-100 text-emerald-700">내 턴</Badge>
        ) : (
          <Badge variant="outline" className="text-zinc-500">
            {currentPlayer?.nickname ?? '대기중'}의 턴
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Layers className="size-4 text-zinc-500" />
        <span className="text-sm text-zinc-600">남은 타일: {gameState.deckCount}</span>
      </div>
    </div>
  );
}

export default GameHeader;
