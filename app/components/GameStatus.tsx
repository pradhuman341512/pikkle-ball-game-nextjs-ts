'use client';

interface GameStatusProps {
  status: string;
  countdown: number;
}

export default function GameStatus({ status, countdown }: GameStatusProps) {
  return (
    <div className="text-center mb-6">
      <div className="text-lg font-medium text-gray-300 mb-2">{status}</div>
      {countdown > 0 && (
        <div className="text-5xl font-bold text-red-500 animate-pulse">
          {countdown}
        </div>
      )}
    </div>
  );
}
