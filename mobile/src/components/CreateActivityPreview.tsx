import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Activity } from '../types/auth';
import { colors, spacing, typography } from '../theme/tokens';
import { ActivityCard } from './ActivityCard';

type Props = {
  activity: Activity;
};

export function CreateActivityPreview({ activity }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Live preview</Text>
        <Text style={styles.hint}>This is how your plan will look on the feed</Text>
      </View>
      <View style={styles.cardShell} pointerEvents="none">
        <ActivityCard activity={activity} onPress={() => {}} showJoinButton={false} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  header: { marginBottom: spacing.sm },
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
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(140,255,79,0.35)',
    overflow: 'hidden',
  },
});
