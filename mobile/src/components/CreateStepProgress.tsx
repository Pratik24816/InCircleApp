import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

export const CREATE_STEPS = ['The Plan', 'Time & Place', 'The Crew'] as const;

type Props = {
  step: number;
};

export function CreateStepProgress({ step }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.segments}>
        {CREATE_STEPS.map((label, index) => (
          <View key={label} style={styles.segmentWrap}>
            <View style={[styles.segment, index <= step && styles.segmentActive]} />
          </View>
        ))}
      </View>
      <Text style={styles.stepLabel}>
        Step {step + 1} · {CREATE_STEPS[step]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  segments: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  segmentWrap: { flex: 1 },
  segment: {
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  segmentActive: {
    backgroundColor: colors.primary,
  },
  stepLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
