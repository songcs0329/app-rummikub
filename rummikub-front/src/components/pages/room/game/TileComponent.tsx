import type { Tile, TileColor } from '@/types/server.generated';

const TILE_BG_MAP: Record<TileColor, string> = {
  red: 'bg-red-600',
  blue: 'bg-blue-600',
  yellow: 'bg-yellow-500',
  black: 'bg-zinc-900',
};

type TileComponentProps = {
  tile: Tile;
  size?: 'sm' | 'md';
  isSelected?: boolean;
  isDragging?: boolean;
};

/** 단일 타일 렌더링. 숫자·색상 표시, 조커 처리, 크기(sm/md) 지원 */
function TileComponent({ tile, size = 'sm', isSelected, isDragging }: TileComponentProps) {
  const sizeClass = size === 'sm' ? 'w-8 h-11 text-sm' : 'w-10 h-14 text-base';
  const selectedClass = isSelected ? 'ring-2 ring-blue-500 -translate-y-1' : '';
  const draggingClass = isDragging ? 'opacity-50' : '';

  if (tile.isJoker) {
    return (
      <div
        className={`${sizeClass} flex items-center justify-center rounded-md bg-purple-600 font-bold text-white shadow-sm select-none transition-transform ${selectedClass} ${draggingClass}`}
      >
        J
      </div>
    );
  }

  const bgClass = tile.color ? TILE_BG_MAP[tile.color] : 'bg-zinc-200';

  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-md ${bgClass} font-bold text-white shadow-sm select-none transition-transform ${selectedClass} ${draggingClass}`}
    >
      {tile.number}
    </div>
  );
}

export default TileComponent;
