'use client';

interface GameStatusProps {
  status: string;
  countdown: number;
}

export default function GameStatus({ status, countdown }: GameStatusProps) {
  return (
    <>
      <div className="game-status">{status}</div>
      {countdown > 0 && <div className="countdown">{countdown}</div>}
    </>
  );
}