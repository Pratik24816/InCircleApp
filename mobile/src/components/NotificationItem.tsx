import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AppNotification } from '../services/notifications.service';
import { colors, spacing, typography } from '../theme/tokens';

export function NotificationItem({
  item,
  onPress,
}: {
  item: AppNotification;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.row, !item.read && styles.unread]}>
      <View style={styles.dot}>{!item.read ? <View style={styles.dotInner} /> : null}</View>
      <View style={styles.body}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.sub} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={styles.time}>
          {new Date(item.createdAt).toLocaleString([], {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  unread: { backgroundColor: 'rgba(77,181,255,0.06)' },
  dot: { width: 14, alignItems: 'center', paddingTop: 4 },
  dotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  body: { flex: 1 },
  title: { ...typography.subtitle, color: colors.text },
  sub: { ...typography.body, color: colors.textSecondary, marginTop: 4 },
  time: { ...typography.caption, color: colors.muted, marginTop: 6 },
});
