import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ActivityCard } from '../components/ActivityCard';
import { AppCard } from '../components/AppCard';
import { CategoryChip } from '../components/CategoryChip';
import { ScreenBg } from '../components/ScreenBg';
import { fetchActivities, fetchFeaturedActivity } from '../services/activities.service';
import { fetchCategories } from '../services/catalog.service';
import { useAppStore } from '../store/useAppStore';
import type { Activity, Category } from '../types/auth';
import { colors, spacing, typography } from '../theme/tokens';
import type { MainStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function HomeFeedScreen() {
  const navigation = useNavigation<Nav>();
  const city = useAppStore(s => s.selectedCity);
  const [cat, setCat] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Activity | null>(null);
  const [list, setList] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, feat, items] = await Promise.all([
        fetchCategories(),
        fetchFeaturedActivity(city),
        fetchActivities({ city, categoryId: cat ?? undefined, q: q.trim() || undefined, excludeFeatured: true }),
      ]);
      setCategories(cats);
      setFeatured(feat);
      setList(items);
    } catch {
      setFeatured(null);
      setList([]);
    } finally {
      setLoading(false);
    }
  }, [city, cat, q]);

  useFocusEffect(
    useCallback(() => {
      loadFeed();
    }, [loadFeed]),
  );

  useEffect(() => {
    const t = setTimeout(loadFeed, 400);
    return () => clearTimeout(t);
  }, [q, cat, loadFeed]);

  const nearby = useMemo(() => list, [list]);

  return (
    <ScreenBg>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.greet}>Hey there 👋</Text>
          <View style={styles.headerRow}>
            <Pressable style={styles.loc}>
              <Text style={styles.locTxt}>📍 {city}</Text>
              <Text style={styles.locChev}>▾</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Notifications')}>
              <Text style={styles.bell}>🔔</Text>
            </Pressable>
          </View>
        </View>
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search activities..."
          placeholderTextColor={colors.muted}
          style={styles.search}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
          <CategoryChip label="All" selected={cat === null} onPress={() => setCat(null)} />
          {categories.map(c => (
            <CategoryChip
              key={c.id}
              label={`${c.icon} ${c.name}`}
              selected={cat === c.id}
              onPress={() => setCat(c.id)}
            />
          ))}
        </ScrollView>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
        ) : (
          <>
            {featured ? (
              <>
                <Text style={styles.section}>Featured near you</Text>
                <ActivityCard
                  activity={featured}
                  onPress={() => navigation.navigate('ActivityDetails', { id: featured.id })}
                />
              </>
            ) : null}

            <Text style={styles.section}>Nearby</Text>
            {nearby.length === 0 ? (
              <AppCard>
                <Text style={styles.recBody}>
                  No activities in {city} yet. Tap + to create the first one!
                </Text>
              </AppCard>
            ) : (
              nearby.map(a => (
                <ActivityCard
                  key={a.id}
                  activity={a}
                  onPress={() => navigation.navigate('ActivityDetails', { id: a.id })}
                />
              ))
            )}

            <Text style={styles.section}>Recommended</Text>
            <AppCard>
              <Text style={styles.recTitle}>Based on your interests</Text>
              <Text style={styles.recBody}>
                Create or join activities — recommendations improve as you use InCircle.
              </Text>
            </AppCard>
          </>
        )}
      </ScrollView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: 120 },
  header: { marginBottom: spacing.md },
  greet: { ...typography.display, color: colors.text },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  loc: { flexDirection: 'row', alignItems: 'center' },
  locTxt: { ...typography.subtitle, color: colors.secondary },
  locChev: { color: colors.muted, marginLeft: 6, fontSize: 12 },
  bell: { fontSize: 22, padding: 4 },
  search: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    marginBottom: spacing.md,
  },
  chips: { flexGrow: 0, marginBottom: spacing.lg },
  section: {
    ...typography.caption,
    color: colors.muted,
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  recTitle: { ...typography.subtitle, color: colors.text, marginBottom: 6 },
  recBody: { ...typography.body, color: colors.textSecondary },
});
