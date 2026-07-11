import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState, type MouseEvent } from 'react';
import { resolveAvatar } from '../constants/circleAvatars';
import { formatUserNumber, resolveUserNumber } from '../constants/circleMemberCard';
import type { CircleMember } from '../lib/circleStorage';
import { getCategoryLabel } from '../lib/circleStorage';

type SimBubble = {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  member: CircleMember;
  phase: number;
  isNew: boolean;
};

type Props = {
  members: CircleMember[];
  highlightId?: string | null;
  flyInId?: string | null;
  reactedIds?: Set<string>;
  onReact?: (id: string) => void;
};

const BASE_RADIUS = 42;

function createBubble(
  member: CircleMember,
  width: number,
  height: number,
  opts: { isNew: boolean; flyIn: boolean },
): SimBubble {
  if (opts.flyIn) {
    return {
      id: member.id,
      x: 24,
      y: height / 2 + (Math.random() - 0.5) * 60,
      vx: 3.2 + Math.random() * 0.6,
      vy: (Math.random() - 0.5) * 0.5,
      radius: BASE_RADIUS,
      member,
      phase: Math.random() * Math.PI * 2,
      isNew: true,
    };
  }

  const angle = Math.random() * Math.PI * 2;
  const dist = Math.random() * Math.min(width, height) * 0.26;
  return {
    id: member.id,
    x: width / 2 + Math.cos(angle) * dist,
    y: height / 2 + Math.sin(angle) * dist,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    radius: BASE_RADIUS,
    member,
    phase: Math.random() * Math.PI * 2,
    isNew: opts.isNew,
  };
}

export function CircleArena({
  members,
  highlightId,
  flyInId,
  reactedIds,
  onReact,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bubblesRef = useRef<SimBubble[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });
  const rafRef = useRef<number>(0);
  const [, tick] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [size, setSize] = useState({ w: 600, h: 600 });
  const knownIds = useRef(new Set<string>());

  const activeId = selectedId ?? highlightId ?? null;

  useEffect(() => {
    if (highlightId) setSelectedId(highlightId);
  }, [highlightId]);

  const syncBubbles = useCallback(() => {
    const { w, h } = size;
    if (w <= 0 || h <= 0) return;

    const current = bubblesRef.current;

    for (const member of members) {
      const existing = current.find(b => b.id === member.id);
      if (existing) {
        existing.member = member;
        continue;
      }

      const isNew = !knownIds.current.has(member.id);
      knownIds.current.add(member.id);
      const flyIn = isNew && member.id === flyInId;
      current.push(createBubble(member, w, h, { isNew, flyIn }));
    }

    bubblesRef.current = current.filter(b => members.some(m => m.id === b.id));
  }, [members, size, flyInId]);

  useEffect(() => {
    syncBubbles();
  }, [syncBubbles]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMove = (e: globalThis.MouseEvent | TouchEvent) => {
      const rect = el.getBoundingClientRect();
      const point = 'touches' in e ? e.touches[0] : e;
      if (!point) return;
      mouseRef.current = {
        x: point.clientX - rect.left,
        y: point.clientY - rect.top,
        active: true,
      };
    };

    const onLeave = () => {
      mouseRef.current.active = false;
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('touchmove', onMove, { passive: true });
    el.addEventListener('mouseleave', onLeave);
    el.addEventListener('touchend', onLeave);

    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      el.removeEventListener('touchend', onLeave);
    };
  }, []);

  useEffect(() => {
    let time = 0;

    const step = () => {
      time += 0.016;
      const { w, h } = size;
      const cx = w / 2;
      const cy = h / 2;
      const maxRx = w * 0.4;
      const maxRy = h * 0.32;
      const mouse = mouseRef.current;
      const bubbles = bubblesRef.current;
      const detailH = 130;

      for (let i = 0; i < bubbles.length; i++) {
        const b = bubbles[i];
        const isSelected = activeId === b.id;

        if (isSelected) {
          const dockX = cx;
          const dockY = cy - detailH * 0.15;
          b.vx += (dockX - b.x) * 0.035;
          b.vy += (dockY - b.y) * 0.035;
          b.vx *= 0.82;
          b.vy *= 0.82;
        } else {
          b.vx += Math.sin(time * 0.7 + b.phase) * 0.004;
          b.vy += Math.cos(time * 0.6 + b.phase * 1.3) * 0.004;

          b.vx += (cx - b.x) * 0.00006;
          b.vy += (cy - b.y) * 0.00006;

          const dx = (b.x - cx) / maxRx;
          const dy = (b.y - cy) / maxRy;
          const dist = dx * dx + dy * dy;
          if (dist > 0.72) {
            b.vx -= dx * 0.055;
            b.vy -= dy * 0.055;
          }

          for (let j = i + 1; j < bubbles.length; j++) {
            const o = bubbles[j];
            const bx = o.x - b.x;
            const by = o.y - b.y;
            const d = Math.hypot(bx, by) || 0.001;
            const minDist = b.radius + o.radius + 14;
            if (d < minDist) {
              const force = ((minDist - d) / d) * 0.04;
              b.vx -= bx * force;
              b.vy -= by * force;
              o.vx += bx * force;
              o.vy += by * force;
            }
          }

          if (mouse.active && !selectedId) {
            const mx = b.x - mouse.x;
            const my = b.y - mouse.y;
            const md = Math.hypot(mx, my);
            const influence = 100;
            if (md < influence && md > 0.001) {
              const force = (1 - md / influence) * 0.55;
              b.vx += (mx / md) * force;
              b.vy += (my / md) * force;
            }
          }

          b.vx *= 0.94;
          b.vy *= 0.94;
        }

        b.x += b.vx;
        b.y += b.vy;

        if (b.isNew && time > 4) b.isNew = false;
      }

      tick(n => n + 1);
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [size, activeId, selectedId]);

  const activeMember = members.find(m => m.id === activeId);
  const activeBubble = bubblesRef.current.find(b => b.id === activeId);
  const hasReacted = activeId ? reactedIds?.has(activeId) : false;

  const onBubbleClick = (id: string) => {
    setSelectedId(prev => (prev === id ? null : id));
  };

  const onArenaClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setSelectedId(null);
  };

  return (
    <div ref={containerRef} className="circle-arena" onClick={onArenaClick}>
      <div className="circle-arena__aurora" aria-hidden />
      <div className="circle-arena__ring circle-arena__ring--spin" aria-hidden />
      <div className="circle-arena__ring" aria-hidden />
      <div className="circle-arena__ring circle-arena__ring--2" aria-hidden />
      <div className="circle-arena__ring circle-arena__ring--3" aria-hidden />
      <div className="circle-arena__glow" aria-hidden />
      <div className="circle-arena__stars" aria-hidden>
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className="circle-arena__star" style={{ ['--si' as string]: i }} />
        ))}
      </div>

      {/* Quick-pick strip — tap to read without chasing bubbles */}
      <div className="circle-arena__picker">
        <span className="circle-arena__picker-label">Tap to read</span>
        <div className="circle-arena__picker-scroll">
          {members.map(m => {
            const av = resolveAvatar(m.avatarId);
            const on = m.id === activeId;
            return (
              <button
                key={m.id}
                type="button"
                className={`circle-arena__picker-btn ${on ? 'circle-arena__picker-btn--on' : ''}`}
                style={{ ['--pk-glow' as string]: av.glow }}
                onClick={e => {
                  e.stopPropagation();
                  onBubbleClick(m.id);
                }}
              >
                <span>{av.emoji}</span>
                <span className="circle-arena__picker-name">{m.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {bubblesRef.current.map(b => {
        const avatar = resolveAvatar(b.member.avatarId);
        const isActive = b.id === activeId;
        const fires = b.member.fireCount ?? 0;

        return (
          <motion.button
            key={b.id}
            type="button"
            className={`circle-bubble ${b.isNew ? 'circle-bubble--new' : ''} ${isActive ? 'circle-bubble--active' : ''}`}
            style={{
              left: b.x,
              top: b.y,
              ['--bubble-glow' as string]: avatar.glow,
              ['--bubble-bg' as string]: avatar.gradient,
            }}
            initial={b.isNew ? { scale: 0, opacity: 0 } : false}
            animate={{
              scale: isActive ? 1.28 : 1,
              opacity: 1,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            onClick={e => {
              e.stopPropagation();
              onBubbleClick(b.id);
            }}
            aria-label={`${b.member.name}: ${b.member.message}`}
            aria-pressed={isActive}
          >
            <span className="circle-bubble__hit" aria-hidden />
            <span className="circle-bubble__emoji">{avatar.emoji}</span>
            <span className="circle-bubble__name">{b.member.name}</span>
            {fires > 0 ? (
              <span className="circle-bubble__fire">🔥 {fires}</span>
            ) : null}
            {b.isNew ? <span className="circle-bubble__new-badge">New</span> : null}
            <span className="circle-bubble__pulse" aria-hidden />
            {isActive ? <span className="circle-bubble__ring-active" aria-hidden /> : null}
          </motion.button>
        );
      })}

      {/* Fixed detail panel — stays put, easy to read */}
      <AnimatePresence>
        {activeMember && activeBubble ? (
          <motion.div
            key={activeMember.id}
            className="circle-arena__detail"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            onClick={e => e.stopPropagation()}
          >
            <div
              className="circle-arena__detail-avatar"
              style={{ background: resolveAvatar(activeMember.avatarId).gradient }}
            >
              {resolveAvatar(activeMember.avatarId).emoji}
            </div>
            <div className="circle-arena__detail-body">
              <div className="circle-arena__detail-top">
                <span className="circle-arena__detail-name">{activeMember.name}</span>
                <span className="circle-arena__detail-num">
                  {formatUserNumber(resolveUserNumber(activeMember, members))}
                </span>
              </div>
              <p className="circle-arena__detail-meta">
                Feels {resolveAvatar(activeMember.avatarId).label.toLowerCase()} ·{' '}
                {getCategoryLabel(activeMember.category)}
              </p>
              <p className="circle-arena__detail-msg">&ldquo;{activeMember.message}&rdquo;</p>
              {onReact ? (
                <button
                  type="button"
                  className={`circle-arena__detail-react ${hasReacted ? 'circle-arena__detail-react--done' : ''}`}
                  onClick={() => !hasReacted && onReact(activeMember.id)}
                  disabled={hasReacted}
                >
                  {hasReacted ? '🔥 Hyped!' : '🔥 React'}
                </button>
              ) : null}
            </div>
            <button
              type="button"
              className="circle-arena__detail-close"
              onClick={() => setSelectedId(null)}
              aria-label="Close"
            >
              ✕
            </button>
          </motion.div>
        ) : (
          <motion.p
            key="hint"
            className="circle-arena__tap-hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            👆 Tap any avatar or name above to read their message
          </motion.p>
        )}
      </AnimatePresence>

      <div className="circle-arena__count">
        <motion.span
          className="circle-arena__count-num"
          key={members.length}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500 }}
        >
          {members.length}
        </motion.span>
        <span className="circle-arena__count-label">in the circle</span>
      </div>
    </div>
  );
}
