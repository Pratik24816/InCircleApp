import React from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { ChatBubble } from '../components/ChatBubble';
import { ScreenBg } from '../components/ScreenBg';
import { getMessagesForChat, MOCK_CHATS } from '../data/mock';
import { colors, spacing, typography } from '../theme/tokens';
import type { ChatsStackList } from '../navigation/types';

type Nav = NativeStackNavigationProp<ChatsStackList>;
type R = RouteProp<ChatsStackList, 'ChatDetail'>;

export function ChatDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const chat = MOCK_CHATS.find(c => c.id === route.params.chatId);
  const messages = getMessagesForChat(route.params.chatId);

  return (
    <ScreenBg>
      <View style={styles.top}>
        <Text style={styles.back} onPress={() => navigation.goBack()}>
          ‹ Back
        </Text>
        <Text style={styles.title}>{chat?.activityTitle ?? 'Chat'}</Text>
      </View>
      <FlatList
        data={messages}
        keyExtractor={m => m.id}
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }}
        renderItem={({ item }) => <ChatBubble message={item} />}
      />
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Message"
          placeholderTextColor={colors.muted}
        />
        <AppButton title="Send" onPress={() => {}} />
      </View>
      <Text style={styles.todo}>TODO: Supabase Realtime + POST message</Text>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  top: {
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  back: { ...typography.caption, color: colors.secondary, marginBottom: 4 },
  title: { ...typography.title, color: colors.text },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },
  todo: { ...typography.caption, color: colors.muted, textAlign: 'center', paddingBottom: 8 },
});
