import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 text-white">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-lg text-white/80">페이지를 찾을 수 없습니다</p>
      <Button variant="secondary" onClick={() => navigate('/')}>
        홈으로
      </Button>
    </div>
  );
}

export default NotFound;
