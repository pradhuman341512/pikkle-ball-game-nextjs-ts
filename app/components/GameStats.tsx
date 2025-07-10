'use client';

interface GameStatsProps {
  balance: number;
  currentBet: number;
  totalWon: number;
}

export default function GameStats({ balance, currentBet, totalWon }: GameStatsProps) {
  return (
    <div className="stats">
      <div className="stat-item">💰 Balance: ${balance}</div>
      <div className="stat-item">🎯 Current Bet: ${currentBet}</div>
      <div className="stat-item">🏆 Total Won: ${totalWon}</div>
    </div>
  );
}