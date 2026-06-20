import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ActivityCard } from '../components/ActivityCard';
import { AppCard } from '../components/AppCard';
import { CategoryChip } from '../components/CategoryChip';
import { FeedEmptyState } from '../components/FeedEmptyState';
import { ScreenBg } from '../components/ScreenBg';
import { NearbyAreasSection } from '../components/NearbyAreasSection';
import { TonightSection } from '../components/TonightSection';
import { fetchActivities, fetchFeaturedActivity, fetchTonightActivities, joinActivity } from '../services/activities.service';
import { getApiErrorMessage } from '../services/auth.service';
import { fetchCategories } from '../services/catalog.service';
import { fetchUnreadNotificationCount } from '../services/notifications.service';
import { useAppStore } from '../store/useAppStore';
import type { Activity, Category } from '../types/auth';
import { colors, spacing, typography } from '../theme/tokens';
import type { MainStackParamList, TabParamList } from '../navigation/types';
import { getClosestArea, getNeighborhoodName, formatDistance, getActivityDistanceKm } from '../utils/locationDisplay';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function HomeFeedScreen() {
  const navigation = useNavigation<Nav>();
  const city = useAppStore(s => s.selectedCity);
  const [cat, setCat] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [featured, setFeatured] = useState<Activity | null>(null);
  const [tonight, setTonight] = useState<Activity[]>([]);
  const [list, setList] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [areaFilter, setAreaFilter] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadFeed = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const [cats, feat, tonightItems, items] = await Promise.all([
        fetchCategories(),
        fetchFeaturedActivity(city),
        fetchTonightActivities(city),
        fetchActivities({
          city,
          categoryId: cat ?? undefined,
          q: q.trim() || undefined,
          excludeFeatured: true,
        }),
      ]);
      setCategories(cats);
      setFeatured(feat);
      setTonight(tonightItems);
      setList(items);
    } catch {
      setFeatured(null);
      setTonight([]);
      setList([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [city, cat, q]);

  useFocusEffect(
    useCallback(() => {
      loadFeed();
      fetchUnreadNotificationCount()
        .then(setUnreadCount)
        .catch(() => setUnreadCount(0));
    }, [loadFeed]),
  );

  useEffect(() => {
    const t = setTimeout(() => loadFeed(true), 400);
    return () => clearTimeout(t);
  }, [q, cat, loadFeed]);

  const handleJoin = async (activityId: string) => {
    setJoiningId(activityId);
    try {
      await joinActivity(activityId);
      await loadFeed(true);
    } catch (error) {
      Alert.alert('Could not join', getApiErrorMessage(error));
    } finally {
      setJoiningId(null);
    }
  };

  const handleHostPlan = () => {
    navigation.getParent<BottomTabNavigationProp<TabParamList>>()?.navigate('CreateTab');
  };

  const tonightIds = useMemo(() => new Set(tonight.map(a => a.id)), [tonight]);
  const nearby = useMemo(
    () =>
      list
        .filter(a => !tonightIds.has(a.id))
        .sort((a, b) => getActivityDistanceKm(a) - getActivityDistanceKm(b)),
    [list, tonightIds],
  );
  const nearbyAreas = useMemo(() => [...nearby, ...tonight, ...(featured ? [featured] : [])], [nearby, tonight, featured]);
  const closestArea = useMemo(() => getClosestArea(nearbyAreas), [nearbyAreas]);
  const filteredNearby = useMemo(() => {
    if (!areaFilter) {
      return nearby;
    }
    return nearby.filter(a => getNeighborhoodName(a.locationName) === areaFilter);
  }, [nearby, areaFilter]);

  return (
    <ScreenBg>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadFeed(true);
            }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }>
        <View style={styles.header}>
          <Text style={styles.greet}>Hey there 👋</Text>
          <View style={styles.headerRow}>
            <Pressable style={styles.loc}>
              <Text style={styles.locTxt}>
                📍 {closestArea ? closestArea.name : 'Near you'}
                {closestArea ? ` • ${formatDistance(closestArea.distanceKm)}` : ''}
              </Text>
              <Text style={styles.locChev}>▾</Text>
            </Pressable>
            <Pressable onPress={() => navigation.navigate('Notifications')} style={styles.bellWrap}>
              <Text style={styles.bell}>🔔</Text>
              {unreadCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeTxt}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>

        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Search plans..."
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

        {!loading ? (
          <TonightSection
            activities={tonight}
            onSelect={a => navigation.navigate('ActivityDetails', { id: a.id })}
          />
        ) : null}

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
        ) : (
          <>
            {featured ? (
              <>
                <Text style={styles.section}>Don't miss tonight</Text>
                <ActivityCard
                  activity={featured}
                  featured
                  onPress={() => navigation.navigate('ActivityDetails', { id: featured.id })}
                  onJoin={() => handleJoin(featured.id)}
                  joining={joiningId === featured.id}
                />
              </>
            ) : null}

            <NearbyAreasSection
              activities={nearbyAreas}
              selected={areaFilter}
              onSelect={area => setAreaFilter(area?.name ?? null)}
            />

            <Text style={styles.section}>Plans around you</Text>
            {filteredNearby.length === 0 ? (
              <FeedEmptyState city={city} area={areaFilter} onHostPlan={handleHostPlan} />
            ) : (
              filteredNearby.map(a => (
                <ActivityCard
                  key={a.id}
                  activity={a}
                  onPress={() => navigation.navigate('ActivityDetails', { id: a.id })}
                  onJoin={() => handleJoin(a.id)}
                  joining={joiningId === a.id}
                />
              ))
            )}

            {filteredNearby.length > 0 || featured || tonight.length > 0 ? (
              <>
                <Text style={styles.section}>For you</Text>
                <AppCard>
                  <Text style={styles.recTitle}>Based on your vibe</Text>
                  <Text style={styles.recBody}>
                    Tap I'm In to RSVP instantly — no need to open every plan first.
                  </Text>
                </AppCard>
              </>
            ) : null}
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
  bellWrap: { position: 'relative', padding: 4 },
  bell: { fontSize: 22 },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeTxt: { fontSize: 10, fontWeight: '800', color: '#052e16' },
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
    textTransform: 'uppercase',
  },
  recTitle: { ...typography.subtitle, color: colors.text, marginBottom: 6 },
  recBody: { ...typography.body, color: colors.textSecondary },
});
