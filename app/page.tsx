'use client';

import GameStats from './components/GameStats';
import GameStatus from './components/GameStatus';
import BettingSection from './components/BettingSection';
import GameCanvas from './components/GameCanvas';
import GameControls from './components/GameControls';
import { useGame } from './hooks/useGame';

export default function Home() {
  const { gameData, setBet, startGame, handleGameResult } = useGame();

  const canPlay = gameData.gameState === 'betting' && gameData.selectedBet > 0 && gameData.balance >= gameData.selectedBet;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
    
          {/* Left Sidebar - Betting Controls */}
          <div className="lg:w-1/4 mt-4" >

            <BettingSection
              onSelectBet={setBet}
              selectedBet={gameData.selectedBet}
              balance={gameData.balance}
              gameState={gameData.gameState}
            />
            
            <GameStats
              balance={gameData.balance}
              currentBet={gameData.selectedBet}
              totalWon={gameData.totalWon}
            />
            
            <GameControls
              onPlay={startGame}
              onReset={() => { /* TODO: implement reset logic */ }}
              canPlay={canPlay}
              gameState={gameData.gameState}
              balance={gameData.balance}
              currentBet={gameData.selectedBet}
            />
          </div>
          
          {/* Right Side - Game Canvas */}
          <div className="lg:w-3/4">
            <GameStatus
              status={gameData.status}
              countdown={gameData.countdown}
            />
            
            <GameCanvas
              gameState={{ state: gameData.gameState }}
              selectedBet={gameData.selectedBet}
              onGameResult={handleGameResult}
            />
          </div>
        </div>
      </div>
    </div>
  );
}