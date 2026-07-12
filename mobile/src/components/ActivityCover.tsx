import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { Activity } from '../types/auth';
import { colors, radii, spacing, typography } from '../theme/tokens';
import {
  DEFAULT_COVER_URL,
  getCoverPhotoLabel,
  resolveActivityCoverUrl,
} from '../utils/activityCovers';

type Props = {
  activity: Activity;
  height?: number;
  label?: string;
};

export function ActivityCover({ activity, height = 128, label }: Props) {
  const primaryUri = resolveActivityCoverUrl(activity);
  const [uri, setUri] = useState(primaryUri);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setUri(primaryUri);
    setLoading(true);
    setFailed(false);
  }, [primaryUri]);

  const coverLabel = label ?? getCoverPhotoLabel(activity);
  const showPhoto = !failed;

  const handleError = () => {
    if (uri !== DEFAULT_COVER_URL) {
      setUri(DEFAULT_COVER_URL);
      setLoading(true);
      return;
    }
    setFailed(true);
    setLoading(false);
  };

  return (
    <View style={[styles.cover, { height }]}>
      {showPhoto ? (
        <>
          <Image
            key={uri}
            source={{ uri }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
            onError={handleError}
          />
          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary} size="small" />
            </View>
          ) : null}
        </>
      ) : (
        <LinearGradient
          colors={['rgba(77,181,255,0.25)', 'rgba(15,23,42,0.95)']}
          style={StyleSheet.absoluteFill}
        />
      )}

      <LinearGradient
        colors={['rgba(2,6,23,0.05)', 'rgba(2,6,23,0.45)', 'rgba(2,6,23,0.88)']}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.footer}>
        <Text style={styles.label} numberOfLines={1}>
          {coverLabel}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cover: {
    borderRadius: radii.md,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(2,6,23,0.35)',
  },
  footer: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
