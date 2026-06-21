import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from './AppButton';
import { AppCard } from './AppCard';
import { colors, spacing, typography } from '../theme/tokens';

type Props = {
  city: string;
  area?: string | null;
  onHostPlan: () => void;
};

export function FeedEmptyState({ city, area, onHostPlan }: Props) {
  const headline = area
    ? `${area} looks quiet right now 👀`
    : `${city} looks quiet today 👀`;

  const subline = area
    ? 'Be the first to start something here.'
    : 'Be the first to start something.';

  return (
    <AppCard style={styles.card}>
      <Text style={styles.emoji}>🌙</Text>
      <Text style={styles.headline}>{headline}</Text>
      <Text style={styles.subline}>{subline}</Text>
      <View style={styles.cta}>
        <AppButton title="Host a Plan" onPress={onHostPlan} />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  emoji: { fontSize: 36, marginBottom: spacing.sm },
  headline: {
    ...typography.subtitle,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subline: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  cta: { width: '100%' },
});
