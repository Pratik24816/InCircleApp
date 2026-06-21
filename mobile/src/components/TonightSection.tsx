import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Activity } from '../types/auth';
import { colors, spacing, typography } from '../theme/tokens';
import { TonightStoryTile } from './TonightStoryTile';

type Props = {
  activities: Activity[];
  onSelect: (activity: Activity) => void;
};

export function TonightSection({ activities, onSelect }: Props) {
  if (!activities.length) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Tonight</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        {activities.map(activity => (
          <TonightStoryTile
            key={activity.id}
            activity={activity}
            onPress={() => onSelect(activity)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  heading: {
    ...typography.caption,
    color: colors.muted,
    letterSpacing: 1.4,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  row: {
    paddingRight: spacing.lg,
  },
});
