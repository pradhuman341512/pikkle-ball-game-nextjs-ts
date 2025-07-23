import { useState, useCallback } from 'react';

export type GameState = 'betting' | 'countdown' | 'playing' | 'result';
export type RiskLevel = 'Low' | 'Medium' | 'High';

export interface GameData {
  balance: number;
  selectedBet: number;
  totalWon: number;
  gameState: GameState;
  status: string;
  countdown: number;
  selectedRows: number;
  riskLevel: RiskLevel;
  isAutoMode: boolean;
}

export function useGame() {
  const [gameData, setGameData] = useState<GameData>({
    balance: 1000,
    selectedBet: 0,
    totalWon: 0,
    gameState: 'betting',
    status: 'Place your bet to start!',
    countdown: 0,
    selectedRows: 8,
    riskLevel: 'Low',
    isAutoMode: false,
  });

  const toggleMode = useCallback(() => {
    setGameData(prev => ({
      ...prev,
      isAutoMode: !prev.isAutoMode,
      status: !prev.isAutoMode ? 'Auto mode enabled' : 'Manual mode enabled'
    }));
  }, []);

  const setRiskLevel = useCallback((risk: RiskLevel) => {
    if (gameData.gameState !== 'betting') return;
    
    setGameData(prev => ({
      ...prev,
      riskLevel: risk,
      status: `${risk} risk selected`
    }));
  }, [gameData.gameState]);

  const setRows = useCallback((rows: number) => {
    if (gameData.gameState !== 'betting') return;
    
    setGameData(prev => ({
      ...prev,
      selectedRows: rows,
      status: `${rows} rows selected`
    }));
  }, [gameData.gameState]);

  const setBet = useCallback((amount: string | number) => {
    // Convert to number and validate
    const betAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    // Check for invalid number
    if (isNaN(betAmount) || betAmount < 0) {
      setGameData(prev => ({
        ...prev,
        selectedBet: 0,
        status: 'Invalid bet amount'
      }));
      return;
    }

    if (gameData.gameState !== 'betting' || gameData.balance < betAmount) {
      setGameData(prev => ({
        ...prev,
        status: betAmount > gameData.balance ? 'Insufficient balance' : 'Cannot place bet now'
      }));
      return;
    }

    setGameData(prev => ({
      ...prev,
      selectedBet: betAmount,
      status: `Bet set to $${betAmount.toFixed(2)}`
    }));
  }, [gameData.gameState, gameData.balance]);

  const startGame = useCallback(() => {
    if (gameData.gameState !== 'betting' || gameData.selectedBet === 0 || gameData.balance < gameData.selectedBet) {
      setGameData(prev => ({
        ...prev,
        status: 'Cannot start game - check bet amount and balance'
      }));
      return;
    }

    // Deduct bet amount from balance when game starts
    setGameData(prev => ({
      ...prev,
      balance: Number((prev.balance - prev.selectedBet).toFixed(2)),
      gameState: 'playing',
      status: 'Ball dropped! Good luck!'
    }));
  }, [gameData.gameState, gameData.selectedBet, gameData.balance]);

  const handleGameResult = useCallback((winnings: number, slotIndex: number, multiplier: number) => {
    console.log(`Ball landed in slot ${slotIndex + 1} with ${multiplier}x multiplier`);
    console.log(`Bet: ${gameData.selectedBet.toFixed(2)}, Winnings: ${winnings.toFixed(2)}`);
    
    setGameData(prev => {
      // The winnings already include the multiplied amount
      // Balance was already reduced when game started, so just add winnings
      const newBalance = Number((prev.balance + winnings).toFixed(2));
      
      // Calculate profit: winnings - original bet
      const profit = Number((winnings - prev.selectedBet).toFixed(2));
      
      // Only add to totalWon if there's actual profit
      const newTotalWon = profit > 0 ? Number((prev.totalWon + profit).toFixed(2)) : prev.totalWon;
      
      let status;
      if (winnings > prev.selectedBet) {
        status = `🎉 Won! Got ${winnings.toFixed(2)} (${multiplier}x) - Profit: ${profit.toFixed(2)}`;
      } else if (winnings === prev.selectedBet) {
        status = `⚖️ Break even! Got back your ${winnings.toFixed(2)} bet`;
      } else {
        status = `💸 Lost ${(prev.selectedBet - winnings).toFixed(2)}. Got back ${winnings.toFixed(2)}`;
      }

      // Log the calculation for verification
      console.log(`Original Balance: ${(prev.balance + prev.selectedBet).toFixed(2)}`);
      console.log(`Bet Deducted: ${prev.selectedBet.toFixed(2)}`);
      console.log(`Balance After Bet: ${prev.balance.toFixed(2)}`);
      console.log(`Winnings Added: ${winnings.toFixed(2)}`);
      console.log(`New Balance: ${newBalance.toFixed(2)}`);
      console.log(`Profit: ${profit.toFixed(2)}`);

      return {
        ...prev,
        balance: newBalance,
        totalWon: newTotalWon,
        gameState: 'result',
        status
      };
    });

    // Return to betting state after showing result
    setTimeout(() => {
      setGameData(prev => ({
        ...prev,
        gameState: 'betting',
        status: 'Ready for next bet!'
      }));
    }, 3000);
  }, [gameData.selectedBet]);

  const resetGame = useCallback(() => {
    setGameData({
      balance: 1000,
      selectedBet: 0,
      totalWon: 0,
      gameState: 'betting',
      status: 'Game reset! Place your bet to start!',
      countdown: 0,
      selectedRows: 8,
      riskLevel: 'Low',
      isAutoMode: false,
    });
  }, []);

  return {
    gameData,
    toggleMode,
    setRiskLevel,
    setRows,
    setBet,
    startGame,
    handleGameResult,
    resetGame
  };
}