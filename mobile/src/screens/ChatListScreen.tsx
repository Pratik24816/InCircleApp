import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenBg } from '../components/ScreenBg';
import { MOCK_CHATS } from '../data/mock';
import { colors, spacing, typography } from '../theme/tokens';
import type { ChatsStackList } from '../navigation/types';

type Nav = NativeStackNavigationProp<ChatsStackList>;

export function ChatListScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <ScreenBg>
      <View style={styles.head}>
        <Text style={styles.title}>Chats</Text>
      </View>
      <FlatList
        data={MOCK_CHATS}
        keyExtractor={c => c.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.row}
            onPress={() => navigation.navigate('ChatDetail', { chatId: item.id })}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTxt}>💬</Text>
            </View>
            <View style={styles.body}>
              <Text style={styles.name}>{item.activityTitle}</Text>
              <Text style={styles.last} numberOfLines={1}>
                {item.lastMessage}
              </Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.time}>
                {new Date(item.lastAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              {item.unread > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeTxt}>{item.unread}</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        )}
      />
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm },
  title: { ...typography.display, color: colors.text },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarTxt: { fontSize: 22 },
  body: { flex: 1 },
  name: { ...typography.subtitle, color: colors.text },
  last: { ...typography.body, color: colors.textSecondary, marginTop: 4 },
  right: { alignItems: 'flex-end' },
  time: { ...typography.caption, color: colors.muted },
  badge: {
    marginTop: 6,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeTxt: { fontSize: 11, fontWeight: '800', color: '#052e16' },
});
