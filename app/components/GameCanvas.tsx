'use client';

import { useEffect, useRef } from 'react';

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

type GameState = {
  state: 'betting' | 'playing' | string;
};

interface GameCanvasProps {
  gameState: GameState;
  selectedBet: number;
  onGameResult: (winnings: number, slotIndex: number, multiplier: number) => void;
}

export default function GameCanvas({ gameState, selectedBet, onGameResult }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let balls: GameBall[] = [];
    let pegs: Peg[] = [];
    let slots: Slot[] = [];
    let animationId: number;

    const GRAVITY = 0.25;
    const BOUNCE_DAMPING = 0.9;
    const AIR_RESISTANCE = 0.998;
    const PEG_RADIUS = 6;
    const BALL_RADIUS = 8;

    class GameBall {
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
        this.vx = (Math.random() - 0.5) * 0.6;
        this.vy = 0;
        this.radius = BALL_RADIUS;
        this.color = '#ffffff';
        this.trail = [];
        this.collected = false;
        this.collectedSlot = -1;
        this.resultDelay = 0;
      }

      update() {
        if (this.collected && this.resultDelay <= 0) return;

        // Apply gravity and resistance
        this.vy += GRAVITY;
        this.vx *= AIR_RESISTANCE;
        this.vy *= AIR_RESISTANCE;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Add to trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 15) this.trail.shift();

        // Check collisions
        this.checkPegCollisions();

        // Enhanced wall bounces - keep ball within triangle bounds
        const triangleWidth = canvas!.width * 0.8;
        const triangleStartX = (canvas!.width - triangleWidth) / 2;
        const triangleEndX = triangleStartX + triangleWidth;
        
        // Calculate triangle boundaries based on Y position
        const triangleTopY = 80;
        const triangleBottomY = slots[0].y;
        
        if (this.y > triangleTopY && this.y < triangleBottomY) {
          // Calculate current triangle width at this Y level
          const progress = (this.y - triangleTopY) / (triangleBottomY - triangleTopY);
          const currentTriangleWidth = triangleWidth * (0.2 + 0.8 * progress); // Start narrow, get wider
          const currentLeftBound = triangleStartX + (triangleWidth - currentTriangleWidth) / 2;
          const currentRightBound = currentLeftBound + currentTriangleWidth;
          
          // Bounce off triangle walls
          if (this.x - this.radius < currentLeftBound) {
            this.vx = Math.abs(this.vx) * BOUNCE_DAMPING;
            this.x = currentLeftBound + this.radius;
          } else if (this.x + this.radius > currentRightBound) {
            this.vx = -Math.abs(this.vx) * BOUNCE_DAMPING;
            this.x = currentRightBound - this.radius;
          }
        } else {
          // Regular wall bounces for areas outside triangle
          if (this.x - this.radius < 0) {
            this.vx = Math.abs(this.vx) * BOUNCE_DAMPING;
            this.x = this.radius;
          } else if (this.x + this.radius > canvas!.width) {
            this.vx = -Math.abs(this.vx) * BOUNCE_DAMPING;
            this.x = canvas!.width - this.radius;
          }
        }

        // Check if ball reached slot area
        if (this.y + this.radius >= slots[0].y && !this.collected) {
          this.collectInSlot();
        }

        // Handle result animation
        if (this.collected && this.resultDelay > 0) {
          this.resultDelay--;
          
          // Move ball to center of collected slot
          const targetSlot = slots[this.collectedSlot];
          const targetX = targetSlot.x + targetSlot.width / 2;
          const targetY = targetSlot.y + targetSlot.height / 2;

          this.x += (targetX - this.x) * 0.1;
          this.y += (targetY - this.y) * 0.1;
          this.vx *= 0.9;
          this.vy *= 0.9;

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
            
            // Add some randomness but keep it smooth
            const randomFactor = (Math.random() - 0.5) * 0.4;
            this.vx = Math.cos(angle) * speed * BOUNCE_DAMPING + randomFactor;
            this.vy = Math.sin(angle) * speed * BOUNCE_DAMPING + (Math.random() - 0.5) * 0.2;

            // Separate from peg
            const overlap = this.radius + peg.radius - distance;
            this.x += Math.cos(angle) * overlap;
            this.y += Math.sin(angle) * overlap;

            break;
          }
        }
      }

      collectInSlot() {
        // Find which slot the ball landed in
        let slotIndex = -1;
        
        for (let i = 0; i < slots.length; i++) {
          const slot = slots[i];
          if (this.x >= slot.x && this.x <= slot.x + slot.width) {
            slotIndex = i;
            break;
          }
        }

        // Fallback: use position-based calculation
        if (slotIndex === -1) {
          slotIndex = Math.floor(this.x / (canvas!.width / slots.length));
          slotIndex = Math.max(0, Math.min(slots.length - 1, slotIndex));
        }

        if (slotIndex >= 0 && slotIndex < slots.length) {
          this.collectedSlot = slotIndex;
          this.collected = true;
          this.color = slots[slotIndex].color;
          this.resultDelay = 60; // 1 second at 60fps
        }
      }

      showResult() {
        const slot = slots[this.collectedSlot];
        const multiplier = slot.multiplier;
        const winnings = selectedBet * multiplier;
        
        // Call the result callback
        onGameResult(winnings, this.collectedSlot, multiplier);
      }

      draw() {
        // Draw trail
        for (let i = 0; i < this.trail.length; i++) {
          const alpha = ((i + 1) / this.trail.length) * 0.6;
          ctx!.globalAlpha = alpha;
          ctx!.fillStyle = this.color;
          ctx!.beginPath();
          ctx!.arc(this.trail[i].x, this.trail[i].y, this.radius * (0.2 + alpha * 0.8), 0, Math.PI * 2);
          ctx!.fill();
        }

        // Draw main ball
        ctx!.globalAlpha = 1;
        ctx!.fillStyle = this.color;
        ctx!.shadowColor = this.color;
        ctx!.shadowBlur = 15;
        ctx!.beginPath();
        ctx!.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.shadowBlur = 0;
      }
    }

    function getSlotColor(multiplier: number): string {
      if (multiplier >= 5.6) return '#dc2626'; // red-600
      if (multiplier >= 2.1) return '#ea580c'; // orange-600  
      if (multiplier >= 1.1) return '#d97706'; // amber-600
      if (multiplier >= 1) return '#ca8a04';   // yellow-600
      return '#16a34a'; // green-600
    }

    function initGame() {
      // Clear existing game elements
      pegs = [];
      slots = [];

      const rows = 8;
      const triangleWidth = canvas!.width * 0.8; // 80% of canvas width for triangle
      const triangleStartX = (canvas!.width - triangleWidth) / 2;
      const pegSpacing = triangleWidth / (rows + 1);
      const startY = 80;

      // Create pegs in triangle formation
      for (let row = 0; row < rows; row++) {
        const pegsInRow = row + 3;
        const rowWidth = (pegsInRow - 1) * pegSpacing;
        const startX = triangleStartX + (triangleWidth - rowWidth) / 2;

        for (let col = 0; col < pegsInRow; col++) {
          pegs.push({
            x: startX + col * pegSpacing,
            y: startY + row * (pegSpacing * 0.7),
            radius: PEG_RADIUS
          });
        }
      }

      // Create slots at the bottom - aligned with triangle base
      const slotCount = 9;
      const slotWidth = triangleWidth / slotCount;
      const slotHeight = 60;
      const slotY = canvas!.height - slotHeight;
      
      // Multipliers for low risk 8-row configuration
      const multipliers = [5.6, 2.1, 1.1, 1.0, 0.5, 1.0, 1.1, 2.1, 5.6];

      for (let i = 0; i < slotCount; i++) {
        slots.push({
          x: triangleStartX + i * slotWidth,
          y: slotY,
          width: slotWidth,
          height: slotHeight,
          multiplier: multipliers[i],
          color: getSlotColor(multipliers[i])
        });
      }
    }

    function gameLoop() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      // Draw triangle boundaries (optional - for debugging)
      // const triangleWidth = canvas!.width * 0.8;
      // const triangleStartX = (canvas!.width - triangleWidth) / 2;
      // ctx!.strokeStyle = '#333';
      // ctx!.lineWidth = 2;
      // ctx!.beginPath();
      // ctx!.moveTo(triangleStartX, slots[0].y);
      // ctx!.lineTo(canvas!.width / 2, 80);
      // ctx!.lineTo(triangleStartX + triangleWidth, slots[0].y);
      // ctx!.stroke();

      // Draw slots
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        
        // Slot background with gradient
        const gradient = ctx!.createLinearGradient(slot.x, slot.y, slot.x, slot.y + slot.height);
        gradient.addColorStop(0, slot.color);
        gradient.addColorStop(1, slot.color + '80');
        ctx!.fillStyle = gradient;
        ctx!.fillRect(slot.x, slot.y, slot.width, slot.height);

        // Slot border
        ctx!.strokeStyle = '#ffffff30';
        ctx!.lineWidth = 1;
        ctx!.strokeRect(slot.x, slot.y, slot.width, slot.height);

        // Multiplier text
        ctx!.fillStyle = 'white';
        ctx!.font = 'bold 14px Arial';
        ctx!.textAlign = 'center';
        ctx!.shadowColor = 'rgba(0,0,0,0.8)';
        ctx!.shadowBlur = 2;
        ctx!.fillText(`${slot.multiplier}x`, slot.x + slot.width / 2, slot.y + 25);

        // Payout text
        ctx!.font = '11px Arial';
        const payout = (selectedBet * slot.multiplier).toFixed(2);
        ctx!.fillText(`${payout}`, slot.x + slot.width / 2, slot.y + 45);
        ctx!.shadowBlur = 0;
      }

      // Draw pegs
      ctx!.fillStyle = '#ffffff';
      ctx!.shadowColor = '#ffffff';
      ctx!.shadowBlur = 8;
      for (let peg of pegs) {
        ctx!.beginPath();
        ctx!.arc(peg.x, peg.y, peg.radius, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.shadowBlur = 0;

      // Update and draw balls
      for (let ball of balls) {
        ball.update();
        ball.draw();
      }

      // Remove balls that have finished their animation
      balls = balls.filter(ball => !ball.collected || ball.resultDelay > 0);

      animationId = requestAnimationFrame(gameLoop);
    }

    // Initialize game
    initGame();
    gameLoop();

    // Start ball when game is playing
    if (gameState.state === 'playing' && balls.length === 0) {
      const centerX = canvas!.width / 2;
      const randomOffset = (Math.random() - 0.5) * 30;
      const dropX = centerX + randomOffset;
      balls.push(new GameBall(dropX, 30));
    }

    // Clear balls when returning to betting
    if (gameState.state === 'betting') {
      balls = [];
    }

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [gameState, selectedBet, onGameResult]);

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-2xl">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="w-full h-auto border border-gray-600 rounded-lg bg-gray-900 shadow-inner"
      />
    </div>
  );
}