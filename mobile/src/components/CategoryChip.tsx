import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/tokens';

type Props = {
  label: string;
  selected?: boolean;
  onPress: () => void;
};

export function CategoryChip({ label, selected, onPress }: Props) {
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
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  chipOn: {
    borderColor: 'rgba(140,255,79,0.55)',
    backgroundColor: 'rgba(140,255,79,0.12)',
  },
  txt: { ...typography.caption, color: colors.textSecondary },
  txtOn: { color: colors.primary, fontWeight: '700' },
});
