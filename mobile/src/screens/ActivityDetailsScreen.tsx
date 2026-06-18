import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { Avatar } from '../components/Avatar';
import { ScreenBg } from '../components/ScreenBg';
import { ScreenHeader } from '../components/ScreenHeader';
import { StatusBadge } from '../components/StatusBadge';
import {
  getActivityById,
  getCategoryById,
  getUserById,
} from '../data/mock';
import { colors, spacing, typography } from '../theme/tokens';
import type { MainStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<MainStackParamList>;
type R = RouteProp<MainStackParamList, 'ActivityDetails'>;

export function ActivityDetailsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const activity = getActivityById(route.params.id);
  const creator = activity ? getUserById(activity.creatorId) : undefined;
  const cat = activity ? getCategoryById(activity.categoryId) : undefined;

  if (!activity) {
    return (
      <ScreenBg>
        <ScreenHeader title="Activity" onBack={() => navigation.goBack()} />
        <Text style={styles.miss}>Not found (mock)</Text>
      </ScreenBg>
    );
  }

  return (
    <ScreenBg>
      <ScreenHeader
        title=""
        onBack={() => navigation.goBack()}
        right={
          <Text
            style={styles.link}
            onPress={() =>
              navigation.navigate('Report', { activityId: activity.id })
            }>
            Report
          </Text>
        }
      />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>{cat?.icon ?? '✨'} Cover</Text>
        </View>
        <View style={styles.row}>
          <StatusBadge status={activity.status} />
          <Text style={styles.dist}>{activity.distanceKm.toFixed(1)} km</Text>
        </View>
        <Text style={styles.title}>{activity.title}</Text>
        <Text style={styles.when}>
          {new Date(activity.startDatetime).toLocaleString()}
        </Text>
        <Text style={styles.loc}>📍 {activity.locationName} · {activity.city}</Text>
        <Text style={styles.desc}>{activity.description}</Text>
        <AppCard>
          <Text style={styles.label}>Host</Text>
          <View style={styles.host}>
            <Avatar name={creator?.fullName ?? '?'} />
            <View>
              <Text style={styles.hostName}>{creator?.fullName}</Text>
              <Text style={styles.hostUser}>@{creator?.username}</Text>
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
          <Text style={styles.tags}>{activity.tags.map(t => `#${t}`).join('  ')}</Text>
        </AppCard>
        <View style={styles.actions}>
          <AppButton title="In" onPress={() => {}} />
          <AppButton title="Maybe" variant="secondary" onPress={() => {}} />
        </View>
        <Text style={styles.todo}>TODO: POST /activities/:id/join</Text>
      </ScrollView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  miss: { ...typography.body, color: colors.muted, padding: spacing.lg },
  link: { ...typography.caption, color: colors.secondary },
  hero: {
    height: 200,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  heroEmoji: { fontSize: 22, color: colors.textSecondary },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dist: { ...typography.caption, color: colors.muted },
  title: { ...typography.display, color: colors.text, marginBottom: spacing.sm },
  when: { ...typography.body, color: colors.secondary, marginBottom: 4 },
  loc: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.md },
  desc: { ...typography.body, color: colors.textSecondary, lineHeight: 22, marginBottom: spacing.md },
  label: { ...typography.caption, color: colors.muted, marginBottom: 6 },
  host: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  hostName: { ...typography.subtitle, color: colors.text },
  hostUser: { ...typography.caption, color: colors.muted },
  meta: { ...typography.body, color: colors.textSecondary, marginBottom: 4 },
  tags: { ...typography.caption, color: colors.primary, marginTop: 6 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  todo: { ...typography.caption, color: colors.muted, marginTop: spacing.md, textAlign: 'center' },
});
