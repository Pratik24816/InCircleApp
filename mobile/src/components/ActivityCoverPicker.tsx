import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { AppButton } from './AppButton';
import { colors, radii, spacing, typography } from '../theme/tokens';

type Props = {
  coverUrl: string | null;
  autoLabel: string;
  localUri: string | null;
  onLocalUriChange: (uri: string | null) => void;
};

export function ActivityCoverPicker({ coverUrl, autoLabel, localUri, onLocalUriChange }: Props) {
  const previewUri = localUri ?? coverUrl;

  const pickCover = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 1,
      maxWidth: 1600,
      maxHeight: 900,
      selectionLimit: 1,
    });

    if (result.didCancel || !result.assets?.[0]?.uri) {
      return;
    }
    onLocalUriChange(result.assets[0].uri);
  };

  const clearCustom = () => onLocalUriChange(null);

  const statusLabel = useMemo(() => {
    if (localUri) {
      return 'Custom photo selected';
    }
    return `${autoLabel} — auto-selected`;
  }, [autoLabel, localUri]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Cover photo</Text>
      <Pressable onPress={pickCover} style={({ pressed }) => [styles.preview, pressed && styles.previewPressed]}>
        {previewUri ? (
          <Image source={{ uri: previewUri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmoji}>📷</Text>
            <Text style={styles.placeholderText}>Tap to choose a cover</Text>
          </View>
        )}
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>{localUri ? 'Change photo' : 'Upload photo'}</Text>
        </View>
      </Pressable>
      <Text style={styles.status}>{statusLabel}</Text>
      {localUri ? (
        <AppButton title="Use auto cover instead" variant="ghost" onPress={clearCustom} style={styles.resetBtn} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.sm },
  label: {
    ...typography.caption,
    color: colors.muted,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  preview: {
    height: 160,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  previewPressed: { opacity: 0.92 },
  image: { width: '100%', height: '100%' },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  placeholderEmoji: { fontSize: 32 },
  placeholderText: { ...typography.caption, color: colors.muted },
  overlay: {
    position: 'absolute',
    left: spacing.md,
    bottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(2,6,23,0.72)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(140,255,79,0.35)',
  },
  overlayText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  status: {
    ...typography.caption,
    color: colors.muted,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  resetBtn: { marginTop: spacing.sm },
});
