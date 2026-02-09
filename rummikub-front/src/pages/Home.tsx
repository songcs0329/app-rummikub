import useCounterStore from '@/stores/useCounterStore';
import Button from '@/components/Button';

function Home() {
  const count = useCounterStore((state) => state.count);
  const increment = useCounterStore((state) => state.increment);
  const decrement = useCounterStore((state) => state.decrement);

  return (
    <div className="flex w-full h-screen items-center justify-center overflow-hidden">
      <div className="flex items-center justify-center gap-2.5">
        <Button variant="minus" onClick={decrement}>
          -
        </Button>
        <strong className="leading-none font-bold text-2xl text-gray-800">{count}</strong>
        <Button variant="plus" onClick={increment}>
          +
        </Button>
      </div>
    </div>
  );
}

export default Home;
