'use client';

import { useEffect, useRef } from 'react';

interface GameCanvasProps {
  gameState: any;
  selectedBet: number;
  onGameResult: (result: number, slotIndex: number) => void;
}

export default function GameCanvas({ gameState, selectedBet, onGameResult }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let balls: Ball[] = [];
    let pegs: Peg[] = [];
    let slots: Slot[] = [];
    let animationId: number;

    const GRAVITY = 0.2;
    const BOUNCE_DAMPING = 0.7;
    const AIR_RESISTANCE = 0.99;
    const PEG_RADIUS = 8;
    const BALL_RADIUS = 6;

    interface Peg {
      x: number;
      y: number;
      radius: number;
    }

    interface Slot {
      x: number;
      y: number;
      width: number;
      height: number;
      multiplier: number;
      color: string;
    }

    class Ball {
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

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = 0;
        this.radius = BALL_RADIUS;
        this.color = '#fff';
        this.trail = [];
        this.collected = false;
        this.collectedSlot = -1;
        this.resultDelay = 0;
      }

      update() {
        if (this.collected && this.resultDelay <= 0) return;

        this.vy += GRAVITY;
        this.vx *= AIR_RESISTANCE;
        this.vy *= AIR_RESISTANCE;
        this.x += this.vx;
        this.y += this.vy;

        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 8) {
          this.trail.shift();
        }

        this.checkPegCollisions();

        if (this.x - this.radius < 0 || this.x + this.radius > canvas!.width) {
          this.vx = -this.vx * BOUNCE_DAMPING;
          this.x = Math.max(this.radius, Math.min(canvas!.width - this.radius, this.x));
        }

        if (this.y + this.radius > canvas!.height - 60 && !this.collected) {
          this.collectInSlot();
        }

        if (this.collected && this.resultDelay > 0) {
          this.resultDelay--;
          if (this.resultDelay === 0) {
            this.showResult();
          }
        }
      }

      checkPegCollisions() {
        for (let peg of pegs) {
          const dx = this.x - peg.x;
          const dy = this.y - peg.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < this.radius + peg.radius) {
            const angle = Math.atan2(dy, dx);
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);

            this.vx = Math.cos(angle) * speed * BOUNCE_DAMPING + (Math.random() - 0.5) * 0.8;
            this.vy = Math.sin(angle) * speed * BOUNCE_DAMPING + (Math.random() - 0.5) * 0.8;

            const overlap = this.radius + peg.radius - distance;
            this.x += Math.cos(angle) * overlap;
            this.y += Math.sin(angle) * overlap;

            break;
          }
        }
      }

      collectInSlot() {
        const slotIndex = Math.floor(this.x / (canvas!.width / 7));
        if (slotIndex >= 0 && slotIndex < slots.length) {
          this.collectedSlot = slotIndex;
          this.collected = true;
          this.color = slots[slotIndex].color;
          this.resultDelay = 120;
        }
      }

      showResult() {
        const gameResult = Math.floor(selectedBet * slots[this.collectedSlot].multiplier);
        onGameResult(gameResult, this.collectedSlot);
      }

      draw() {
        ctx!.globalAlpha = 0.4;
        for (let i = 0; i < this.trail.length; i++) {
          const alpha = ((i + 1) / this.trail.length) * 0.4;
          ctx!.globalAlpha = alpha;
          ctx!.fillStyle = this.color;
          ctx!.beginPath();
          ctx!.arc(this.trail[i].x, this.trail[i].y, this.radius * (0.3 + alpha), 0, Math.PI * 2);
          ctx!.fill();
        }

        ctx!.globalAlpha = 1;
        ctx!.fillStyle = this.color;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.shadowColor = this.color;
        ctx!.shadowBlur = 15;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.shadowBlur = 0;
      }
    }

    function getSlotColor(multiplier: number): string {
      if (multiplier >= 5) return '#ff4757';
      if (multiplier >= 2) return '#ff6348';
      if (multiplier >= 1) return '#ffa502';
      return '#2ed573';
    }

    function initGame() {
      pegs = [];
      const rows = 8;
      for (let row = 0; row < rows; row++) {
        const pegsInRow = row + 3;
        const startX = (canvas!.width - (pegsInRow - 1) * 60) / 2;

        for (let col = 0; col < pegsInRow; col++) {
          pegs.push({
            x: startX + col * 60,
            y: 80 + row * 45,
            radius: PEG_RADIUS
          });
        }
      }

      slots = [];
      const slotWidth = canvas!.width / 7;
      const multipliers = [0.5, 1, 2, 5, 2, 1, 0.5];

      for (let i = 0; i < 7; i++) {
        slots.push({
          x: i * slotWidth,
          y: canvas!.height - 60,
          width: slotWidth,
          height: 60,
          multiplier: multipliers[i],
          color: getSlotColor(multipliers[i])
        });
      }
    }

    function gameLoop() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        ctx!.fillStyle = slot.color;
        ctx!.fillRect(slot.x, slot.y, slot.width, slot.height);

        ctx!.fillStyle = 'white';
        ctx!.font = 'bold 16px Arial';
        ctx!.textAlign = 'center';
        ctx!.fillText(`${slot.multiplier}x`, slot.x + slot.width / 2, slot.y + 25);

        ctx!.font = '12px Arial';
        const payout = selectedBet * slot.multiplier;
        ctx!.fillText(`$${payout}`, slot.x + slot.width / 2, slot.y + 45);
      }

      ctx!.fillStyle = '#4ecdc4';
      for (let peg of pegs) {
        ctx!.beginPath();
        ctx!.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.shadowColor = '#4ecdc4';
        ctx!.shadowBlur = 8;
        ctx!.beginPath();
        ctx!.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.shadowBlur = 0;
      }

      for (let ball of balls) {
        ball.update();
        ball.draw();
      }

      animationId = requestAnimationFrame(gameLoop);
    }

    initGame();
    gameLoop();

    if (gameState.state === 'playing' && balls.length === 0) {
      const dropX = canvas!.width / 2 + (Math.random() - 0.5) * 20;
      balls.push(new Ball(dropX, 20));
    }

    if (gameState.state === 'betting') {
      balls = [];
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameState, selectedBet, onGameResult]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={500}
      className="block mx-auto"
    />
  );
}
