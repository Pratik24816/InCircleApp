import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import {
  CIRCLE_AVATARS,
  FEEDBACK_CATEGORIES,
  type CircleAvatarId,
  type FeedbackCategoryId,
} from '../constants/circleAvatars';
import { useInView } from '../hooks/useInView';
import {
  fetchCircleMembers,
  getReactedIds,
  reactToMember,
  submitCircleMember,
} from '../lib/circleApi';
import type { CircleMember } from '../lib/circleStorage';
import { CircleArena } from './CircleArena';
import { CircleBackground3D } from './CircleBackground3D';
import { CircleLiveFeed } from './CircleLiveFeed';
import { CircleShareCard } from './CircleShareCard';
import './hopiin-circle.css';

const POLL_MS = 20_000;

export function HopiinCircle() {
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.08 });
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<CircleAvatarId>('impressed');
  const [category, setCategory] = useState<FeedbackCategoryId>('hype');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [flyInId, setFlyInId] = useState<string | null>(null);
  const [shareMember, setShareMember] = useState<CircleMember | null>(null);
  const [reactedIds, setReactedIds] = useState<Set<string>>(() => getReactedIds());
  const [error, setError] = useState('');

  const selected = CIRCLE_AVATARS.find(a => a.id === selectedAvatar)!;

  const loadMembers = useCallback(async () => {
    const { members: next, fromApi } = await fetchCircleMembers();
    setMembers(next);
    setIsLive(fromApi);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMembers();
    const interval = setInterval(loadMembers, POLL_MS);
    return () => clearInterval(interval);
  }, [loadMembers]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim() || 'Anonymous';
    const trimmedMsg = message.trim();

    if (trimmedMsg.length < 8) {
      setError('Share at least a few words — the circle wants to hear you!');
      return;
    }
    if (trimmedMsg.length > 280) {
      setError('Keep it under 280 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const { member } = await submitCircleMember({
        avatarId: selectedAvatar,
        name: trimmedName,
        message: trimmedMsg,
        category,
      });

      await loadMembers();
      setFlyInId(member.id);
      setHighlightId(member.id);
      setShareMember(member);
      setMessage('');

      setTimeout(() => setHighlightId(null), 6000);
      setTimeout(() => setFlyInId(null), 4000);
    } catch {
      setError('Something went wrong. Try again in a moment.');
    } finally {
      setSubmitting(false);
    }
  };

  const onReact = async (id: string) => {
    if (reactedIds.has(id)) return;
    setReactedIds(prev => new Set([...prev, id]));
    const updated = await reactToMember(id);
    if (updated) {
      setMembers(prev => prev.map(m => (m.id === id ? updated : m)));
    }
  };

  const titleA = ['Join', 'the'];
  const titleB = ['Hopiin', 'Circle.'];

  return (
    <section ref={ref} className="hopiin-circle" id="circle">
      <CircleBackground3D />

      <div className="hopiin-circle__particles" aria-hidden>
        {Array.from({ length: 20 }).map((_, i) => (
          <span key={i} className="hopiin-circle__particle" style={{ ['--i' as string]: i }} />
        ))}
      </div>

      <div className="container hopiin-circle__container">
        <header className="hopiin-circle__header">
          <motion.div
            className="hopiin-circle__eyebrow-wrap"
            initial={{ opacity: 0, y: 12 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
          >
            <span className="hopiin-circle__eyebrow-line" />
            <p className="hopiin-circle__eyebrow">Community</p>
            <span className="hopiin-circle__eyebrow-line" />
          </motion.div>

          <div className="hopiin-circle__title-wrap">
            <motion.span
              className="hopiin-circle__title-bg"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              aria-hidden
            >
              ◯
            </motion.span>
            <h2 className="hopiin-circle__title">
              <span className="hopiin-circle__title-row">
                {titleA.map((w, i) => (
                  <motion.span
                    key={w}
                    className="hopiin-circle__title-word"
                    initial={{ opacity: 0, y: 36, filter: 'blur(8px)' }}
                    animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                    transition={{ delay: 0.1 + i * 0.08, duration: 0.65 }}
                  >
                    {w}
                  </motion.span>
                ))}
              </span>
              <span className="hopiin-circle__title-row">
                {titleB.map((w, i) => (
                  <motion.span
                    key={w}
                    className={`hopiin-circle__title-word ${i === 0 ? 'gradient-text' : ''}`}
                    initial={{ opacity: 0, y: 36, filter: 'blur(8px)' }}
                    animate={inView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
                    transition={{ delay: 0.3 + i * 0.08, duration: 0.65 }}
                  >
                    {w}
                  </motion.span>
                ))}
              </span>
            </h2>
          </div>

          <motion.p
            className="hopiin-circle__lede"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.45 }}
          >
            Pick your feeling, drop one line, and join the live circle — everyone sees you
            float in. Share your spot when you&apos;re done.
          </motion.p>
        </header>

        <div className="hopiin-circle__stage">
          <motion.div
            className="hopiin-circle__form-panel"
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hopiin-circle__form-card">
              <div className="hopiin-circle__form-header">
                <motion.div
                  className="hopiin-circle__avatar-preview"
                  style={{
                    background: selected.gradient,
                    ['--preview-glow' as string]: selected.glow,
                  }}
                  key={selectedAvatar}
                  initial={{ scale: 0.8, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <span className="hopiin-circle__avatar-preview-emoji">{selected.emoji}</span>
                </motion.div>
                <div>
                  <h3 className="hopiin-circle__form-title">How does Hopiin make you feel?</h3>
                  <motion.p
                    className="hopiin-circle__form-sub"
                    key={selectedAvatar}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {selected.emoji} {selected.label} — {selected.hint}
                  </motion.p>
                </div>
              </div>

              <p className="hopiin-circle__avatar-prompt">
                Tap the expression that matches your reaction after exploring the app idea
              </p>

              <div
                className="hopiin-circle__avatar-grid"
                role="listbox"
                aria-label="Choose how Hopiin makes you feel"
              >
                {CIRCLE_AVATARS.map(a => (
                  <motion.button
                    key={a.id}
                    type="button"
                    role="option"
                    aria-selected={selectedAvatar === a.id}
                    aria-label={`${a.label}: ${a.hint}`}
                    title={a.hint}
                    className={`hopiin-circle__avatar-btn ${selectedAvatar === a.id ? 'hopiin-circle__avatar-btn--on' : ''}`}
                    style={{
                      background: a.gradient,
                      ['--av-glow' as string]: a.glow,
                    }}
                    onClick={() => setSelectedAvatar(a.id)}
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="hopiin-circle__avatar-btn-emoji">{a.emoji}</span>
                    <span className="hopiin-circle__avatar-btn-label">{a.label}</span>
                  </motion.button>
                ))}
              </div>

              <form className="hopiin-circle__form" onSubmit={onSubmit}>
                <label className="hopiin-circle__label">What&apos;s on your mind?</label>
                <div className="hopiin-circle__categories">
                  {FEEDBACK_CATEGORIES.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      className={`hopiin-circle__cat ${category === c.id ? 'hopiin-circle__cat--on' : ''}`}
                      onClick={() => setCategory(c.id)}
                    >
                      <span>{c.icon}</span> {c.label}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  className="hopiin-circle__input"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={32}
                  disabled={submitting}
                />

                <textarea
                  className="hopiin-circle__textarea"
                  placeholder="One line about Hopiin — hype, ideas, feedback..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  maxLength={280}
                  rows={3}
                  required
                  disabled={submitting}
                />

                <div className="hopiin-circle__form-footer">
                  <span className="hopiin-circle__char-count">{message.length}/280</span>
                  <motion.button
                    type="submit"
                    className="btn btn--primary hopiin-circle__submit"
                    disabled={submitting}
                    whileHover={{ scale: submitting ? 1 : 1.03 }}
                    whileTap={{ scale: submitting ? 1 : 0.97 }}
                  >
                    {submitting ? 'Entering…' : 'Enter the Circle ✦'}
                  </motion.button>
                </div>

                {error ? (
                  <p className="hopiin-circle__error" role="alert">
                    {error}
                  </p>
                ) : null}
              </form>
            </div>
          </motion.div>

          <motion.div
            className="hopiin-circle__arena-wrap"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.45, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            {isLive ? (
              <CircleLiveFeed members={members} highlightId={highlightId} />
            ) : null}

            {loading ? (
              <div className="circle-arena circle-arena--loading">
                <p>Loading the circle…</p>
              </div>
            ) : (
              <CircleArena
                members={members}
                highlightId={highlightId}
                flyInId={flyInId}
                reactedIds={reactedIds}
                onReact={onReact}
              />
            )}

            <p className="hopiin-circle__arena-hint">
              {isLive ? '🟢 Live shared wall · ' : ''}
              Tap any avatar to read · Scroll names at top · 🔥 to react
            </p>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {shareMember ? (
          <CircleShareCard
            key={shareMember.id}
            member={shareMember}
            allMembers={members}
            onClose={() => setShareMember(null)}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
