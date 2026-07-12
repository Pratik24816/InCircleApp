import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NotificationItem } from '../components/NotificationItem';
import { ScreenBg } from '../components/ScreenBg';
import { ScreenHeader } from '../components/ScreenHeader';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type AppNotification,
} from '../services/notifications.service';
import { getApiErrorMessage } from '../services/auth.service';
import { colors, spacing, typography } from '../theme/tokens';
import type { MainStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function NotificationsScreen() {
  const navigation = useNavigation<Nav>();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchNotifications();
      setItems(list);
    } catch (err) {
      setError(getApiErrorMessage(err));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handlePress = async (item: AppNotification) => {
    try {
      if (!item.read) {
        await markNotificationRead(item.id);
        setItems(prev => prev.map(n => (n.id === item.id ? { ...n, read: true } : n)));
      }
      if (item.activityId) {
        navigation.navigate('ActivityDetails', { id: item.activityId });
      }
    } catch {
      if (item.activityId) {
        navigation.navigate('ActivityDetails', { id: item.activityId });
      }
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setItems(prev => prev.map(n => ({ ...n, read: true })));
    } catch {
      // ignore
    }
  };

  const hasUnread = items.some(n => !n.read);

  return (
    <ScreenBg>
      <ScreenHeader
        title="Notifications"
        onBack={() => navigation.goBack()}
        right={
          hasUnread ? (
            <Pressable onPress={handleMarkAll} hitSlop={8}>
              <Text style={styles.markAll}>Mark all read</Text>
            </Pressable>
          ) : null
        }
      />
      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>All caught up</Text>
          <Text style={styles.emptySub}>Join or host a plan — updates show up here.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <NotificationItem item={item} onPress={() => handlePress(item)} />
          )}
          contentContainerStyle={styles.list}
        />
      )}
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 40 },
  loader: { marginTop: spacing.lg },
  error: { ...typography.body, color: colors.danger, padding: spacing.lg },
  empty: { padding: spacing.xl, alignItems: 'center' },
  emptyTitle: { ...typography.subtitle, color: colors.text, marginBottom: spacing.xs },
  emptySub: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  markAll: { ...typography.caption, color: colors.secondary, fontWeight: '700' },
});
