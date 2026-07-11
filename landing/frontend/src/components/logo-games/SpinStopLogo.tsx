import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { PLANS } from './constants';
import { LogoImage } from './shared';
import { GameOutcome, GamePlayfield } from './GameOutcome';

const SEG = 360 / PLANS.length;

export function SpinStopLogo() {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<(typeof PLANS)[number] | null>(null);
  const [showOutcome, setShowOutcome] = useState(false);
  const [msg, setMsg] = useState('Tap spin — plans orbit your logo');
  const rotRef = useRef(0);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);
    setShowOutcome(false);
    setMsg('Spinning...');
    const start = rotRef.current;
    const extra = 1080 + Math.random() * 720;
    const startTime = performance.now();
    const duration = 2800;

    const tick = (now: number) => {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setRotation(start + extra * eased);
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        rotRef.current = start + extra;
        const angle = (360 - (rotRef.current % 360) + SEG / 2) % 360;
        const idx = Math.floor(angle / SEG) % PLANS.length;
        const plan = PLANS[idx];
        setResult(plan);
        setMsg(`Tonight's pick locked in!`);
        setSpinning(false);
        setTimeout(() => setShowOutcome(true), 200);
      }
    };
    requestAnimationFrame(tick);
  };

  const reset = () => {
    setShowOutcome(false);
    setResult(null);
    setMsg('Tap spin — plans orbit your logo');
  };

  return (
    <div className="lg-game lg-game--spin-stop">
      <GamePlayfield>
        <div className="lg-spin-stop__wrap">
          <div className="lg-spin-stop__ring-glow" aria-hidden />
          <motion.div
            className="lg-spin-stop__orbit"
            style={{ rotate: rotation }}
            animate={spinning ? { filter: ['brightness(1)', 'brightness(1.15)', 'brightness(1)'] } : {}}
            transition={{ duration: 0.4, repeat: spinning ? Infinity : 0 }}
          >
            {PLANS.map((plan, i) => {
              const a = (i * SEG * Math.PI) / 180;
              const x = 50 + 44 * Math.cos(a - Math.PI / 2);
              const y = 50 + 44 * Math.sin(a - Math.PI / 2);
              return (
                <motion.span
                  key={plan.label}
                  className="lg-spin-stop__label"
                  style={{ left: `${x}%`, top: `${y}%` }}
                  whileHover={{ scale: 1.15 }}
                >
                  {plan.emoji}
                </motion.span>
              );
            })}
          </motion.div>
          <div className="lg-spin-stop__pointer" aria-hidden>▼</div>
          <div className="lg-spin-stop__logo">
            <LogoImage size={130} />
          </div>
        </div>

        <GameOutcome
          show={showOutcome && !!result}
          type="win"
          emoji={result?.emoji}
          title={result?.label ?? ''}
          subtitle={`${result?.place} · tonight`}
          onPlayAgain={reset}
        />
      </GamePlayfield>

      <motion.button
        type="button"
        className="lg-game__btn lg-game__btn--primary lg-game__btn--lg"
        onClick={spin}
        disabled={spinning}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
      >
        {spinning ? 'Spinning...' : 'Spin plans'}
      </motion.button>
      <p className="lg-game__msg">{msg}</p>
    </div>
  );
}
