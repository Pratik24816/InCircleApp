import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LogoImage } from './shared';
import { PLANS } from './constants';
import { GameOutcome, GamePlayfield } from './GameOutcome';

type Item = { id: number; x: number; y: number; emoji: string; good: boolean; speed: number };

const W = 360;
const H = 380;
const DURATION = 20;

export function LogoDodge() {
  const [playerX, setPlayerX] = useState(W / 2);
  const [items, setItems] = useState<Item[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const [won, setWon] = useState(false);
  const [msg, setMsg] = useState('Move ◀ ▶ — dodge feeds, catch plans!');
  const idRef = useRef(0);
  const scoreRef = useRef(0);
  const playerRef = useRef(W / 2);

  useEffect(() => {
    playerRef.current = playerX;
  }, [playerX]);

  useEffect(() => {
    if (!playing || done) return;
    const spawn = setInterval(() => {
      const good = Math.random() > 0.45;
      idRef.current += 1;
      setItems(prev => [
        ...prev,
        {
          id: idRef.current,
          x: 40 + Math.random() * (W - 80),
          y: -20,
          emoji: good ? PLANS[Math.floor(Math.random() * PLANS.length)].emoji : '📱',
          good,
          speed: 2.2 + Math.random() * 2.2,
        },
      ]);
    }, 650);
    return () => clearInterval(spawn);
  }, [playing, done]);

  useEffect(() => {
    if (!playing || done) return;
    const tick = setInterval(() => {
      setItems(prev => {
        const next: Item[] = [];
        for (const it of prev) {
          const ny = it.y + it.speed;
          if (ny > H - 60) {
            if (Math.abs(it.x - playerRef.current) < 42) {
              if (it.good) {
                scoreRef.current += 1;
                setScore(scoreRef.current);
              } else {
                setDone(true);
                setPlaying(false);
                setWon(false);
                setMsg('Hit by the endless feed!');
              }
            }
          } else if (ny < H + 20) {
            next.push({ ...it, y: ny });
          }
        }
        return next;
      });
    }, 24);
    return () => clearInterval(tick);
  }, [playing, done]);

  useEffect(() => {
    if (!playing || done) return;
    const iv = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setDone(true);
          setPlaying(false);
          setWon(true);
          setMsg('You survived!');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [playing, done]);

  const move = (d: -1 | 1) => {
    if (!playing) return;
    setPlayerX(x => Math.max(44, Math.min(W - 44, x + d * 32)));
  };

  const start = () => {
    setItems([]);
    scoreRef.current = 0;
    setScore(0);
    setPlayerX(W / 2);
    setTimeLeft(DURATION);
    setDone(false);
    setWon(false);
    setPlaying(true);
    setMsg('Go!');
  };

  const reset = () => {
    setDone(false);
    setWon(false);
    setMsg('Move ◀ ▶ — dodge feeds, catch plans!');
    start();
  };

  return (
    <div className="lg-game lg-game--dodge">
      <GamePlayfield>
        <div className="lg-dodge__arena" style={{ width: W, height: H }}>
          {items.map(it => (
            <motion.div
              key={it.id}
              className={`lg-dodge__item${it.good ? '' : ' lg-dodge__item--bad'}`}
              style={{ left: it.x, top: it.y }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              {it.emoji}
            </motion.div>
          ))}
          <motion.div
            className="lg-dodge__player"
            style={{ left: playerX }}
            animate={playing ? { y: [0, -4, 0] } : {}}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <LogoImage size={72} />
          </motion.div>
        </div>

        <GameOutcome
          show={done}
          type={won ? 'win' : 'loss'}
          emoji={won ? '🏃' : '📱'}
          title={won ? `Survived! ${score} plans caught` : `Game over — ${score} caught`}
          subtitle={won ? 'IRL beats the feed' : 'Dodge the scroll, catch real plans'}
          onPlayAgain={reset}
        />
      </GamePlayfield>

      <div className="lg-dodge__controls">
        <motion.button type="button" onClick={() => move(-1)} disabled={!playing} whileTap={{ scale: 0.9 }} aria-label="Move left">◀</motion.button>
        <span className="lg-game__hud--pill">Score: <strong>{score}</strong> · {timeLeft}s</span>
        <motion.button type="button" onClick={() => move(1)} disabled={!playing} whileTap={{ scale: 0.9 }} aria-label="Move right">▶</motion.button>
      </div>
      <p className="lg-game__msg">{msg}</p>
      {!playing && !done && (
        <motion.button
          type="button"
          className="lg-game__btn lg-game__btn--primary lg-game__btn--lg"
          onClick={start}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
        >
          Start
        </motion.button>
      )}
    </div>
  );
}
