import GameHeader from './GameHeader';
import GameBoard from './GameBoard';
import PlayerInfoBar from './PlayerInfoBar';
import TileRack from './TileRack';
import StagingArea from './StagingArea';
import GameActions from './GameActions';
import GameResult from './GameResult';
import { useGameStore } from '@/store/useGameStore';
import { useGameEvents } from '@/hooks/useGameEvents';

/** 게임 화면 최상위 레이아웃. 게임 오버 시 결과 화면, 진행 중에는 게임 UI 컴포넌트 조합 */
function GameView() {
  useGameEvents();

  const gameState = useGameStore((state) => state.gameState);

  if (!gameState) return null;

  if (gameState.gameOver && gameState.winner) {
    return <GameResult winner={gameState.winner} players={gameState.players} />;
  }

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div className="sticky top-0 flex flex-col gap-4">
        <GameHeader />
        <PlayerInfoBar />
      </div>

      <GameBoard />

      <div className="flex flex-col gap-4 sticky bottom-0">
        <TileRack />
        <StagingArea />
        <GameActions />
      </div>
    </div>
  );
}

export default GameView;
