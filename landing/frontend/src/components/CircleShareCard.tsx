import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import { useRef, useState } from 'react';
import { resolveAvatar } from '../constants/circleAvatars';
import {
  formatMemberDate,
  formatUserNumber,
  getFutureUserBadge,
  MEMBER_PASS_LINES,
  resolveUserNumber,
} from '../constants/circleMemberCard';
import { buildShareText, getShareUrl } from '../lib/circleApi';
import type { CircleMember } from '../lib/circleStorage';

type Props = {
  member: CircleMember;
  allMembers: CircleMember[];
  onClose: () => void;
};

export function CircleShareCard({ member, allMembers, onClose }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const avatar = resolveAvatar(member.avatarId);
  const userNum = resolveUserNumber(member, allMembers);
  const badge = getFutureUserBadge(userNum);
  const passLine = MEMBER_PASS_LINES[member.avatarId];
  const shareText = buildShareText(member, avatar.label.toLowerCase(), userNum);
  const shareUrl = getShareUrl();

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const onDownload = async () => {
    const node = cardRef.current;
    if (!node || downloading) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(node, {
        pixelRatio: 3,
        cacheBust: true,
        backgroundColor: '#020617',
      });
      const link = document.createElement('a');
      link.download = `hopiin-future-user-${formatUserNumber(userNum).replace('#', '')}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      /* ignore */
    } finally {
      setDownloading(false);
    }
  };

  const onNativeShare = async () => {
    if (!navigator.share) {
      await onCopy();
      return;
    }
    try {
      await navigator.share({
        title: `Hopiin Future User ${formatUserNumber(userNum)}`,
        text: shareText,
        url: shareUrl,
      });
    } catch {
      /* user cancelled */
    }
  };

  return (
    <motion.div
      className="member-pass-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="member-pass-wrap"
        initial={{ opacity: 0, scale: 0.82, rotateX: 18, y: 40 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 24 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        onClick={e => e.stopPropagation()}
        style={{ perspective: 1200 }}
      >
        <button type="button" className="member-pass__close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        <p className="member-pass__headline">You&apos;re in before launch</p>
        <p className="member-pass__subhead">
          Future User {formatUserNumber(userNum)} of {allMembers.length} in the circle
        </p>

        <div
          ref={cardRef}
          className="member-pass"
          style={{
            ['--pass-glow' as string]: avatar.glow,
            ['--pass-accent' as string]: badge.accent,
          }}
        >
          <div className="member-pass__shimmer" aria-hidden />
          <div className="member-pass__mesh" aria-hidden />

          <div className="member-pass__top">
            <div className="member-pass__brand">
              <span className="member-pass__brand-name">
                Hop<span className="member-pass__brand-i">iin</span>
              </span>
              <span className="member-pass__brand-sub">Future User Pass</span>
            </div>
            <span
              className="member-pass__tier"
              style={{ borderColor: badge.accent, color: badge.accent }}
            >
              {badge.label}
            </span>
          </div>

          <div className="member-pass__chip-row">
            <div className="member-pass__chip" aria-hidden />
            <motion.span
              className="member-pass__number"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 400 }}
            >
              {formatUserNumber(userNum)}
            </motion.span>
          </div>

          <div className="member-pass__identity">
            <div
              className="member-pass__avatar"
              style={{ background: avatar.gradient }}
            >
              <span>{avatar.emoji}</span>
            </div>
            <div className="member-pass__who">
              <span className="member-pass__name">{member.name}</span>
              <span className="member-pass__feeling">Feeling {avatar.label.toLowerCase()}</span>
            </div>
          </div>

          <p className="member-pass__line">{passLine}</p>

          <blockquote className="member-pass__quote">&ldquo;{member.message}&rdquo;</blockquote>

          <div className="member-pass__footer">
            <span>Joined {formatMemberDate(member.createdAt)}</span>
            <span className="member-pass__dot">·</span>
            <span>hopiin.app</span>
          </div>

          <div className="member-pass__barcode" aria-hidden>
            {Array.from({ length: 28 }).map((_, i) => (
              <span key={i} style={{ ['--bi' as string]: i }} />
            ))}
          </div>
        </div>

        <div className="member-pass__actions">
          <motion.button
            type="button"
            className="btn btn--primary member-pass__share-btn"
            onClick={onDownload}
            disabled={downloading}
            whileHover={{ scale: downloading ? 1 : 1.03 }}
            whileTap={{ scale: downloading ? 1 : 0.97 }}
          >
            {downloading ? 'Saving…' : 'Download your pass ↓'}
          </motion.button>
          <motion.button
            type="button"
            className="member-pass__share-secondary"
            onClick={onNativeShare}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Share your pass ✦
          </motion.button>
          <button type="button" className="member-pass__copy" onClick={onCopy}>
            {copied ? 'Copied!' : 'Copy card message'}
          </button>
          <p className="member-pass__hint">Save as PNG · Story · WhatsApp · anywhere</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
