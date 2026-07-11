import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { LogoImage } from './shared';
import { GameOutcome, GamePlayfield } from './GameOutcome';

const SIZE = 320;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 118;
const TARGET = 72;

export function TraceTheLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const points = useRef<{ x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [won, setWon] = useState(false);
  const [msg, setMsg] = useState('Trace the radar ring with your finger');

  const ringPoint = (angle: number) => ({
    x: CX + R * Math.cos(angle),
    y: CY + R * Math.sin(angle),
  });

  const drawRingGuide = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.strokeStyle = 'rgba(140,255,79,0.25)';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  const scoreTrace = () => {
    let hits = 0;
    const samples = 120;
    for (let i = 0; i < samples; i++) {
      const p = ringPoint((i / samples) * Math.PI * 2);
      const near = points.current.some(pt => Math.hypot(pt.x - p.x, pt.y - p.y) < 22);
      if (near) hits++;
    }
    const pct = Math.round((hits / samples) * 100);
    setScore(pct);
    setDone(true);
    setWon(pct >= TARGET);
    setMsg(pct >= TARGET ? 'Perfect trace!' : 'Almost — try again!');
  };

  const onDown = () => {
    if (done) return;
    drawing.current = true;
    points.current = [];
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    drawRingGuide(ctx);
    ctx.strokeStyle = '#8cff4f';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#8cff4f';
    ctx.shadowBlur = 12;
    ctx.beginPath();
  };

  const onMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || done) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = SIZE / rect.width;
    const scaleY = SIZE / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    points.current.push({ x, y });
    const ctx = canvasRef.current!.getContext('2d')!;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const onUp = () => {
    if (!drawing.current || done) return;
    drawing.current = false;
    scoreTrace();
  };

  const reset = () => {
    points.current = [];
    setScore(0);
    setDone(false);
    setWon(false);
    setMsg('Trace the radar ring with your finger');
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) drawRingGuide(ctx);
  };

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) drawRingGuide(ctx);
  }, []);

  return (
    <div className="lg-game lg-game--trace">
      <GamePlayfield>
        <div className="lg-trace__wrap">
          <canvas
            ref={canvasRef}
            width={SIZE}
            height={SIZE}
            className="lg-trace__canvas"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerLeave={onUp}
          />
          <div className="lg-trace__logo">
            <LogoImage size={100} />
          </div>
        </div>

        <GameOutcome
          show={done}
          type={won ? 'win' : 'loss'}
          emoji={won ? '✍️' : '🔄'}
          title={won ? `${score}% accuracy!` : `${score}% — need ${TARGET}%+`}
          subtitle={won ? 'You know the Hopiin ring' : 'Trace closer to the dashed line'}
          onPlayAgain={reset}
        />
      </GamePlayfield>

      <p className="lg-game__msg">{msg}</p>
    </div>
  );
}
