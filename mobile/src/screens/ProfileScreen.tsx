import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { Avatar } from '../components/Avatar';
import { ScreenBg } from '../components/ScreenBg';
import { MOCK_INTERESTS, MOCK_ME, myCreatedActivities, myJoinedActivities } from '../data/mock';
import { useAppStore } from '../store/useAppStore';
import { colors, spacing, typography } from '../theme/tokens';
import type { ProfileStackList } from '../navigation/types';

type ProfNav = NativeStackNavigationProp<ProfileStackList>;

export function ProfileScreen() {
  const mainNav = useNavigation() as { navigate: (name: string) => void };
  const nav = useNavigation<ProfNav>();
  const interestIds = useAppStore(s => s.selectedInterestIds);
  const interests = MOCK_INTERESTS.filter(i => interestIds.includes(i.id));
  const created = myCreatedActivities(MOCK_ME.id).length;
  const joined = myJoinedActivities(MOCK_ME.id).length;

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
          <Avatar name={MOCK_ME.fullName} size={72} />
          <Text style={styles.name}>{MOCK_ME.fullName}</Text>
          <Text style={styles.user}>@{MOCK_ME.username}</Text>
          <Text style={styles.bio}>{MOCK_ME.bio}</Text>
          <Text style={styles.city}>📍 {MOCK_ME.city}</Text>
        </View>
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
        <AppButton title="Edit profile (mock)" variant="ghost" onPress={() => {}} />
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
  muted: { ...typography.body, color: colors.muted },
});
