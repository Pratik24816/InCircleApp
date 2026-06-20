import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { getCountdownDisplay } from '../utils/activityDisplay';

type Props = {
  startIso: string;
  compact?: boolean;
  large?: boolean;
};

export function ActivityCountdown({ startIso, compact = false, large = false }: Props) {
  const [display, setDisplay] = useState(() => getCountdownDisplay(startIso));

  useEffect(() => {
    const update = () => setDisplay(getCountdownDisplay(startIso));
    update();

    const initial = getCountdownDisplay(startIso);
    if (initial.mode !== 'live') {
      return;
    }

    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startIso]);

  const isLive = display.mode === 'live';

  return (
    <View
      style={[
        styles.pill,
        compact && styles.pillCompact,
        large && styles.pillLarge,
        isLive && styles.pillLive,
        display.mode === 'soon' && styles.pillSoon,
      ]}>
      <Text style={[styles.emoji, large && styles.emojiLarge]}>{display.emoji}</Text>
      <Text
        style={[
          styles.text,
          compact && styles.textCompact,
          large && styles.textLarge,
          isLive && styles.timer,
        ]}
        numberOfLines={1}>
        {display.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginTop: 2,
  },
  pillCompact: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  pillLarge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  pillLive: {
    backgroundColor: 'rgba(255,176,32,0.12)',
    borderColor: 'rgba(255,176,32,0.35)',
  },
  pillSoon: {
    backgroundColor: 'rgba(140,255,79,0.12)',
    borderColor: 'rgba(140,255,79,0.35)',
  },
  emoji: { fontSize: 14 },
  emojiLarge: { fontSize: 18 },
  text: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  textCompact: { fontSize: 11 },
  textLarge: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
  timer: {
    color: colors.warning,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.6,
    fontWeight: '700',
  },
});
