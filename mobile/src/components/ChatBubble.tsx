import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { MockMessage } from '../types/models';
import { colors, radii, spacing, typography } from '../theme/tokens';

export function ChatBubble({ message }: { message: MockMessage }) {
  if (message.messageType === 'system') {
    return (
      <View style={styles.systemWrap}>
        <Text style={styles.system}>
          {message.systemEventType === 'user_joined'
            ? 'Someone joined the circle'
            : 'System update'}
        </Text>
      </View>
    );
  }
  const mine = message.isMine;
  return (
    <View style={[styles.row, mine && styles.rowMine]}>
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
        {!mine ? (
          <Text style={styles.name}>{message.senderName}</Text>
        ) : null}
        <Text style={[styles.msg, mine && styles.msgMine]}>{message.message}</Text>
        <Text style={[styles.time, mine && styles.timeMine]}>
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { marginBottom: spacing.sm, alignItems: 'flex-start' },
  rowMine: { alignItems: 'flex-end' },
  bubble: {
    maxWidth: '82%',
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  bubbleMine: {
    backgroundColor: 'rgba(140,255,79,0.12)',
    borderColor: 'rgba(140,255,79,0.35)',
  },
  bubbleOther: { backgroundColor: 'rgba(77,181,255,0.08)' },
  name: { ...typography.caption, color: colors.secondary, marginBottom: 4 },
  msg: { ...typography.body, color: colors.text },
  msgMine: { color: colors.text },
  time: { ...typography.caption, color: colors.muted, marginTop: 6 },
  timeMine: { color: colors.muted, textAlign: 'right' },
  systemWrap: { alignItems: 'center', marginVertical: spacing.sm },
  system: {
    ...typography.caption,
    color: colors.muted,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
});
