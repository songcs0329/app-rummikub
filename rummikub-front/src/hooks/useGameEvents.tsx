import { useEffect } from 'react';
import type {
  TileDrawnPayload,
  BoardUpdatedPayload,
  MyTilesUpdatedPayload,
  TurnChangedPayload,
  YourTurnPayload,
  DeckUpdatedPayload,
  GameOverPayload,
  ErrorPayload,
} from '@/types/server.generated';
import { useSocketStore } from '@/store/useSocketStore';
import { useGameStore } from '@/store/useGameStore';

export function useGameEvents() {
  const socket = useSocketStore((state) => state.socket);
  const isConnected = useSocketStore((state) => state.isConnected);

  const gameState = useGameStore((state) => state.gameState);
  const setGameState = useGameStore((state) => state.setGameState);
  const setMyTiles = useGameStore((state) => state.setMyTiles);
  const setIsMyTurn = useGameStore((state) => state.setIsMyTurn);
  const setDeckCount = useGameStore((state) => state.setDeckCount);
  const setGameOver = useGameStore((state) => state.setGameOver);
  const setErrorMessage = useGameStore((state) => state.setErrorMessage);
  const clearAllStaged = useGameStore((state) => state.clearAllStaged);

  useEffect(() => {
    if (!socket || !isConnected || !gameState) return;

    // 타일 뽑기 결과: 내 타일 목록 + 덱 잔여 수 갱신
    const handleTileDrawn = (data: TileDrawnPayload) => {
      setMyTiles(data.myTiles);
      setDeckCount(data.deckCount);
    };

    // 보드 변경: 다른 플레이어가 조합을 놓았을 때 게임 상태 갱신
    const handleBoardUpdated = (data: BoardUpdatedPayload) => {
      setGameState(data.gameState);
    };

    // 내 타일 갱신: 조합 배치 후 서버에서 보내는 업데이트된 타일 목록
    const handleMyTilesUpdated = (data: MyTilesUpdatedPayload) => {
      clearAllStaged();
      setMyTiles(data.tiles);
    };

    // 턴 변경: 다음 플레이어로 턴이 넘어갔을 때 게임 상태 갱신 및 내 턴 해제
    const handleTurnChanged = (data: TurnChangedPayload) => {
      setGameState(data.gameState);
      setIsMyTurn(false);
    };

    // 내 턴 시작: 서버에서 내 턴임을 알림
    const handleYourTurn = (data: YourTurnPayload) => {
      setIsMyTurn(data.isMyTurn);
    };

    // 덱 갱신: 덱 잔여 타일 수 갱신
    const handleDeckUpdated = (data: DeckUpdatedPayload) => {
      setDeckCount(data.deckCount);
    };

    // 게임 종료: 승자 및 최종 게임 상태 설정
    const handleGameOver = (data: GameOverPayload) => {
      setGameOver(data);
    };

    // 서버 에러: 유효하지 않은 조합, 첫 멜드 미달 등 검증 실패 메시지
    const handleError = (data: ErrorPayload) => {
      setErrorMessage(data.message);
      setTimeout(() => setErrorMessage(null), 4000);
    };

    socket.on('tileDrawn', handleTileDrawn);
    socket.on('boardUpdated', handleBoardUpdated);
    socket.on('myTilesUpdated', handleMyTilesUpdated);
    socket.on('turnChanged', handleTurnChanged);
    socket.on('yourTurn', handleYourTurn);
    socket.on('deckUpdated', handleDeckUpdated);
    socket.on('gameOver', handleGameOver);
    socket.on('error', handleError);

    return () => {
      socket.off('tileDrawn', handleTileDrawn);
      socket.off('boardUpdated', handleBoardUpdated);
      socket.off('myTilesUpdated', handleMyTilesUpdated);
      socket.off('turnChanged', handleTurnChanged);
      socket.off('yourTurn', handleYourTurn);
      socket.off('deckUpdated', handleDeckUpdated);
      socket.off('gameOver', handleGameOver);
      socket.off('error', handleError);
    };
  }, [
    socket,
    isConnected,
    gameState,
    setGameState,
    setMyTiles,
    setIsMyTurn,
    setDeckCount,
    setGameOver,
    setErrorMessage,
    clearAllStaged,
  ]);
}
