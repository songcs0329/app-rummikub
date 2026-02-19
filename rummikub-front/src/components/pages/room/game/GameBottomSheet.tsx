import { Sheet, type SheetRef } from 'react-modal-sheet';
import { useRef, useCallback, type ReactNode } from 'react';

const SNAP_POINTS = [0, 150, 1];
const INITIAL_SNAP = 1;

interface GameBottomSheetProps {
  children: ReactNode;
}

/** 게임 하단 바텀시트. 드래그로 확장/축소 가능한 시트 */
function GameBottomSheet({ children }: GameBottomSheetProps) {
  const sheetRef = useRef<SheetRef>(null);

  const handleClose = useCallback(() => {
    sheetRef.current?.snapTo(INITIAL_SNAP);
  }, []);

  return (
    <Sheet
      ref={sheetRef}
      isOpen
      onClose={handleClose}
      snapPoints={SNAP_POINTS}
      initialSnap={INITIAL_SNAP}
      detent="content"
      disableDismiss
      disableScrollLocking
      style={{ zIndex: 40 }}
      className="max-w-105 mx-auto"
    >
      <Sheet.Container className="shadow-[0_-2px_10px_rgba(0,0,0,0.08)]!">
        <Sheet.Header />
        <Sheet.Content disableDrag>{children}</Sheet.Content>
      </Sheet.Container>
    </Sheet>
  );
}

export default GameBottomSheet;
