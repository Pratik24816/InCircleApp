import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from '../hooks/useInView';
import { FeatureCard3D, type FeatureItem } from './FeatureCard3D';
import { FeaturesOrb } from './FeaturesOrb';
import './features.css';

const features: FeatureItem[] = [
  {
    icon: '🌙',
    title: 'Tonight',
    tagline: 'What’s happening right now',
    description:
      'A cinematic row of plans starting tonight — riverfront walks, pickup cricket, late chai. Your city, alive after dark.',
    gradient: 'linear-gradient(145deg, rgba(140,255,79,0.22) 0%, rgba(2,6,23,0.9) 55%)',
    layout: 'hero',
    mesh: 'rgba(140, 255, 79, 0.35)',
    accent: '#8cff4f',
    visual: 'chips',
  },
  {
    icon: '🔥',
    title: 'Hop In',
    tagline: 'One tap to join',
    description:
      'No lengthy RSVP flows. See a plan you like? Tap Hop In. You\'re on the list. The host knows. You\'re set.',
    gradient: 'linear-gradient(145deg, rgba(255,90,95,0.18) 0%, rgba(2,6,23,0.92) 50%)',
    layout: 'highlight',
    mesh: 'rgba(255, 90, 95, 0.3)',
    accent: '#ff5a5f',
    visual: 'button',
  },
  {
    icon: '✨',
    title: 'Host a plan',
    tagline: 'Publish in seconds',
    description:
      'Smart presets, live preview, sticky publish. Your plan goes live like a premiere.',
    gradient: 'linear-gradient(160deg, rgba(77,181,255,0.2), rgba(2,6,23,0.88))',
    layout: 'standard',
    mesh: 'rgba(77, 181, 255, 0.28)',
    accent: '#4db5ff',
    visual: 'publish',
  },
  {
    icon: '📍',
    title: 'Nearby',
    tagline: 'Hyperlocal discovery',
    description:
      'Riverfront, CG Road, campus — plans anchored to real neighborhoods.',
    gradient: 'linear-gradient(160deg, rgba(140,255,79,0.14), rgba(2,6,23,0.9))',
    layout: 'standard',
    mesh: 'rgba(140, 255, 79, 0.22)',
    accent: '#8cff4f',
    visual: 'map',
  },
  {
    icon: '🏷️',
    title: 'Vibe filters',
    tagline: 'Find your scene',
    description:
      'Cricket, chai runs, rooftop nights — chip filters that match your mood tonight.',
    gradient: 'linear-gradient(160deg, rgba(168,85,247,0.16), rgba(2,6,23,0.9))',
    layout: 'standard',
    mesh: 'rgba(168, 85, 247, 0.25)',
    accent: '#a855f7',
    visual: 'filters',
  },
  {
    icon: '👥',
    title: 'Real faces',
    tagline: 'Social proof that matters',
    description:
      'Host avatars, participant stacks, vibe tags — you\'re joining people, not events.',
    gradient: 'linear-gradient(160deg, rgba(255,176,32,0.16), rgba(2,6,23,0.9))',
    layout: 'wide',
    mesh: 'rgba(255, 176, 32, 0.25)',
    accent: '#ffb020',
    visual: 'avatars',
  },
  {
    icon: '💬',
    title: 'Plan chats',
    tagline: 'Crew threads',
    description:
      'Every plan gets its own thread — coordinate meetups, drop hype, confirm before you step out.',
    gradient: 'linear-gradient(160deg, rgba(77,181,255,0.15), rgba(2,6,23,0.9))',
    layout: 'standard',
    mesh: 'rgba(77, 181, 255, 0.22)',
    accent: '#4db5ff',
    visual: 'chat',
  },
  {
    icon: '🍿',
    title: 'Cheesy notifications',
    tagline: 'Zomato energy, plan edition',
    description:
      '"Plot twist — someone joined your plan." Lock-screen alerts with personality. RSVPs deserve drama.',
    gradient: 'linear-gradient(90deg, rgba(140,255,79,0.12), rgba(77,181,255,0.1), rgba(2,6,23,0.95))',
    layout: 'banner',
    mesh: 'rgba(140, 255, 79, 0.2)',
    accent: '#8cff4f',
    visual: 'notif',
  },
];

const stats = [
  { value: '1-Tap', label: 'RSVP' },
  { value: 'Live', label: 'Feed' },
  { value: 'Real', label: 'Faces' },
  { value: 'IRL', label: 'Ready' },
];

const marqueeItems = [
  'Tonight feed',
  'Hop In',
  'Host plans',
  'Nearby vibes',
  'Plan chats',
  'Cheesy alerts',
  'Vibe filters',
  'My events',
];

const titleWords = ['Everything', 'you', 'need.'];
const titleWords2 = ['Nothing', 'you', "don't."];

export function FeatureShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const [headerRef, headerInView] = useInView<HTMLElement>({ threshold: 0.2 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['-6%', '6%']);
  const gridRotate = useTransform(scrollYProgress, [0, 1], [0, 8]);

  return (
    <section ref={sectionRef} className="features" id="features">
      <FeaturesOrb />
      <div className="features__orb features__orb--left" aria-hidden>
        <FeaturesOrb />
      </div>

      <motion.div
        className="features__grid-bg"
        style={{ y: bgY, rotate: gridRotate }}
        aria-hidden
      />
      <div className="features__particles" aria-hidden>
        {Array.from({ length: 18 }).map((_, i) => (
          <span key={i} className="features__particle" style={{ ['--i' as string]: i }} />
        ))}
      </div>
      <div className="features__beam features__beam--1" aria-hidden />
      <div className="features__beam features__beam--2" aria-hidden />

      <div className="container features__container">
        <header ref={headerRef} className="features__header">
          <motion.div
            className="features__eyebrow-wrap"
            initial={{ opacity: 0, x: -20 }}
            animate={headerInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="features__eyebrow-line" />
            <p className="features__eyebrow">Features</p>
            <span className="features__eyebrow-line" />
          </motion.div>

          <div className="features__title-wrap">
            <motion.span
              className="features__title-bg"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={headerInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.05, duration: 0.8 }}
              aria-hidden
            >
              08
            </motion.span>

            <h2 className="features__title">
              <span className="features__title-row">
                {titleWords.map((word, i) => (
                  <motion.span
                    key={word}
                    className="features__title-word"
                    initial={{ opacity: 0, y: 44, rotateX: -50, filter: 'blur(8px)' }}
                    animate={
                      headerInView
                        ? { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }
                        : {}
                    }
                    transition={{
                      delay: 0.1 + i * 0.08,
                      duration: 0.75,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
              <span className="features__title-row features__title-row--accent">
                {titleWords2.map((word, i) => (
                  <motion.span
                    key={word}
                    className={`features__title-word ${i === 0 ? 'gradient-text' : ''}`}
                    initial={{ opacity: 0, y: 44, rotateX: -50, filter: 'blur(8px)' }}
                    animate={
                      headerInView
                        ? { opacity: 1, y: 0, rotateX: 0, filter: 'blur(0px)' }
                        : {}
                    }
                    transition={{
                      delay: 0.35 + i * 0.08,
                      duration: 0.75,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
            </h2>
          </div>

          <motion.p
            className="features__lede"
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.55, duration: 0.7 }}
          >
            Eight superpowers. One app. Built for spontaneous nights out — no clutter, no
            friction, just vibes.
          </motion.p>

          <motion.div
            className="features__stats"
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.62 }}
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                className="features__stat"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={headerInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.65 + i * 0.07, type: 'spring', stiffness: 400 }}
                whileHover={{ y: -4, scale: 1.04 }}
              >
                <span className="features__stat-value">{s.value}</span>
                <span className="features__stat-label">{s.label}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="features__icon-strip"
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.75 }}
          >
            {features.map((f, i) => (
              <motion.span
                key={f.title}
                className="features__icon-chip"
                title={f.title}
                initial={{ opacity: 0, y: 12 }}
                animate={headerInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.78 + i * 0.04 }}
                whileHover={{ scale: 1.15, y: -3 }}
              >
                {f.icon}
              </motion.span>
            ))}
          </motion.div>
        </header>

        <div className="features__marquee-wrap" aria-hidden>
          <div className="features__marquee">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={`${item}-${i}`} className="features__marquee-item">
                {item}
                <span className="features__marquee-dot">✦</span>
              </span>
            ))}
          </div>
        </div>

        <div className="features__bento">
          {features.map((f, i) => (
            <FeatureCard3D key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
