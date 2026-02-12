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
        {players
          .sort((a, b) => a.score - b.score)
          .map((player, index) => (
            <div key={player.id} className="flex items-center gap-3 text-sm">
              <span className="w-6 text-center font-bold text-zinc-400">{index + 1}</span>
              <span className="font-medium">{player.nickname}</span>
              <span className="text-zinc-500">{player.score}점</span>
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
