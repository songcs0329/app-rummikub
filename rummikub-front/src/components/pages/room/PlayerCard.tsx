import type { PlayerPublicInfo } from '@/types/server.generated';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type PlayerCardProps = {
  player: PlayerPublicInfo;
};

function PlayerCard(props: PlayerCardProps) {
  const { player } = props;

  return (
    <Card className="py-4">
      <CardHeader className="px-2">
        <CardTitle className="text-sm">{player.nickname}</CardTitle>
        <div className="flex items-center gap-1">
          {player.isHost && <Badge variant="default">방장</Badge>}
          <Badge variant={player.isReady ? 'secondary' : 'outline'}>{player.isReady ? '준비완료' : '대기중'}</Badge>
        </div>
      </CardHeader>
      {player.tileCount > 0 && (
        <CardContent>
          <p className="text-sm text-muted-foreground">타일: {player.tileCount}개</p>
        </CardContent>
      )}
    </Card>
  );
}

export default PlayerCard;
