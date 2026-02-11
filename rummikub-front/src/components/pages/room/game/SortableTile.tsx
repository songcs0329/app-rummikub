import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TileComponent from './TileComponent';
import type { Tile } from '@/types/server.generated';

type SortableTileProps = {
  tile: Tile;
  isSelected: boolean;
  onSelect: () => void;
  disabled: boolean;
};

/** @dnd-kit/sortable 래퍼. 탭 → 선택, 드래그 → 정렬 분리 */
function SortableTile({ tile, isSelected, onSelect, disabled }: SortableTileProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: tile.id,
    disabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => {
        if (!isDragging && !disabled) {
          onSelect();
        }
      }}
      className="cursor-pointer"
    >
      <TileComponent tile={tile} isSelected={isSelected} isDragging={isDragging} />
    </div>
  );
}

export default SortableTile;
