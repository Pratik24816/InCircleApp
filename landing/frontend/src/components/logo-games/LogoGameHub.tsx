import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from '../../hooks/useInView';
import { BRAND } from '../../constants/brand';
import { GAMES, type GameId } from './constants';
import { SpinStopLogo } from './SpinStopLogo';
import { LogoMemoryMatch } from './LogoMemoryMatch';
import { TraceTheLogo } from './TraceTheLogo';
import { LogoDodge } from './LogoDodge';
import '../sections.css';
import './logo-games.css';

function GameRenderer({ id }: { id: GameId }) {
  switch (id) {
    case 'spin-stop':
      return <SpinStopLogo />;
    case 'memory':
      return <LogoMemoryMatch />;
    case 'trace':
      return <TraceTheLogo />;
    case 'dodge':
      return <LogoDodge />;
    default:
      return null;
  }
}

export function LogoGameHub() {
  const [ref, inView] = useInView<HTMLElement>();
  const [active, setActive] = useState<GameId>('spin-stop');
  const meta = GAMES.find(g => g.id === active)!;

  return (
    <section ref={ref} className="section logo-games" id="play">
      <div className="container">
        <motion.div
          className="logo-games__header"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <span className="section__eyebrow">Play with {BRAND.name}</span>
          <h2 className="section__title">
            Try the logo.
            <br />
            <span className="gradient-text">Feel the vibe.</span>
          </h2>
          <p className="logo-games__intro">
            Four mini-games built with your Hopiin logo — spin, match, trace, and dodge.
            Pick one below.
          </p>
        </motion.div>

        <motion.div
          className="logo-games__tabs"
          role="tablist"
          aria-label="Logo mini-games"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          {GAMES.map(game => (
            <button
              key={game.id}
              type="button"
              role="tab"
              aria-selected={active === game.id}
              className={`logo-games__tab${active === game.id ? ' logo-games__tab--active' : ''}`}
              onClick={() => setActive(game.id)}
            >
              <span className="logo-games__tab-emoji">{game.emoji}</span>
              <span className="logo-games__tab-label">{game.title}</span>
            </button>
          ))}
        </motion.div>

        <motion.div
          className="logo-games__stage"
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.7 }}
        >
          <div className="logo-games__stage-head">
            <h3>{meta.emoji} {meta.title}</h3>
            <p>{meta.tagline}</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              className="logo-games__canvas"
              role="tabpanel"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35 }}
            >
              <GameRenderer id={active} />
            </motion.div>
          </AnimatePresence>

          <a href="#waitlist" className="logo-games__cta btn btn--primary">
            Like it? Join the waitlist →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
