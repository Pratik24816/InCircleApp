import { motion, useReducedMotion } from 'framer-motion';

const DRAW_EASE = [0.45, 0, 0.15, 1] as const;

type Props = {
  className?: string;
};

export function HopiinSketchLogo({ className = '' }: Props) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <p className={`hopiin-sketch hopiin-sketch--static ${className}`} aria-label="Hopiin">
        <span className="hopiin-sketch__hop">Hop</span>
        <span className="hopiin-sketch__iin">iin</span>
      </p>
    );
  }

  return (
    <div className={`hopiin-sketch ${className}`} aria-label="Hopiin">
      {/* Stroke layer — sketch lines draw in first */}
      <div className="hopiin-sketch__layer hopiin-sketch__layer--stroke" aria-hidden>
        <motion.span
          className="hopiin-sketch__hop"
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: 1.1, ease: DRAW_EASE, delay: 0.25 }}
        >
          Hop
        </motion.span>
        <motion.span
          className="hopiin-sketch__iin hopiin-sketch__iin--stroke"
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: 0.85, ease: DRAW_EASE, delay: 1.15 }}
        >
          iin
        </motion.span>
      </div>

      {/* Fill layer — ink fills in right behind the stroke */}
      <div className="hopiin-sketch__layer hopiin-sketch__layer--fill">
        <motion.span
          className="hopiin-sketch__hop"
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: 1.05, ease: DRAW_EASE, delay: 0.35 }}
        >
          Hop
        </motion.span>
        <motion.span
          className="hopiin-sketch__iin"
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: 0.8, ease: DRAW_EASE, delay: 1.25 }}
        >
          iin
        </motion.span>
      </div>

      {/* Decorative flourish underline */}
      <svg
        className="hopiin-sketch__flourish"
        viewBox="0 0 320 40"
        fill="none"
        aria-hidden
      >
        <motion.path
          d="M 8 28 C 40 8, 80 36, 120 22 S 200 6, 260 24 S 300 32, 312 18"
          stroke="url(#hopiin-flourish-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: DRAW_EASE, delay: 1.9 }}
        />
        <defs>
          <linearGradient id="hopiin-flourish-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
            <stop offset="45%" stopColor="#8cff4f" />
            <stop offset="100%" stopColor="#4db5ff" />
          </linearGradient>
        </defs>
      </svg>

      {/* Pen dot tracing the word */}
      <motion.span
        className="hopiin-sketch__pen"
        aria-hidden
        initial={{ left: '2%', opacity: 0, scale: 0 }}
        animate={{
          left: ['2%', '38%', '38%', '72%', '72%'],
          opacity: [0, 1, 1, 1, 0],
          scale: [0, 1, 1, 1, 0],
        }}
        transition={{
          duration: 2.1,
          ease: DRAW_EASE,
          delay: 0.25,
          times: [0, 0.45, 0.5, 0.92, 1],
        }}
      />

      {/* Soft glow after draw completes */}
      <motion.span
        className="hopiin-sketch__glow"
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.7, 0.45] }}
        transition={{ delay: 2.4, duration: 1.2, ease: 'easeOut' }}
      />
    </div>
  );
}
