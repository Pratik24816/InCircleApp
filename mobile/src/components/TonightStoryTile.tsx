import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { Activity } from '../types/auth';
import { colors, spacing, typography } from '../theme/tokens';
import {
  formatTonightTime,
  getTonightStoryEmoji,
  getTonightStoryTitle,
} from '../utils/tonightDisplay';

type Props = {
  activity: Activity;
  onPress: () => void;
};

const RING = 72;
const INNER = 62;

export function TonightStoryTile({ activity, onPress }: Props) {
  const emoji = getTonightStoryEmoji(activity);
  const time = formatTonightTime(activity.startDatetime);
  const title = getTonightStoryTitle(activity);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}>
      <LinearGradient
        colors={['#8CFF4F', '#4DB5FF', '#8CFF4F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.ring}>
        <View style={styles.inner}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>
      </LinearGradient>
      <Text style={styles.time}>{time}</Text>
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: 84,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  pressed: { opacity: 0.88 },
  ring: {
    width: RING,
    height: RING,
    borderRadius: RING / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  inner: {
    width: INNER,
    height: INNER,
    borderRadius: INNER / 2,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: { fontSize: 28 },
  time: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
    fontSize: 11,
    textAlign: 'center',
  },
  title: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 14,
  },
});
