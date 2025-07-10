'use client';

import GameStats from './components/GameStats';
import GameStatus from './components/GameStatus';
import BettingSection from './components/BettingSection';
import GameCanvas from './components/GameCanvas';
import GameControls from './components/GameControls';
import { useGame } from './hooks/useGame';

export default function Home() {
  const { gameData, selectBet, startGame, handleGameResult, resetGame } = useGame();

  const canPlay = gameData.gameState === 'betting' && gameData.selectedBet > 0 && gameData.balance >= gameData.selectedBet;

  return (
    <div className="container">
      <h1>🎯 Plinko Betting Game</h1>
      
      <GameStats
        balance={gameData.balance}
        currentBet={gameData.selectedBet}
        totalWon={gameData.totalWon}
      />
      
      <GameStatus
        status={gameData.status}
        countdown={gameData.countdown}
      />
      
      <BettingSection
        onSelectBet={selectBet}
        selectedBet={gameData.selectedBet}
        balance={gameData.balance}
        gameState={gameData.gameState}
      />
      
      <GameCanvas
        gameState={{ state: gameData.gameState }}
        selectedBet={gameData.selectedBet}
        onGameResult={handleGameResult}
      />
      
      <GameControls
        onPlay={startGame}
        onReset={resetGame}
        canPlay={canPlay}
      />
      
      <div className="physics-info">
        <h3>🔧 Game Features:</h3>
        <p><strong>Betting System:</strong> Select bet amount, then watch the suspenseful drop</p>
        <p><strong>Realistic Physics:</strong> Gravity, bounce, friction, and randomization</p>
        <p><strong>Multipliers:</strong> Higher center slots give bigger payouts</p>
        <p><strong>Smooth Animation:</strong> Ball trails and glowing effects</p>
      </div>
    </div>
  );
}