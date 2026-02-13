import { Crown, Layers } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';
import { useCustomerStore } from '@/store/useCustomerStore';

/** 플레이어 정보 바. 참여 중인 플레이어 목록과 턴 하이라이트 */
function PlayerInfoBar() {
  const gameState = useGameStore((state) => state.gameState);
  const customer = useCustomerStore((state) => state.customer);

  if (!gameState) return null;

  return (
    <div className="flex gap-2 overflow-x-auto">
      {gameState.players.map((player) => {
        const isMe = player.id === customer?.playerId;
        const isTurn = player.id === gameState.currentPlayerId;

        return (
          <div
            key={player.id}
            className={`flex min-w-0 shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm border ${
              isTurn ? 'bg-emerald-100 border-emerald-400' : 'bg-zinc-50'
            }`}
          >
            <span className={`truncate font-medium ${isMe ? 'text-blue-600' : 'text-zinc-700'}`}>
              {player.nickname}
              {isMe && ' (나)'}
            </span>
            {player.isHost && <Crown className="size-3 shrink-0 text-amber-500" fill="currentColor" />}
            <div className="flex items-center gap-1 text-zinc-400">
              <Layers className="size-3" />
              <span>{player.tileCount}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default PlayerInfoBar;
