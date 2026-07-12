import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useInView } from '../hooks/useInView';
import { FeaturesOrb } from './FeaturesOrb';
import { PhoneMock3D, type PhoneVisual } from './PhoneMock3D';
import './experience.css';

const ACT_COLORS: Record<string, string> = {
  Discover: '#4db5ff',
  Join: '#8cff4f',
  Host: '#ffb020',
  Connect: '#ff6b8a',
};

const steps: {
  step: string;
  act: string;
  title: string;
  desc: string;
  visual: PhoneVisual;
  tab: string;
  icon: string;
}[] = [
  {
    step: '01',
    act: 'Discover',
    title: 'Home feed',
    desc: 'Tonight stories, featured plans, and nearby vibes — your city’s pulse in one scroll.',
    visual: 'feed',
    tab: '🏠 Home',
    icon: '🏠',
  },
  {
    step: '02',
    act: 'Discover',
    title: 'Activity details',
    desc: 'Cover art, host, countdown, vibe tags — everything before you commit.',
    visual: 'details',
    tab: 'Plan page',
    icon: '📋',
  },
  {
    step: '03',
    act: 'Join',
    title: 'Tap Hop In',
    desc: 'One button. Instant RSVP. Host gets the hype notification. You get the confirmation.',
    visual: 'join',
    tab: 'RSVP',
    icon: '⚡',
  },
  {
    step: '04',
    act: 'Join',
    title: 'Notifications',
    desc: 'Cheesy lock-screen energy — plot twists, legends, and last-call drama.',
    visual: 'notifications',
    tab: '🔔 Alerts',
    icon: '🔔',
  },
  {
    step: '05',
    act: 'Host',
    title: 'Create a plan',
    desc: 'Tonight, tomorrow, weekend chips. Live preview. Sticky Publish 🔥 footer.',
    visual: 'create',
    tab: '➕ Create',
    icon: '✨',
  },
  {
    step: '06',
    act: 'Host',
    title: 'My events',
    desc: 'Joined, created, and completed — every plan you care about in one place.',
    visual: 'events',
    tab: '📅 Events',
    icon: '📅',
  },
  {
    step: '07',
    act: 'Connect',
    title: 'Chats',
    desc: 'Plan crew threads — coordinate, hype, and confirm before you meet IRL.',
    visual: 'chats',
    tab: '💬 Chats',
    icon: '💬',
  },
  {
    step: '08',
    act: 'Connect',
    title: 'Profile',
    desc: 'Your stats, interests, and settings — the social identity behind every hop in.',
    visual: 'profile',
    tab: '👤 Profile',
    icon: '👤',
  },
];

function ExperienceStep({
  step,
  index,
  total,
}: {
  step: (typeof steps)[0];
  index: number;
  total: number;
}) {
  const [stepRef, inView] = useInView<HTMLDivElement>({ threshold: 0.22 });
  const reversed = index % 2 === 1;
  const actColor = ACT_COLORS[step.act] ?? '#8cff4f';

  const { scrollYProgress } = useScroll({
    target: stepRef,
    offset: ['start end', 'end start'],
  });
  const phoneY = useTransform(scrollYProgress, [0, 0.45, 1], [60, 0, -60]);
  const phoneRotate = useTransform(
    scrollYProgress,
    [0, 1],
    reversed ? [10, -10] : [-10, 10],
  );

  return (
    <motion.div
      ref={stepRef}
      className={`exp-step ${reversed ? 'exp-step--reverse' : ''}`}
      style={{ ['--act-color' as string]: actColor }}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : {}}
      transition={{ duration: 0.5 }}
    >
      <div className="exp-step__timeline">
        <motion.div
          className="exp-step__node"
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.1 }}
        >
          <span className="exp-step__node-inner" />
        </motion.div>
        {index < total - 1 ? (
          <motion.div
            className="exp-step__line"
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            aria-hidden
          />
        ) : null}
      </div>

      <motion.div
        className="exp-step__copy"
        initial={{ opacity: 0, x: reversed ? 50 : -50 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ delay: 0.15, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="exp-step__copy-card">
          <span className="exp-step__act">{step.act}</span>
          <span className="exp-step__tab">{step.tab}</span>
          <span className="exp-step__num">{step.step}</span>
          <h3 className="exp-step__title">{step.title}</h3>
          <p className="exp-step__desc">{step.desc}</p>
          <div className="exp-step__chip-row">
            <span className="exp-step__chip">{step.icon} Screen {step.step}</span>
          </div>
        </div>
      </motion.div>

      <div className="exp-step__phone-scene">
        <motion.div
          className="exp-step__phone-glow"
          animate={inView ? { scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden
        />
        {[0, 1].map(i => (
          <motion.span
            key={i}
            className="exp-step__particle"
            style={{ ['--pi' as string]: i }}
            animate={
              inView
                ? { y: [0, -16 - i * 4, 0], opacity: [0, 0.35, 0], scale: [0.5, 0.8, 0.5] }
                : {}
            }
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
            aria-hidden
          />
        ))}

        <motion.div
          className="exp-step__phone"
          initial={{ opacity: 0, y: 40, rotateY: reversed ? -12 : 12, scale: 0.94 }}
          animate={inView ? { opacity: 1, y: 0, rotateY: 0, scale: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
        >
          <PhoneMock3D
            visual={step.visual}
            active={inView}
            scrollRotate={phoneRotate}
            scrollY={phoneY}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

export function ExperienceFlow() {
  const sectionRef = useRef<HTMLElement>(null);
  const [headerRef, headerInView] = useInView<HTMLElement>();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['-8%', '8%']);
  const gridOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 0.6, 0.6, 0]);

  const titleA = ['Every', 'screen.'];
  const titleB = ['One', 'vibe.'];

  return (
    <section ref={sectionRef} className="experience" id="experience">
      <motion.div className="experience__bg" style={{ y: bgY }} aria-hidden>
        <div className="experience__orb experience__orb--1" />
        <div className="experience__orb experience__orb--2" />
        <div className="experience__orb experience__orb--3" />
      </motion.div>

      <motion.div className="experience__grid" style={{ opacity: gridOpacity }} aria-hidden />

      <div className="experience__orb-3d" aria-hidden>
        <FeaturesOrb />
      </div>

      <div className="container experience__container">
        <header ref={headerRef} className="experience__header">
          <motion.div
            className="experience__eyebrow-wrap"
            initial={{ opacity: 0, y: 12 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
          >
            <span className="experience__eyebrow-line" />
            <p className="experience__eyebrow">The experience</p>
            <span className="experience__eyebrow-line" />
          </motion.div>

          <div className="experience__title-wrap">
            <motion.span
              className="experience__title-bg"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={headerInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.05, duration: 0.8 }}
              aria-hidden
            >
              08
            </motion.span>

            <h2 className="experience__title">
              <span className="experience__title-row">
                {titleA.map((w, i) => (
                  <motion.span
                    key={w}
                    className="experience__title-word"
                    initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                    animate={headerInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                    transition={{ delay: 0.1 + i * 0.1, duration: 0.65 }}
                  >
                    {w}
                  </motion.span>
                ))}
              </span>
              <span className="experience__title-row">
                {titleB.map((w, i) => (
                  <motion.span
                    key={w}
                    className={`experience__title-word ${i === 1 ? 'gradient-text' : ''}`}
                    initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                    animate={headerInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                    transition={{ delay: 0.35 + i * 0.1, duration: 0.65 }}
                  >
                    {w}
                  </motion.span>
                ))}
              </span>
            </h2>
          </div>

          <motion.p
            className="experience__lede"
            initial={{ opacity: 0 }}
            animate={headerInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.55 }}
          >
            Walk through every core screen — feed, details, RSVP, host, events, alerts, chats,
            and profile. Eight scenes. One app.
          </motion.p>

          <motion.div
            className="experience__screen-strip"
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.6 }}
          >
            {steps.map((s, i) => (
              <motion.span
                key={s.step}
                className="experience__screen-icon"
                title={s.title}
                initial={{ opacity: 0, scale: 0 }}
                animate={headerInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.65 + i * 0.05, type: 'spring', stiffness: 400 }}
                whileHover={{ scale: 1.2, y: -4 }}
              >
                {s.icon}
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            className="experience__acts"
            initial={{ opacity: 0, y: 12 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7 }}
          >
            {['Discover', 'Join', 'Host', 'Connect'].map((act, i) => (
              <motion.span
                key={act}
                className="experience__act-pill"
                style={{ ['--pill-color' as string]: ACT_COLORS[act] }}
                whileHover={{ scale: 1.06, y: -2 }}
                initial={{ opacity: 0, y: 10 }}
                animate={headerInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.75 + i * 0.06 }}
              >
                {act}
              </motion.span>
            ))}
          </motion.div>
        </header>

        <div className="experience__flow">
          {steps.map((s, i) => (
            <ExperienceStep key={s.step} step={s} index={i} total={steps.length} />
          ))}
        </div>
      </div>
    </section>
  );
}
