import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppButton } from './AppButton';
import { colors, radii, spacing, typography } from '../theme/tokens';

type Props = {
  visible: boolean;
  planTitle: string;
  onViewPlans: () => void;
  onDone: () => void;
};

export function CreatePublishSuccess({ visible, planTitle, onViewPlans, onDone }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDone}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <Text style={styles.emoji}>🔥</Text>
          <Text style={styles.title}>Plan is live!</Text>
          <Text style={styles.subtitle}>
            {planTitle.trim() ? `"${planTitle.trim()}"` : 'Your plan'} is on the feed. People nearby can tap I'm In.
          </Text>
          <AppButton title="View my plans" onPress={onViewPlans} style={styles.primaryBtn} />
          <Pressable onPress={onDone} style={styles.doneBtn}>
            <Text style={styles.doneText}>Done</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(2,6,23,0.88)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#0B1224',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(140,255,79,0.25)',
    alignItems: 'center',
  },
  emoji: { fontSize: 48, marginBottom: spacing.sm },
  title: {
    ...typography.display,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 22,
  },
  primaryBtn: { alignSelf: 'stretch', marginBottom: spacing.sm },
  doneBtn: { paddingVertical: spacing.md },
  doneText: {
    ...typography.subtitle,
    color: colors.muted,
  },
});
