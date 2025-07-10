'use client';

interface GameControlsProps {
  onPlay: () => void;
  onReset: () => void;
  canPlay: boolean;
}

export default function GameControls({ onPlay, onReset, canPlay }: GameControlsProps) {
  return (
    <div className="game-controls">
      <button onClick={onPlay} disabled={!canPlay}>
        🎮 Play Game
      </button>
      <button onClick={onReset}>🔄 Reset Game</button>
    </div>
  );
}