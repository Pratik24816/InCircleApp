import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { Avatar } from '../components/Avatar';
import { ScreenBg } from '../components/ScreenBg';
import { useAuth } from '../context/AuthContext';
import { fetchMyActivities } from '../services/activities.service';
import { fetchInterests } from '../services/catalog.service';
import type { Interest } from '../types/auth';
import { colors, spacing, typography } from '../theme/tokens';
import type { ProfileStackList } from '../navigation/types';

type ProfNav = NativeStackNavigationProp<ProfileStackList>;

export function ProfileScreen() {
  const mainNav = useNavigation() as { navigate: (name: string) => void };
  const nav = useNavigation<ProfNav>();
  const { user, refreshUser } = useAuth();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [created, setCreated] = useState(0);
  const [joined, setJoined] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;
      (async () => {
        setLoading(true);
        try {
          const refreshed = await refreshUser();
          const [allInterests, createdList, joinedList] = await Promise.all([
            fetchInterests(),
            fetchMyActivities('created'),
            fetchMyActivities('joined'),
          ]);
          if (!cancelled) {
            const ids = refreshed?.interestIds ?? [];
            setInterests(allInterests.filter(i => ids.includes(i.id)));
            setCreated(createdList.length);
            setJoined(joinedList.length);
          }
        } catch {
          if (!cancelled) {
            setInterests([]);
            setCreated(0);
            setJoined(0);
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [refreshUser]),
  );

  useEffect(() => {
    if (user?.interestIds?.length) {
      fetchInterests()
        .then(all => setInterests(all.filter(i => user.interestIds!.includes(i.id))))
        .catch(() => {});
    }
  }, [user?.interestIds]);

  if (!user) {
    return (
      <ScreenBg>
        <Text style={styles.muted}>Sign in to view profile</Text>
      </ScreenBg>
    );
  }

  return (
    <ScreenBg>
      <View style={styles.top}>
        <Text style={styles.title}>Profile</Text>
        <View style={styles.actions}>
          <Pressable onPress={() => mainNav.navigate('Notifications')}>
            <Text style={styles.icon}>🔔</Text>
          </Pressable>
          <Pressable onPress={() => nav.navigate('Settings')}>
            <Text style={styles.icon}>⚙️</Text>
          </Pressable>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}>
        <View style={styles.hero}>
          <Avatar name={user.fullName} uri={user.profilePhoto} size={72} />
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.user}>@{user.username ?? 'user'}</Text>
          {user.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
          <Text style={styles.city}>📍 {user.city || 'Ahmedabad'}</Text>
        </View>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={styles.stats}>
            <AppCard style={styles.stat}>
              <Text style={styles.statN}>{created}</Text>
              <Text style={styles.statL}>Created</Text>
            </AppCard>
            <AppCard style={styles.stat}>
              <Text style={styles.statN}>{joined}</Text>
              <Text style={styles.statL}>Joined</Text>
            </AppCard>
          </View>
        )}
        <Text style={styles.section}>Interests</Text>
        <View style={styles.chips}>
          {interests.length === 0 ? (
            <Text style={styles.muted}>Add interests in onboarding</Text>
          ) : (
            interests.map(i => (
              <View key={i.id} style={styles.chip}>
                <Text style={styles.chipTxt}>{i.name}</Text>
              </View>
            ))
          )}
        </View>
        <AppButton title="Refresh profile" variant="ghost" onPress={() => refreshUser()} />
      </ScrollView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: { ...typography.display, color: colors.text },
  actions: { flexDirection: 'row', gap: spacing.md },
  icon: { fontSize: 22 },
  hero: { alignItems: 'center', marginBottom: spacing.lg },
  name: { ...typography.title, color: colors.text, marginTop: spacing.md },
  user: { ...typography.caption, color: colors.secondary, marginTop: 4 },
  bio: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  city: { ...typography.body, color: colors.muted, marginTop: spacing.sm },
  stats: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  stat: { flex: 1, alignItems: 'center' },
  statN: { ...typography.display, color: colors.primary },
  statL: { ...typography.caption, color: colors.muted },
  section: { ...typography.caption, color: colors.muted, marginBottom: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.lg },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  chipTxt: { ...typography.caption, color: colors.text },
  muted: { ...typography.body, color: colors.muted, padding: spacing.lg },
});
