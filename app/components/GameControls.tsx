'use client';

interface GameControlsProps {
  onPlay: () => void;
  onReset: () => void;
  canPlay: boolean;
  gameState: string;
  balance: number;
  currentBet: number;
}

export default function GameControls({ 
  onPlay, 
  onReset, 
  canPlay, 
  gameState, 
  balance, 
  currentBet 
}: GameControlsProps) {
  
  const getPlayButtonText = () => {
    if (gameState === 'playing') return 'Playing...';
    if (gameState === 'result') return 'Game Over';
    if (currentBet === 0) return 'Place Bet First';
    if (balance < currentBet) return 'Insufficient Balance';
    return 'Play';
  };

  const getPlayButtonStyle = () => {
    if (!canPlay) return 'bg-gray-600 cursor-not-allowed';
    if (gameState === 'playing') return 'bg-yellow-600 hover:bg-yellow-700';
    return 'bg-blue-600 hover:bg-blue-700';
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 mt-4">
      <div className="flex gap-2">
        <button
          onClick={onPlay}
          disabled={!canPlay}
          className={`flex-1 ${getPlayButtonStyle()} text-white py-2 px-4 rounded-lg font-medium transition-colors`}
        >
          {getPlayButtonText()}
        </button>
        <button
          onClick={onReset}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
          Reset
        </button>
      </div>
      
      {/* Balance warning */}
      {balance < currentBet && currentBet > 0 && (
        <div className="mt-2 text-red-400 text-sm text-center">
          Not enough balance for this bet
        </div>
      )}
    </div>
  );
}