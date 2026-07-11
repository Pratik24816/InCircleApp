import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useRef } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import './hopiin-scroll.css';

const WORD = 'Hopiin';
const DEPTH_LAYERS = 16;
const LETTERS = WORD.split('');
const ACCENT_START = 3;

type LetterProps = {
  char: string;
  index: number;
  progress: MotionValue<number>;
  accent: boolean;
  mobile: boolean;
};

function ScrollLetter({ char, index, progress, accent, mobile }: LetterProps) {
  const y = useTransform(
    progress,
    [0, 0.35, 0.65],
    mobile ? [40 + index * 6, 0, -4] : [80 + index * 12, 0, -8],
  );
  const rotateY = useTransform(
    progress,
    [0, 0.4, 0.7],
    mobile ? [12 - index * 2, 0, -2] : [40 - index * 6, 0, -6],
  );
  const opacity = useTransform(progress, [0, 0.15 + index * 0.04, 0.42, 0.58], [0, 1, 1, 0]);
  const scale = useTransform(progress, [0, 0.45, 0.75], mobile ? [0.75, 1, 1] : [0.6, 1, 1.02]);

  return (
    <motion.span
      className={accent ? 'hopiin-scroll__letter hopiin-scroll__letter--accent' : 'hopiin-scroll__letter'}
      style={{ y, rotateY, opacity, scale, transformPerspective: mobile ? 600 : 900 }}
    >
      {char}
    </motion.span>
  );
}

function ExtrudedWord({ progress, mobile }: { progress: MotionValue<number>; mobile: boolean }) {
  const shineX = useTransform(progress, [0.2, 0.75], ['-120%', '220%']);
  const depthLayers = mobile ? 0 : DEPTH_LAYERS;

  return (
    <div className="hopiin-scroll__extrude" aria-hidden>
      {Array.from({ length: depthLayers }).map((_, i) => (
        <span
          key={i}
          className="hopiin-scroll__depth"
          style={{
            transform: `translateZ(${-i * 1.2}px) translateY(${i * 0.65}px)`,
            opacity: Math.max(0.04, 0.55 - i * 0.032),
          }}
        >
          {WORD}
        </span>
      ))}
      <span className="hopiin-scroll__face">
        <span className="hopiin-scroll__face-hop">Hop</span>
        <span className="hopiin-scroll__face-iin">iin</span>
        <motion.span className="hopiin-scroll__shine" style={{ left: shineX }} />
      </span>
    </div>
  );
}

export function HopiinScrollReveal() {
  const containerRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const stageScale = useTransform(
    scrollYProgress,
    [0, 0.42, 0.72, 1],
    isMobile ? [0.55, 0.95, 0.92, 0.88] : [0.28, 1.08, 1, 0.92],
  );
  const stageRotateX = useTransform(
    scrollYProgress,
    [0, 0.45, 0.8, 1],
    isMobile ? [10, 0, -2, -6] : [22, 0, -4, -14],
  );
  const stageRotateY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    isMobile ? [-3, 0, 2] : [-8, 0, 6],
  );
  const stageY = useTransform(
    scrollYProgress,
    [0, 0.45, 1],
    isMobile ? [60, 0, -30] : [140, 0, -60],
  );
  const stageOpacity = useTransform(scrollYProgress, [0, 0.1, 0.82, 1], [0, 1, 1, 0]);
  const blur = useTransform(scrollYProgress, [0.88, 1], [0, isMobile ? 8 : 14]);
  const filter = useMotionTemplate`blur(${blur}px)`;

  const bgScale = useTransform(scrollYProgress, [0, 1], [1, isMobile ? 1.1 : 1.25]);
  const ringScale = useTransform(scrollYProgress, [0, 0.5, 1], isMobile ? [0.6, 1, 1.15] : [0.5, 1.2, 1.5]);
  const ringOpacity = useTransform(scrollYProgress, [0, 0.25, 0.7, 1], [0, 0.7, 0.5, 0]);
  const captionOpacity = useTransform(scrollYProgress, [0.35, 0.55, 0.8, 0.95], [0, 1, 1, 0]);
  const captionY = useTransform(scrollYProgress, [0.35, 0.55], [20, 0]);

  return (
    <section
      ref={containerRef}
      className={`hopiin-scroll${isMobile ? ' hopiin-scroll--mobile' : ''}`}
      aria-label="Hopiin scroll reveal"
    >
      <div className="hopiin-scroll__sticky">
        <motion.div className="hopiin-scroll__bg" style={{ scale: bgScale }} aria-hidden>
          <div className="hopiin-scroll__bg-glow hopiin-scroll__bg-glow--green" />
          <div className="hopiin-scroll__bg-glow hopiin-scroll__bg-glow--blue" />
          <div className="hopiin-scroll__bg-grid" />
        </motion.div>

        <motion.div
          className="hopiin-scroll__ring"
          style={{ scale: ringScale, opacity: ringOpacity }}
          aria-hidden
        />

        <motion.div
          className="hopiin-scroll__stage"
          style={{
            scale: stageScale,
            rotateX: stageRotateX,
            rotateY: stageRotateY,
            y: stageY,
            opacity: stageOpacity,
            filter,
            transformPerspective: isMobile ? 800 : 1200,
          }}
        >
          <ExtrudedWord progress={scrollYProgress} mobile={isMobile} />

          {!isMobile && (
            <div className="hopiin-scroll__letters" aria-label={WORD}>
              {LETTERS.map((char, i) => (
                <ScrollLetter
                  key={`${char}-${i}`}
                  char={char}
                  index={i}
                  progress={scrollYProgress}
                  accent={i >= ACCENT_START}
                  mobile={false}
                />
              ))}
            </div>
          )}
        </motion.div>

        <motion.p
          className="hopiin-scroll__caption"
          style={{ opacity: captionOpacity, y: captionY }}
        >
          Your city. Alive tonight.
        </motion.p>
      </div>
    </section>
  );
}
