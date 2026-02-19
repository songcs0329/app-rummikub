import { useNavigate } from 'react-router';
import { Trophy } from 'lucide-react';
import type { PlayerPublicInfo } from '@/types/server.generated';
import { Button } from '@/components/ui/button';
import { useGameStore } from '@/store/useGameStore';

type GameResultProps = {
  winner: PlayerPublicInfo;
  players: PlayerPublicInfo[];
};

function GameResult(props: GameResultProps) {
  const { winner, players } = props;
  const navigate = useNavigate();

  const resetGame = useGameStore((state) => state.reset);

  const handleGoHome = () => {
    resetGame();
    navigate('/');
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <Trophy className="size-16 text-yellow-500" />
      <div className="text-center">
        <h2 className="text-2xl font-bold">{winner.nickname} 승리!</h2>
      </div>
      <div className="flex flex-col gap-3">
        {/* RULES.md: 승자는 양수(+), 패자는 음수(-) → 높을수록 좋음 (내림차순 정렬) */}
        {[...players]
          .sort((a, b) => b.score - a.score)
          .map((player, index) => (
            <div key={player.id} className="flex items-center gap-3 text-sm">
              <span className="w-6 text-center font-bold text-zinc-400">{index + 1}</span>
              <span className="font-medium">{player.nickname}</span>
              <span className={player.score >= 0 ? 'font-semibold text-emerald-600' : 'font-semibold text-red-500'}>
                {player.score > 0 ? `+${player.score}` : player.score}점
              </span>
            </div>
          ))}
      </div>
      <Button size="lg" onClick={handleGoHome}>
        메인으로
      </Button>
    </div>
  );
}

export default GameResult;
