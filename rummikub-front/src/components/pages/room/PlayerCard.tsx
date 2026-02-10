import { Crown, Star, CircleCheck, CircleDashed } from 'lucide-react';
import type { PlayerPublicInfo } from '@/types/server.generated';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCustomerStore } from '@/store/useCustomerStore';

type PlayerCardProps = {
  player: PlayerPublicInfo;
};

function PlayerCard(props: PlayerCardProps) {
  const { player } = props;
  const customer = useCustomerStore((state) => state.customer);
  const isCurrentUser = player.id === customer?.playerId;

  return (
    <Card className="py-4 rounded-lg">
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-1 text-sm">
          {player.nickname}
          {isCurrentUser && <Star className="size-4 text-yellow-400" fill="currentColor" />}
        </CardTitle>
        <div className="flex items-center gap-1.5">
          {player.isHost && (
            <Badge className="bg-amber-100 text-amber-700">
              <Crown className="size-3" fill="currentColor" />
              방장
            </Badge>
          )}
          {player.isReady ? (
            <Badge className="bg-emerald-100 text-emerald-700">
              <CircleCheck className="size-3" fill="currentColor" />
              준비완료
            </Badge>
          ) : (
            <Badge variant="outline" className="text-zinc-400">
              <CircleDashed className="size-3" />
              대기중
            </Badge>
          )}
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
