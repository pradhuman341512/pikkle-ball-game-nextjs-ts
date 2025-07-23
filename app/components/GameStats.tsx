'use client';

interface GameStatsProps {
  balance: number;
  currentBet: number;
  totalWon: number;
  gameState?: string;
}
    
export default function GameStats({ balance, currentBet, totalWon, gameState }: GameStatsProps) {
  // Ensure all values are valid numbers
  const safeBalance = isNaN(balance) ? 0 : balance;
  const safeBet = isNaN(currentBet) ? 0 : currentBet;
  const safeTotalWon = isNaN(totalWon) ? 0 : totalWon;

  return (
    <div className="bg-gray-800 rounded-lg p-4 mt-4">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Balance:</span>
          <span className={`font-medium ${safeBalance < 0 ? 'text-red-500' : 'text-white'}`}>
            ${safeBalance.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Current Bet:</span>
          <span className="text-white font-medium">${safeBet.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Total Won:</span>
          <span className="text-green-500 font-medium">${safeTotalWon.toFixed(2)}</span>
        </div>
        {gameState && (
          <div className="flex justify-between items-center border-t border-gray-700 pt-3">
            <span className="text-gray-300">Status:</span>
            <span className="text-blue-400 font-medium text-sm">{gameState}</span>
          </div>
        )}
      </div>
    </div>
  );
}