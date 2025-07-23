'use client';

import { useState } from 'react';

interface BettingSectionProps {
  onSelectBet: (amount: number) => void;
  selectedBet: number;
  balance: number;
  gameState: string;
}

export default function BettingSection({
  onSelectBet,
  selectedBet,
  balance,
  gameState,
}: BettingSectionProps) {
  const [betMode, setBetMode] = useState<'manual' | 'auto'>('manual');
  const [betAmount, setBetAmount] = useState<string>('0.00000000');
  const [risk, setRisk] = useState<'low' | 'medium' | 'high'>('low');
  const [rows, setRows] = useState<number>(8);

  const handleBetAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBetAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      onSelectBet(numValue);
    }
  };

  const adjustBetAmount = (multiplier: number) => {
    const currentAmount = parseFloat(betAmount) || 0;
    const newAmount = currentAmount * multiplier;
    setBetAmount(newAmount.toFixed(8));
    onSelectBet(newAmount);
  };

  return (
    <div className="w-full bg-gray-800 rounded-lg p-4 space-y-4">
      {/* Manual/Auto Toggle */}
      <div className="flex bg-gray-700 rounded-lg p-1">
        <button
          onClick={() => setBetMode('manual')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            betMode === 'manual'
              ? 'bg-gray-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Manual
        </button>
        <button
          onClick={() => setBetMode('auto')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            betMode === 'auto'
              ? 'bg-gray-600 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Auto
        </button>
      </div>

      {/* Bet Amount */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-300">Bet Amount</label>
          <span className="text-sm text-gray-400">${balance.toFixed(2)}</span>
        </div>
        <div className="relative">
          <input
            type="text"
            value={betAmount}
            onChange={handleBetAmountChange}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            placeholder="0.00000000"
            disabled={gameState !== 'betting'}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
            <select
              className="bg-transparent text-orange-500 text-sm focus:outline-none"
              defaultValue="BTC"
              aria-label="Select currency"
            >
              <option value="BTC">₿ BTC</option>
              <option value="ETH">Ξ ETH</option>
              <option value="USDT">$ USDT</option>
              <option value="DOGE">Ð DOGE</option>
              <option value="SOL">◎ SOL</option>
              <option value="BNB">⚪ BNB</option>
              <option value="XRP">✕ XRP</option>
              <option value="LTC">Ł LTC</option>
              <option value="TRX">T TRX</option>
              <option value="ADA">₳ ADA</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => adjustBetAmount(0.5)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded text-sm transition-colors"
            disabled={gameState !== 'betting'}
          >
            ½
          </button>
          <button
            onClick={() => adjustBetAmount(2)}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded text-sm transition-colors"
            disabled={gameState !== 'betting'}
          >
            2×
          </button>
        </div>
      </div>

      {/* Risk Level */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Risk</label>
        <select
          value={risk}
          onChange={(e) => setRisk(e.target.value as 'low' | 'medium' | 'high')}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          aria-label="Select risk level"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Rows */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">Rows</label>
        <select
          value={rows}
          onChange={(e) => setRows(parseInt(e.target.value))}
          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          aria-label="Select number of rows"
        >
          {[8, 10, 12, 14, 16].map((row) => (
            <option key={row} value={row}>
              {row}
            </option>
          ))}
        </select>
      </div>

      {/* Bet Button */}
      <button
        onClick={() => onSelectBet(parseFloat(betAmount))}
        disabled={
          gameState !== 'betting' ||
          parseFloat(betAmount) <= 0 ||
          parseFloat(betAmount) > balance
        }
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors"
      >
        Bet
      </button>
    </div>
  );
}
