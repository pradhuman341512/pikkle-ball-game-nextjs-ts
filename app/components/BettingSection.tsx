'use client';

interface BettingSectionProps {
  onSelectBet: (amount: number) => void;
  selectedBet: number;
  balance: number;
  gameState: string;
}

export default function BettingSection({ onSelectBet, selectedBet, balance, gameState }: BettingSectionProps) {
  const betAmounts = [10, 25, 50, 100, 250,500, 1000, 2500, 5000, 10000, 25000, 50000];

  return (
    <div className="betting-section">
      <h3>💸 Place Your Bet</h3>
      <div className="bet-buttons">
        {betAmounts.map((amount) => (
          <button
            key={amount}
            className={`bet-btn ${selectedBet === amount ? 'selected' : ''}`}
            onClick={() => onSelectBet(amount)}
            disabled={gameState !== 'betting' || balance < amount}
          >
            ${amount}
          </button>
        ))}
      </div>
    </div>
  );
}