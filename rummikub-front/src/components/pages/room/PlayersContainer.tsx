import PlayerCard from './PlayerCard';
import type { PlayerPublicInfo } from '@/types/server.generated';

type PlayersContainerProps = {
  players: PlayerPublicInfo[];
};

function PlayersContainer(props: PlayersContainerProps) {
  const { players } = props;

  if (players.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      {players.map((player) => {
        return <PlayerCard key={player.id} player={player} />;
      })}
    </div>
  );
}

export default PlayersContainer;
