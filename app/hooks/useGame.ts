'use client';

import { useState, useCallback } from 'react';

export type GameState = 'betting' | 'countdown' | 'playing' | 'result';

export interface GameData {
  balance: number;
  selectedBet: number;
  totalWon: number;
  gameState: GameState;
  status: string;
  countdown: number;
}

export function useGame() {
  const [gameData, setGameData] = useState<GameData>({
    balance: 1000,
    selectedBet: 0,
    totalWon: 0,
    gameState: 'betting',
    status: 'Select your bet amount to start!',
    countdown: 0,
  });

  const selectBet = useCallback((amount: number) => {
    if (gameData.gameState !== 'betting' || gameData.balance < amount) return;

    setGameData(prev => ({
      ...prev,
      selectedBet: amount,
      status: `Bet selected: $${amount}. Ready to play!`,
    }));
  }, [gameData.gameState, gameData.balance]);

  const startGame = useCallback(() => {
    if (gameData.gameState !== 'betting' || gameData.selectedBet === 0 || gameData.balance < gameData.selectedBet) return;

    setGameData(prev => ({
      ...prev,
      balance: prev.balance - prev.selectedBet,
      gameState: 'countdown',
      status: 'Get ready...',
      countdown: 3,
    }));

    // Start countdown
    let countdownValue = 3;
    const countdownInterval = setInterval(() => {
      countdownValue--;
      if (countdownValue > 0) {
        setGameData(prev => ({ ...prev, countdown: countdownValue }));
      } else {
        clearInterval(countdownInterval);
        setGameData(prev => ({
          ...prev,
          gameState: 'playing',
          status: 'Ball in play! Watch it fall...',
          countdown: 0,
        }));
      }
    }, 1000);
  }, [gameData.gameState, gameData.selectedBet, gameData.balance]);

  const handleGameResult = useCallback((result: number, slotIndex: number) => {
    const multiplier = [0.5, 1, 2, 5, 2, 1, 0.5][slotIndex];
    
    setGameData(prev => {
      const newBalance = prev.balance + result;
      const newTotalWon = prev.totalWon + Math.max(0, result - prev.selectedBet);
      
      let status;
      if (result > prev.selectedBet) {
        status = `🎉 You won $${result}! (${multiplier}x multiplier)`;
      } else if (result === prev.selectedBet) {
        status = `💰 You broke even! Got your $${result} back!`;
      } else {
        status = `💸 You won $${result}. Better luck next time!`;
      }

      return {
        ...prev,
        balance: newBalance,
        totalWon: newTotalWon,
        gameState: 'result',
        status,
      };
    });

    // Reset for next game after delay
    setTimeout(() => {
      setGameData(prev => ({
        ...prev,
        gameState: prev.balance > 0 ? 'betting' : 'betting',
        status: prev.balance > 0 ? 'Select your bet amount for next round!' : 'Game Over! Click Reset to play again.',
      }));
    }, 3000);
  }, []);

  const resetGame = useCallback(() => {
    setGameData({
      balance: 1000,
      selectedBet: 0,
      totalWon: 0,
      gameState: 'betting',
      status: 'Select your bet amount to start!',
      countdown: 0,
    });
  }, []);

  return {
    gameData,
    selectBet,
    startGame,
    handleGameResult,
    resetGame,
  };
}