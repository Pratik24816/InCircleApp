import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { Activity } from '../types/auth';
import { colors, radii, spacing, typography } from '../theme/tokens';
import {
  getHostFirstName,
  getPeopleGoingLine,
  getUrgencyHint,
  getWeatherVibeLine,
} from '../utils/activityDisplay';
import { AppButton } from './AppButton';
import { ActivityCountdown } from './ActivityCountdown';
import { ActivityCover } from './ActivityCover';
import { Avatar } from './Avatar';
import { AvatarStack } from './AvatarStack';
import { VibeTagRow } from './VibeTagRow';
import { getActivityPeople } from '../utils/avatarDisplay';
import { getActivityLocationLine } from '../utils/locationDisplay';
import { getActivityVibeTags } from '../utils/vibeDisplay';

type Props = {
  activity: Activity;
  onPress: () => void;
  onJoin?: () => void;
  joining?: boolean;
  featured?: boolean;
  compact?: boolean;
  showJoinButton?: boolean;
};

export function ActivityCard({
  activity,
  onPress,
  onJoin,
  joining = false,
  featured = false,
  compact = false,
  showJoinButton = true,
}: Props) {
  const hostName = getHostFirstName(activity.creator?.fullName);
  const isFull = activity.status === 'full';
  const urgency = getUrgencyHint(activity);
  const peopleLine = getPeopleGoingLine(activity);
  const weatherLine = getWeatherVibeLine(activity.startDatetime, activity.id);
  const people = getActivityPeople(activity);
  const vibeTags = getActivityVibeTags(activity);
  const isFeatured = featured || activity.featured;

  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [pressed && styles.pressed]}>
        <LinearGradient
          colors={
            isFeatured
              ? ['rgba(140,255,79,0.14)', 'rgba(77,181,255,0.1)', colors.surface]
              : ['rgba(77,181,255,0.1)', 'rgba(140,255,79,0.05)', colors.surface]
          }
          style={[styles.card, isFeatured && styles.cardFeatured]}>
          <View style={styles.hostRow}>
            <Avatar
              name={activity.creator?.fullName ?? hostName}
              uri={activity.creator?.profilePhoto}
              size={28}
            />
            <Text style={styles.hostLine} numberOfLines={1}>
              <Text style={styles.hostName}>{hostName}</Text>
              <Text style={styles.hostSuffix}> is hosting{isFeatured ? ' 🌟' : ''}</Text>
            </Text>
            {urgency ? <Text style={styles.urgency}>{urgency}</Text> : null}
          </View>

          <ActivityCover activity={activity} height={128} />

          <Text style={[styles.title, isFeatured && styles.titleFeatured]} numberOfLines={2}>
            {activity.title}
          </Text>

          <VibeTagRow tags={vibeTags} compact max={3} />

          <Text style={styles.loc} numberOfLines={1}>
            {getActivityLocationLine(activity)}
          </Text>

          <Text style={styles.vibeLine}>{weatherLine}</Text>
          {activity.joinedCount > 0 ? (
            <View style={styles.peopleRow}>
              <AvatarStack people={people} total={activity.joinedCount} size={28} />
              <Text style={styles.socialLine}>{peopleLine.replace(/^👥\s*/, '')}</Text>
            </View>
          ) : (
            <Text style={styles.socialLine}>{peopleLine}</Text>
          )}
          <ActivityCountdown startIso={activity.startDatetime} compact />
        </LinearGradient>
      </Pressable>

      {showJoinButton && onJoin ? (
        <View style={styles.ctaRow}>
          <AppButton
            title={joining ? 'Joining...' : isFull ? 'Full' : "I'm In 🔥"}
            onPress={onJoin}
            disabled={joining || isFull}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md, borderRadius: radii.lg },
  wrapCompact: { width: 300, marginRight: spacing.md },
  pressed: { opacity: 0.92 },
  card: {
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardFeatured: {
    borderColor: 'rgba(140,255,79,0.45)',
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  hostLine: { flex: 1, ...typography.caption },
  hostName: { color: colors.primary, fontWeight: '700' },
  hostSuffix: { color: colors.textSecondary },
  urgency: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '700',
    fontSize: 10,
  },
  title: { ...typography.title, color: colors.text, marginBottom: 4 },
  titleFeatured: { fontSize: 20, fontWeight: '700' },
  loc: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.sm },
  vibeLine: { ...typography.caption, color: colors.secondary, marginBottom: 4 },
  peopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  socialLine: { ...typography.caption, color: colors.text, fontWeight: '600', flex: 1 },
  ctaRow: {
    marginTop: -spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomLeftRadius: radii.lg,
    borderBottomRightRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderTopWidth: 0,
    borderColor: colors.border,
  },
});
