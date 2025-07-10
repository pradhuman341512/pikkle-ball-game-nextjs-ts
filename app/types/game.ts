export type GameState = 'betting' | 'countdown' | 'playing' | 'result';

export interface GameStats {
  balance: number;
  selectedBet: number;
  totalWon: number;
  gamesPlayed: number;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  trail: Array<{ x: number; y: number }>;
  collected: boolean;
  collectedSlot: number;
  resultDelay: number;
}

export interface Peg {
  x: number;
  y: number;
  radius: number;
}

export interface Slot {
  x: number;
  y: number;
  width: number;
  height: number;
  multiplier: number;
  color: string;
}