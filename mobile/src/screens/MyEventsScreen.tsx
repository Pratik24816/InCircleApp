import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityCard } from '../components/ActivityCard';
import { EmptyState } from '../components/EmptyState';
import { ScreenBg } from '../components/ScreenBg';
import { MOCK_ACTIVITIES, myCreatedActivities, myJoinedActivities } from '../data/mock';
import { MOCK_ME } from '../data/mock';
import { colors, spacing, typography } from '../theme/tokens';
import type { MainStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<MainStackParamList>;
type TabKey = 'created' | 'joined' | 'done';

export function MyEventsScreen() {
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<TabKey>('joined');

  const data =
    tab === 'created'
      ? myCreatedActivities(MOCK_ME.id)
      : tab === 'joined'
        ? myJoinedActivities(MOCK_ME.id)
        : MOCK_ACTIVITIES.filter(a => a.status === 'done');

  return (
    <ScreenBg>
      <View style={styles.tabs}>
        {(['joined', 'created', 'done'] as TabKey[]).map(t => (
          <Pressable key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabOn]}>
            <Text style={[styles.tabTxt, tab === t && styles.tabTxtOn]}>
              {t === 'joined' ? 'Joined' : t === 'created' ? 'Created' : 'Completed'}
            </Text>
          </Pressable>
        ))}
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}>
        {data.length === 0 ? (
          <EmptyState title="Nothing here yet" subtitle="Join or host something IRL." />
        ) : (
          data.map(a => (
            <ActivityCard
              key={a.id}
              activity={a}
              onPress={() => navigation.navigate('ActivityDetails', { id: a.id })}
            />
          ))
        )}
      </ScrollView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tabOn: { borderColor: 'rgba(140,255,79,0.45)', backgroundColor: 'rgba(140,255,79,0.1)' },
  tabTxt: { ...typography.caption, color: colors.muted },
  tabTxtOn: { color: colors.primary, fontWeight: '700' },
});
