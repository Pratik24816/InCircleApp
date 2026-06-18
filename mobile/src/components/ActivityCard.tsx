import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { Activity } from '../types/auth';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { StatusBadge } from './StatusBadge';

type Props = {
  activity: Activity;
  onPress: () => void;
  onPressIn?: () => void;
};

export function ActivityCard({ activity, onPress, onPressIn }: Props) {
  const catIcon = activity.category?.icon ?? '✨';
  const catName = activity.category?.name ?? 'Activity';
  const distance = activity.distanceKm ?? 0;

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      style={({ pressed }) => [styles.press, pressed && { opacity: 0.92 }]}>
      <LinearGradient
        colors={['rgba(77,181,255,0.12)', 'rgba(140,255,79,0.06)', colors.surface]}
        style={styles.card}>
        <View style={styles.cover}>
          <Text style={styles.coverEmoji}>{catIcon} Activity</Text>
          <View style={styles.badgeWrap}>
            <StatusBadge status={activity.status} />
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.cat}>{catName}</Text>
          <Text style={styles.dist}>{distance.toFixed(1)} km</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {activity.title}
        </Text>
        <Text style={styles.loc} numberOfLines={1}>
          📍 {activity.locationName}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.meta}>
            🕐 {new Date(activity.startDatetime).toLocaleString([], {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
          <Text style={styles.joined}>{activity.joinedCount} In</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { borderRadius: radii.lg, marginBottom: spacing.md },
  card: {
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cover: {
    height: 112,
    borderRadius: radii.md,
    backgroundColor: 'rgba(15,23,42,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  coverEmoji: { fontSize: 28, color: colors.textSecondary },
  badgeWrap: { position: 'absolute', top: 8, right: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cat: { ...typography.caption, color: colors.secondary },
  dist: { ...typography.caption, color: colors.muted },
  title: { ...typography.title, color: colors.text, marginBottom: 4 },
  loc: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { ...typography.caption, color: colors.muted },
  joined: { ...typography.caption, color: colors.primary, fontWeight: '700' },
});
