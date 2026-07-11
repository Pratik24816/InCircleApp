import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { LOGO_SRC } from './shared';
import { PLANS } from './constants';
import { GameOutcome, GamePlayfield } from './GameOutcome';

type CardFace = { kind: 'logo' | 'emoji' | 'text'; value: string };

const PAIRS: CardFace[] = [
  { kind: 'logo', value: 'logo' },
  { kind: 'emoji', value: PLANS[0].emoji },
  { kind: 'emoji', value: PLANS[1].emoji },
  { kind: 'emoji', value: PLANS[2].emoji },
  { kind: 'emoji', value: PLANS[3].emoji },
  { kind: 'text', value: 'Hop in!' },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck() {
  return shuffle(
    PAIRS.flatMap((face, i) => [
      { id: i * 2, face, matched: false },
      { id: i * 2 + 1, face, matched: false },
    ]),
  );
}

export function LogoMemoryMatch() {
  const [cards, setCards] = useState(buildDeck);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState(0);
  const [msg, setMsg] = useState('Match pairs — find the logo!');
  const [lock, setLock] = useState(false);
  const [flash, setFlash] = useState<'match' | 'miss' | null>(null);
  const [won, setWon] = useState(false);

  const flip = useCallback(
    (id: number) => {
      if (lock || won) return;
      const card = cards.find(c => c.id === id);
      if (!card || card.matched || flipped.includes(id)) return;

      const next = [...flipped, id];
      setFlipped(next);

      if (next.length === 2) {
        setLock(true);
        const [a, b] = next.map(i => cards.find(c => c.id === i)!);
        if (a.face.kind === b.face.kind && a.face.value === b.face.value) {
          setFlash('match');
          setCards(prev => prev.map(c => (c.id === a.id || c.id === b.id ? { ...c, matched: true } : c)));
          setMatched(m => {
            const n = m + 1;
            if (n >= PAIRS.length) {
              setWon(true);
              setMsg('All matched!');
            } else {
              setMsg('Match!');
            }
            return n;
          });
          setFlipped([]);
          setLock(false);
          setTimeout(() => setFlash(null), 500);
        } else {
          setFlash('miss');
          setMsg('No match — try again');
          setTimeout(() => {
            setFlipped([]);
            setLock(false);
            setFlash(null);
          }, 700);
        }
      }
    },
    [cards, flipped, lock, won],
  );

  const reset = () => {
    setCards(buildDeck());
    setFlipped([]);
    setMatched(0);
    setMsg('Match pairs — find the logo!');
    setLock(false);
    setFlash(null);
    setWon(false);
  };

  const renderFace = (face: CardFace) => {
    if (face.kind === 'logo') {
      return <img src={LOGO_SRC} alt="" className="lg-memory__logo" draggable={false} />;
    }
    if (face.kind === 'emoji') return <span className="lg-memory__emoji">{face.value}</span>;
    return <span className="lg-memory__text">{face.value}</span>;
  };

  return (
    <div className="lg-game lg-game--memory">
      <GamePlayfield className={`lg-memory__field${flash ? ` lg-memory__field--${flash}` : ''}`}>
        <div className="lg-memory__grid">
          {cards.map(card => {
            const isOpen = card.matched || flipped.includes(card.id);
            return (
              <motion.button
                key={card.id}
                type="button"
                className={`lg-memory__card${isOpen ? ' lg-memory__card--open' : ''}${card.matched ? ' lg-memory__card--matched' : ''}`}
                onClick={() => flip(card.id)}
                disabled={card.matched}
                whileTap={{ scale: 0.95 }}
                animate={card.matched ? { scale: [1, 1.06, 1] } : {}}
              >
                {isOpen ? renderFace(card.face) : '?'}
              </motion.button>
            );
          })}
        </div>

        <GameOutcome
          show={won}
          type="win"
          emoji="🃏"
          title="Memory master!"
          subtitle="You matched every pair"
          onPlayAgain={reset}
        />
      </GamePlayfield>

      <div className="lg-game__hud lg-game__hud--pill">
        <span>Matched: <strong>{matched}/{PAIRS.length}</strong></span>
      </div>
      <p className="lg-game__msg">{msg}</p>
    </div>
  );
}
