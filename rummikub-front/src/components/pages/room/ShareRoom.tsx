import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getRoomShareUrl } from '@/lib/utils';

interface ShareRoomProps {
  roomCode: string;
}

export default function ShareRoom({ roomCode }: ShareRoomProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = getRoomShareUrl(roomCode);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (error) {
      console.error('클립보드 복사 실패:', error);
    }
  };

  return (
    <Card className="rounded-lg border-0 shadow-none sm:border sm:shadow-sm py-4 gap-4">
      <CardHeader className="gap-0">
        <CardTitle className="text-sm">방 공유하기</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <Input value={shareUrl} readOnly className="flex-1" />
          <Button onClick={handleCopy} variant="outline" size="lg">
            {copied ? '복사됨' : '복사'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
