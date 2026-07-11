import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import { type MouseEvent } from 'react';
import { useInView } from '../hooks/useInView';
import './features.css';

export type FeatureVisual =
  | 'chips'
  | 'button'
  | 'publish'
  | 'map'
  | 'avatars'
  | 'notif'
  | 'chat'
  | 'filters';

export type FeatureItem = {
  icon: string;
  title: string;
  tagline: string;
  description: string;
  gradient: string;
  layout: 'hero' | 'highlight' | 'standard' | 'wide' | 'banner';
  mesh: string;
  accent: string;
  visual: FeatureVisual;
};

type Props = {
  feature: FeatureItem;
  index: number;
};

function FeatureCardVisual({ visual, active }: { visual: FeatureVisual; active: boolean }) {
  switch (visual) {
    case 'chips':
      return (
        <div className="fc-visual fc-visual--chips">
          {['🌙 Walk', '☕ Chai', '🏏 Cricket'].map((c, i) => (
            <motion.span
              key={c}
              className={`fc-visual__chip ${i === 2 ? 'fc-visual__chip--on' : ''}`}
              animate={active ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              {c}
            </motion.span>
          ))}
        </div>
      );
    case 'button':
      return (
        <motion.div
          className="fc-visual__hop-btn"
          animate={active ? { scale: [1, 1.04, 1] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Hop In ⚡
        </motion.div>
      );
    case 'publish':
      return (
        <div className="fc-visual fc-visual--publish">
          <motion.div
            className="fc-visual__progress"
            initial={{ scaleX: 0 }}
            animate={active ? { scaleX: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.8 }}
          />
          <span className="fc-visual__pub">Publish 🔥</span>
        </div>
      );
    case 'map':
      return (
        <div className="fc-visual fc-visual--map">
          <motion.span
            className="fc-visual__pin"
            animate={active ? { y: [0, -6, 0] } : {}}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            📍
          </motion.span>
          <span className="fc-visual__map-label">CG Road · 0.8 km</span>
        </div>
      );
    case 'avatars':
      return (
        <div className="fc-visual fc-visual--avatars">
          {[0, 1, 2, 3].map(i => (
            <motion.span
              key={i}
              className="fc-visual__avatar"
              style={{ ['--i' as string]: i }}
              initial={{ scale: 0 }}
              animate={active ? { scale: 1 } : {}}
              transition={{ delay: 0.2 + i * 0.08, type: 'spring' }}
            />
          ))}
          <span className="fc-visual__avatar-count">+12 joined</span>
        </div>
      );
    case 'notif':
      return (
        <motion.div
          className="fc-visual__notif"
          initial={{ opacity: 0, y: 10 }}
          animate={active ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.35 }}
        >
          <span>🔔 Plot twist — someone joined!</span>
        </motion.div>
      );
    case 'chat':
      return (
        <div className="fc-visual fc-visual--chat">
          {['See you at 8?', 'On my way 🏃'].map((m, i) => (
            <motion.span
              key={m}
              className={`fc-visual__bubble ${i === 1 ? 'fc-visual__bubble--alt' : ''}`}
              initial={{ opacity: 0, x: i ? 12 : -12 }}
              animate={active ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.15 }}
            >
              {m}
            </motion.span>
          ))}
        </div>
      );
    case 'filters':
      return (
        <div className="fc-visual fc-visual--filters">
          {['🎵 Music', '🍕 Food', '🌃 Night'].map((f, i) => (
            <motion.span
              key={f}
              className="fc-visual__filter"
              animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.25 + i * 0.08 }}
            >
              {f}
            </motion.span>
          ))}
        </div>
      );
    default:
      return null;
  }
}

export function FeatureCard3D({ feature, index }: Props) {
  const [cardRef, inView] = useInView<HTMLElement>({ threshold: 0.25 });
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [14, -14]), {
    stiffness: 220,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), {
    stiffness: 220,
    damping: 20,
  });
  const glareX = useSpring(useTransform(mouseX, [-0.5, 0.5], [0, 100]), {
    stiffness: 200,
    damping: 25,
  });
  const glareY = useSpring(useTransform(mouseY, [-0.5, 0.5], [0, 100]), {
    stiffness: 200,
    damping: 25,
  });

  const onMove = (e: MouseEvent<HTMLElement>) => {
    const el = cardRef.current;
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
    <motion.article
      ref={cardRef}
      className={`feature-card feature-card--${feature.layout}`}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        background: feature.gradient,
        ['--mesh-color' as string]: feature.mesh,
        ['--accent' as string]: feature.accent,
      }}
      initial={{ opacity: 0, y: 70, scale: 0.92, filter: 'blur(6px)' }}
      animate={
        inView
          ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
          : {}
      }
      transition={{
        delay: 0.06 * index,
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <motion.div
        className="feature-card__glow"
        animate={inView ? { opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 4, repeat: Infinity, delay: index * 0.2 }}
        aria-hidden
      />
      <div className="feature-card__mesh" aria-hidden />
      <motion.div
        className="feature-card__shimmer"
        animate={inView ? { x: ['-100%', '200%'] } : {}}
        transition={{ duration: 3, repeat: Infinity, delay: index * 0.4, ease: 'linear' }}
        aria-hidden
      />
      <motion.div
        className="feature-card__glare"
        style={{ left: glareX, top: glareY }}
        aria-hidden
      />
      <div className="feature-card__border" aria-hidden />

      <div className="feature-card__inner">
        <div className="feature-card__top">
          <motion.span
            className="feature-card__icon"
            aria-hidden
            animate={inView ? { y: [0, -8, 0], rotate: [0, 4, 0, -4, 0] } : {}}
            transition={{
              delay: 0.5 + index * 0.1,
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {feature.icon}
          </motion.span>
          <span className="feature-card__index">{String(index + 1).padStart(2, '0')}</span>
        </div>

        <p className="feature-card__tagline">{feature.tagline}</p>
        <h3 className="feature-card__title">{feature.title}</h3>

        <FeatureCardVisual visual={feature.visual} active={inView} />

        <p className="feature-card__desc">{feature.description}</p>

        <motion.div
          className="feature-card__pulse"
          animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: index * 0.3 }}
          aria-hidden
        />
      </div>
    </motion.article>
  );
}
