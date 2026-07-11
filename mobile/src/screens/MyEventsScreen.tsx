import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { ActivityCard } from '../components/ActivityCard';
import { EmptyState } from '../components/EmptyState';
import { ScreenBg } from '../components/ScreenBg';
import { fetchMyActivities } from '../services/activities.service';
import type { Activity } from '../types/auth';
import { colors, spacing, typography } from '../theme/tokens';
import type { MainStackParamList, MyEventsStackList } from '../navigation/types';

type Nav = NativeStackNavigationProp<MainStackParamList>;
type TabKey = 'created' | 'joined' | 'done';
type MyEventsRoute = RouteProp<MyEventsStackList, 'MyEvents'>;

export function MyEventsScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<MyEventsRoute>();
  const [tab, setTab] = useState<TabKey>('joined');
  const [data, setData] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (route.params?.initialTab) {
      setTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const role = tab === 'done' ? 'completed' : tab;
      const items = await fetchMyActivities(role);
      setData(items);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

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
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : data.length === 0 ? (
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
