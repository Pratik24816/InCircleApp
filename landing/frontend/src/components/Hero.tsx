import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { type MouseEvent, useRef } from 'react';
import { BRAND } from '../constants/brand';
import { ScrollIndicator } from './GrainOverlay';
import { HeroScene3D } from './HeroScene3D';
import { HopiinSketchLogo } from './HopiinSketchLogo';
import './hero.css';

const FLOAT_CHIPS = [
  { emoji: '☕', label: 'Chai run', style: { top: '18%', left: '6%' }, delay: 0 },
  { emoji: '🏏', label: 'Cricket', style: { top: '28%', right: '5%' }, delay: 0.15 },
  { emoji: '📍', label: 'Nearby', style: { bottom: '32%', left: '4%' }, delay: 0.3 },
  { emoji: '🌙', label: 'Tonight', style: { bottom: '22%', right: '6%' }, delay: 0.45 },
  { emoji: '📚', label: 'Study', style: { top: '42%', right: '3%' }, delay: 0.6 },
];

const TITLE_LINES = [
  ['Your', 'city', 'is'],
  ['alive', 'tonight.'],
];

const TAGLINE_PARTS = [
  { text: 'Find people.', highlight: false },
  { text: 'Make plans.', highlight: false },
  { text: 'Hop in.', highlight: true },
];

const SUBTITLE =
  'The social app for spontaneous real-world hangouts — walks, cricket, coffee, study sessions, and everything in between.';

const STATS = [
  { value: 'IRL', label: 'Not another feed' },
  { value: '1 tap', label: 'To hop in' },
  { value: 'Tonight', label: 'Plans start now' },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const scrollY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const contentScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const parallaxX = useSpring(useTransform(mouseX, [-0.5, 0.5], [14, -14]), {
    stiffness: 70,
    damping: 22,
  });
  const tiltX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    stiffness: 120,
    damping: 18,
  });
  const tiltY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), {
    stiffness: 120,
    damping: 18,
  });
  const spotlightX = useSpring(useTransform(mouseX, [-0.5, 0.5], ['35%', '65%']), {
    stiffness: 60,
    damping: 25,
  });
  const spotlightY = useSpring(useTransform(mouseY, [-0.5, 0.5], ['30%', '70%']), {
    stiffness: 60,
    damping: 25,
  });

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      ref={ref}
      className="hero"
      id="top"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="hero__bg" aria-hidden>
        <div className="hero__bg-mesh" />
        <div className="hero__bg-radial" />
        <div className="hero__bg-noise" />
      </div>

      <motion.div
        className="hero__spotlight"
        style={{ left: spotlightX, top: spotlightY, opacity: scrollOpacity }}
        aria-hidden
      />

      <motion.div className="hero__aurora" style={{ opacity: scrollOpacity }} aria-hidden>
        <div className="hero__aurora-blob hero__aurora-blob--1" />
        <div className="hero__aurora-blob hero__aurora-blob--2" />
        <div className="hero__aurora-blob hero__aurora-blob--3" />
      </motion.div>

      <div className="hero__grid" aria-hidden />

      <HeroScene3D />

      <div className="hero__beams" aria-hidden>
        <span className="hero__beam hero__beam--1" />
        <span className="hero__beam hero__beam--2" />
        <span className="hero__beam hero__beam--3" />
      </div>

      <div className="hero__floats" aria-hidden>
        {FLOAT_CHIPS.map(chip => (
          <motion.div
            key={chip.label}
            className="hero__float-chip"
            style={chip.style}
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 1.5 + chip.delay, duration: 0.7, ease }}
          >
            <motion.span
              className="hero__float-chip-inner"
              animate={{ y: [0, -10, 0], rotate: [0, 2, 0, -2, 0] }}
              transition={{
                duration: 4 + chip.delay * 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: chip.delay,
              }}
            >
              <span className="hero__float-emoji">{chip.emoji}</span>
              <span className="hero__float-label">{chip.label}</span>
            </motion.span>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="hero__content container"
        style={{
          y: scrollY,
          opacity: scrollOpacity,
          scale: contentScale,
          x: parallaxX,
          rotateX: tiltX,
          rotateY: tiltY,
          transformPerspective: 1000,
        }}
      >
        <motion.div
          className="hero__badge"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease }}
        >
          <span className="hero__badge-dot" />
          Launching soon · {BRAND.city}
        </motion.div>

        <HopiinSketchLogo className="hero__brand-sketch" />

        <h1 className="hero__title">
          {TITLE_LINES.map((line, lineIdx) => (
            <span key={lineIdx} className="hero__title-line">
              {line.map((word, wordIdx) => (
                <motion.span
                  key={word}
                  className={
                    lineIdx === 1 ? 'hero__title-word gradient-text' : 'hero__title-word'
                  }
                  initial={{ opacity: 0, y: 60, rotateX: -50, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }}
                  transition={{
                    delay: 1.85 + lineIdx * 0.12 + wordIdx * 0.09,
                    duration: 0.9,
                    ease,
                  }}
                  style={{ display: 'inline-block', transformOrigin: 'bottom center' }}
                >
                  {word}
                  {wordIdx < line.length - 1 ? '\u00a0' : ''}
                </motion.span>
              ))}
              {lineIdx < TITLE_LINES.length - 1 && <br />}
            </span>
          ))}
        </h1>

        <p className="hero__tagline">
          {TAGLINE_PARTS.map((part, i) => (
            <motion.span
              key={part.text}
              className={part.highlight ? 'hero__tagline-part hero__tagline-part--accent' : 'hero__tagline-part'}
              initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 2.25 + i * 0.12, duration: 0.7, ease }}
            >
              {part.text}
              {i < TAGLINE_PARTS.length - 1 ? '\u00a0' : ''}
            </motion.span>
          ))}
        </p>

        <motion.p
          className="hero__subtitle"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.55, duration: 0.9, ease }}
        >
          {SUBTITLE.split(' ').map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              className="hero__subtitle-word"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.6 + i * 0.025, duration: 0.4, ease }}
            >
              {word}{' '}
            </motion.span>
          ))}
        </motion.p>

        <motion.div
          className="hero__cta"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.85, duration: 0.8, ease }}
        >
          <motion.a
            href="#waitlist"
            className="btn btn--primary"
            whileHover={{ scale: 1.06, y: -4 }}
            whileTap={{ scale: 0.96 }}
          >
            <span className="btn__shimmer" aria-hidden />
            <span className="btn__glow" aria-hidden />
            Join the waitlist
            <motion.span
              className="btn__arrow"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              →
            </motion.span>
          </motion.a>
          <motion.a
            href="#story"
            className="btn btn--ghost"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
          >
            <span className="btn__ring" aria-hidden />
            Watch the story
          </motion.a>
        </motion.div>

        <motion.div
          className="hero__stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.05, duration: 0.9, ease }}
        >
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="hero__stat"
              initial={{ opacity: 0, y: 24, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 3.1 + i * 0.1, duration: 0.65, ease }}
              whileHover={{ y: -5, scale: 1.06 }}
            >
              <span className="hero__stat-value">{stat.value}</span>
              <span className="hero__stat-label">{stat.label}</span>
              <span className="hero__stat-glow" aria-hidden />
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <ScrollIndicator />
    </section>
  );
}
