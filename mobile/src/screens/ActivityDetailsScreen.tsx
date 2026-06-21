import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { Avatar } from '../components/Avatar';
import { AvatarStack } from '../components/AvatarStack';
import { ActivityCountdown } from '../components/ActivityCountdown';
import { ActivityCover } from '../components/ActivityCover';
import { VibeTagRow } from '../components/VibeTagRow';
import { getActivityPeople } from '../utils/avatarDisplay';
import { getActivityLocationLine } from '../utils/locationDisplay';
import { getActivityVibeTags } from '../utils/vibeDisplay';
import { ScreenBg } from '../components/ScreenBg';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatusBadge } from '../components/StatusBadge';
import { fetchActivityById, joinActivity } from '../services/activities.service';
import { getApiErrorMessage } from '../services/auth.service';
import type { Activity } from '../types/auth';
import { colors, spacing, typography } from '../theme/tokens';
import type { MainStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<MainStackParamList>;
type R = RouteProp<MainStackParamList, 'ActivityDetails'>;

export function ActivityDetailsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchActivityById(route.params.id);
      setActivity(data);
    } catch {
      setActivity(null);
    } finally {
      setLoading(false);
    }
  }, [route.params.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleJoin = async (status: 'joined' | 'maybe') => {
    if (!activity) {
      return;
    }
    setJoining(true);
    try {
      const updated = await joinActivity(activity.id, status);
      setActivity(updated);
    } catch (error) {
      Alert.alert('Could not update RSVP', getApiErrorMessage(error));
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <ScreenBg>
        <ScreenHeader title="Activity" onBack={() => navigation.goBack()} />
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
      </ScreenBg>
    );
  }

  if (!activity) {
    return (
      <ScreenBg>
        <ScreenHeader title="Activity" onBack={() => navigation.goBack()} />
        <Text style={styles.miss}>Activity not found</Text>
      </ScreenBg>
    );
  }

  const creator = activity.creator;
  const locationLine = getActivityLocationLine(activity);

  return (
    <ScreenBg>
      <ScreenHeader
        title=""
        onBack={() => navigation.goBack()}
        right={
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Report', { activityId: activity.id })}>
            Report
          </Text>
        }
      />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}>
        <ActivityCover activity={activity} height={220} label={activity.title} />
        <View style={styles.row}>
          <StatusBadge status={activity.status} />
          <Text style={styles.dist}>{locationLine.replace(/^📍\s*/, '')}</Text>
        </View>
        <Text style={styles.title}>{activity.title}</Text>
        <VibeTagRow tags={getActivityVibeTags(activity)} />
        <ActivityCountdown startIso={activity.startDatetime} large />
        <Text style={styles.when}>{new Date(activity.startDatetime).toLocaleString()}</Text>
        <Text style={styles.loc}>{locationLine}</Text>
        <Text style={styles.venue} numberOfLines={1}>
          {activity.locationName}
        </Text>
        <Text style={styles.desc}>{activity.description}</Text>
        <AppCard>
          <Text style={styles.label}>Host</Text>
          <View style={styles.host}>
            <Avatar name={creator?.fullName ?? '?'} uri={creator?.profilePhoto} />
            <View>
              <Text style={styles.hostName}>{creator?.fullName ?? 'Host'}</Text>
              <Text style={styles.hostUser}>@{creator?.username ?? 'user'}</Text>
            </View>
          </View>
        </AppCard>
        <AppCard>
          <Text style={styles.label}>Group</Text>
          <Text style={styles.meta}>
            {activity.groupType.replace(/_/g, ' ')}
            {activity.groupSize != null ? ` · max ${activity.groupSize}` : ''}
          </Text>
          <Text style={styles.meta}>{activity.joinedCount} people In</Text>
          {activity.joinedCount > 0 ? (
            <View style={styles.participants}>
              <AvatarStack
                people={getActivityPeople(activity)}
                total={activity.joinedCount}
                size={36}
                showNames
              />
            </View>
          ) : null}
        </AppCard>
        <View style={styles.actions}>
          <AppButton title={joining ? '...' : 'In'} onPress={() => handleJoin('joined')} disabled={joining} />
          <AppButton
            title="Maybe"
            variant="secondary"
            onPress={() => handleJoin('maybe')}
            disabled={joining}
          />
        </View>
      </ScrollView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  miss: { ...typography.body, color: colors.muted, padding: spacing.lg },
  link: { ...typography.caption, color: colors.secondary },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dist: { ...typography.caption, color: colors.muted },
  title: { ...typography.display, color: colors.text, marginBottom: spacing.sm },
  when: { ...typography.body, color: colors.secondary, marginBottom: 4 },
  loc: { ...typography.body, color: colors.text, fontWeight: '600', marginBottom: 4 },
  venue: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.md },
  desc: { ...typography.body, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.md },
  label: { ...typography.caption, color: colors.muted, marginBottom: 6 },
  host: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  hostName: { ...typography.subtitle, color: colors.text },
  hostUser: { ...typography.caption, color: colors.muted },
  meta: { ...typography.body, color: colors.textSecondary, marginBottom: 4 },
  participants: { marginTop: spacing.sm, marginBottom: spacing.xs },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});
