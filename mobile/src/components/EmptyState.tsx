import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme/tokens';

type Props = { title: string; subtitle?: string; icon?: string };

export function EmptyState({ title, subtitle, icon = '✨' }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    paddingVertical: spacing.xl + spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  icon: { fontSize: 40, marginBottom: spacing.md },
  title: { ...typography.title, color: colors.text, textAlign: 'center' },
  sub: {
    ...typography.body,
    color: colors.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
