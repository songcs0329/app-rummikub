import type { Tile, TileColor } from '@/types/server.generated';

const TILE_COLOR_MAP: Record<TileColor, string> = {
  red: 'text-red-600',
  blue: 'text-blue-600',
  yellow: 'text-yellow-500',
  black: 'text-zinc-900',
};

const TILE_BG_MAP: Record<TileColor, string> = {
  red: 'border-red-200',
  blue: 'border-blue-200',
  yellow: 'border-yellow-200',
  black: 'border-zinc-300',
};

type TileComponentProps = {
  tile: Tile;
  size?: 'sm' | 'md';
  isSelected?: boolean;
  isDragging?: boolean;
};

/** 단일 타일 렌더링. 숫자·색상 표시, 조커 처리, 크기(sm/md) 지원 */
function TileComponent({ tile, size = 'md', isSelected, isDragging }: TileComponentProps) {
  const sizeClass = size === 'sm' ? 'w-8 h-11 text-sm' : 'w-10 h-14 text-base';
  const selectedClass = isSelected ? 'ring-2 ring-blue-500 -translate-y-1' : '';
  const draggingClass = isDragging ? 'opacity-50' : '';

  if (tile.isJoker) {
    return (
      <div
        className={`${sizeClass} flex items-center justify-center rounded-md border-2 border-purple-300 bg-white font-bold text-purple-600 shadow-sm select-none transition-transform ${selectedClass} ${draggingClass}`}
      >
        J
      </div>
    );
  }

  const colorClass = tile.color ? TILE_COLOR_MAP[tile.color] : 'text-zinc-500';
  const borderClass = tile.color ? TILE_BG_MAP[tile.color] : 'border-zinc-200';

  return (
    <div
      className={`${sizeClass} flex items-center justify-center rounded-md border-2 ${borderClass} bg-white font-bold ${colorClass} shadow-sm select-none transition-transform ${selectedClass} ${draggingClass}`}
    >
      {tile.number}
    </div>
  );
}

export default TileComponent;
