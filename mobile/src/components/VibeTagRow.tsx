import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/tokens';

type Props = {
  tags: string[];
  compact?: boolean;
  max?: number;
};

export function VibeTagRow({ tags, compact = false, max = 4 }: Props) {
  const shown = tags.slice(0, max);
  if (!shown.length) {
    return null;
  }

  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      {shown.map(tag => (
        <View key={tag} style={[styles.chip, compact && styles.chipCompact]}>
          <Text style={[styles.label, compact && styles.labelCompact]} numberOfLines={1}>
            {tag}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  rowCompact: {
    marginBottom: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(77,181,255,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(77,181,255,0.28)',
    maxWidth: '100%',
  },
  chipCompact: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  label: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  labelCompact: {
    fontSize: 11,
  },
});
