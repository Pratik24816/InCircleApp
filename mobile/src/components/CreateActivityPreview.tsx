import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { Activity } from '../types/auth';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { ActivityCard } from './ActivityCard';

type Props = {
  activity: Activity;
};

export function CreateActivityPreview({ activity }: Props) {
  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={['rgba(140,255,79,0.14)', 'rgba(140,255,79,0.02)', 'transparent']}
        style={styles.glow}
      />
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Live preview</Text>
        <Text style={styles.hint}>This is exactly how your plan appears on the feed</Text>
      </View>
      <View style={styles.cardShell} pointerEvents="none">
        <ActivityCard activity={activity} onPress={() => {}} showJoinButton={false} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(140,255,79,0.28)',
    backgroundColor: 'rgba(140,255,79,0.04)',
    overflow: 'hidden',
  },
  glow: {
    ...StyleSheet.absoluteFill,
  },
  header: { marginBottom: spacing.md },
  eyebrow: {
    ...typography.caption,
    color: colors.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 4,
  },
  hint: { ...typography.caption, color: colors.muted },
  cardShell: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(140,255,79,0.35)',
    overflow: 'hidden',
    backgroundColor: colors.background,
  },
});
