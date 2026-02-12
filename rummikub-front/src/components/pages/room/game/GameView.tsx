import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { Trophy } from 'lucide-react';
import GameHeader from './GameHeader';
import GameBoard from './GameBoard';
import PlayerInfoBar from './PlayerInfoBar';
import TileRack from './TileRack';
import StagingArea from './StagingArea';
import GameActions from './GameActions';
import TileComponent from './TileComponent';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { useGameStore } from '@/store/useGameStore';
import { useGameEvents } from '@/hooks/useGameEvents';
import { Button } from '@/components/ui/button';

/** 게임 화면 최상위 레이아웃. 게임 오버 시 결과 화면, 진행 중에는 게임 UI 컴포넌트 조합 */
function GameView() {
  useGameEvents();

  const navigate = useNavigate();
  const gameState = useGameStore((state) => state.gameState);
  const myTiles = useGameStore((state) => state.myTiles);
  const reorderMyTiles = useGameStore((state) => state.reorderMyTiles);
  const resetGame = useGameStore((state) => state.reset);

  const [activeTileId, setActiveTileId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTileId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTileId(null);

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = myTiles.findIndex((t) => t.id === active.id);
    const newIndex = myTiles.findIndex((t) => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderMyTiles(oldIndex, newIndex);
    }
  };

  const activeTile = activeTileId ? myTiles.find((t) => t.id === activeTileId) : null;

  const handleGoHome = () => {
    resetGame();
    navigate('/');
  };

  if (!gameState) return null;

  if (gameState.gameOver && gameState.winner) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <Trophy className="size-16 text-yellow-500" />
        <div className="text-center">
          <h2 className="text-2xl font-bold">{gameState.winner.nickname} 승리!</h2>
        </div>
        <div className="flex flex-col gap-3">
          {gameState.players
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

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-1 flex-col gap-3">
        <div className="sticky top-0 flex flex-col gap-4">
          <GameHeader />
          <PlayerInfoBar />
        </div>

        <GameBoard />

        <div className="sticky bottom-0 flex flex-col gap-4">
          <StagingArea />
          <TileRack />
          <GameActions />
        </div>
      </div>
      <DragOverlay>{activeTile ? <TileComponent tile={activeTile} isDragging /> : null}</DragOverlay>
    </DndContext>
  );
}

export default GameView;
