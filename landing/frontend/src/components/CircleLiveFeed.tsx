import { motion, AnimatePresence } from 'framer-motion';
import { resolveAvatar } from '../constants/circleAvatars';
import type { CircleMember } from '../lib/circleStorage';

type Props = {
  members: CircleMember[];
  highlightId?: string | null;
};

export function CircleLiveFeed({ members, highlightId }: Props) {
  const recent = members.slice(0, 6);

  return (
    <div className="circle-live-feed" aria-live="polite">
      <span className="circle-live-feed__dot" aria-hidden />
      <span className="circle-live-feed__label">Live</span>
      <div className="circle-live-feed__track">
        <AnimatePresence mode="popLayout">
          {recent.map(m => {
            const av = resolveAvatar(m.avatarId);
            const isNew = m.id === highlightId;
            return (
              <motion.span
                key={m.id}
                className={`circle-live-feed__item ${isNew ? 'circle-live-feed__item--new' : ''}`}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                {av.emoji} <strong>{m.name}</strong> — {av.label}
                {isNew ? ' · just joined' : ''}
              </motion.span>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
