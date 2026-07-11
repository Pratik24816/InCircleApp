import { AnimatePresence, motion } from 'framer-motion';
import type { ReactNode } from 'react';

type Props = {
  show: boolean;
  type: 'win' | 'loss';
  title: string;
  subtitle?: string;
  emoji?: string;
  onPlayAgain?: () => void;
};

const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  angle: (i / 24) * 360,
  dist: 40 + (i % 5) * 18,
  size: 4 + (i % 3) * 3,
}));

export function GameOutcome({ show, type, title, subtitle, emoji, onPlayAgain }: Props) {
  const isWin = type === 'win';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`lg-outcome lg-outcome--${type}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div
            className="lg-outcome__burst"
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            aria-hidden
          />

          {PARTICLES.map(p => (
            <motion.span
              key={p.id}
              className={`lg-outcome__particle${isWin ? '' : ' lg-outcome__particle--loss'}`}
              style={{ width: p.size, height: p.size }}
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{
                x: Math.cos((p.angle * Math.PI) / 180) * p.dist,
                y: Math.sin((p.angle * Math.PI) / 180) * p.dist,
                opacity: 0,
                scale: 0,
              }}
              transition={{ duration: 0.85, ease: 'easeOut', delay: p.id * 0.015 }}
              aria-hidden
            />
          ))}

          <motion.div
            className="lg-outcome__card"
            initial={{ scale: 0.5, y: 30, rotateX: -20 }}
            animate={{ scale: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.08 }}
          >
            <motion.span
              className="lg-outcome__emoji"
              animate={isWin ? { scale: [1, 1.25, 1], rotate: [0, 8, -8, 0] } : { x: [0, -6, 6, -4, 0] }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {emoji ?? (isWin ? '🎉' : '💥')}
            </motion.span>
            <h4 className="lg-outcome__title">{title}</h4>
            {subtitle && <p className="lg-outcome__subtitle">{subtitle}</p>}
            {onPlayAgain && (
              <motion.button
                type="button"
                className="lg-game__btn lg-game__btn--primary lg-outcome__again"
                onClick={onPlayAgain}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
              >
                Play again
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function GamePlayfield({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`lg-game__playfield ${className}`}>
      <div className="lg-game__playfield-glow" aria-hidden />
      {children}
    </div>
  );
}
