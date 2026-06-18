import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/tokens';

type Props = { label: string; selected?: boolean; onPress: () => void };

export function InterestChip({ label, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipOn]}>
      <Text style={[styles.txt, selected && styles.txtOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    margin: 4,
  },
  chipOn: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(140,255,79,0.18)',
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 3,
  },
  txt: { ...typography.body, color: colors.textSecondary },
  txtOn: { color: colors.primary, fontWeight: '700' },
});
