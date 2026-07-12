import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';
import { getFaceEmoji } from '../utils/avatarDisplay';

type Props = {
  name: string;
  size?: number;
  uri?: string | null;
};

export function Avatar({ name, size = 44, uri }: Props) {
  const photo = uri?.trim();
  if (photo) {
    return (
      <View
        style={[
          styles.circle,
          styles.photoWrap,
          { width: size, height: size, borderRadius: size / 2 },
        ]}>
        <Image
          source={{ uri: photo }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      </View>
    );
  }

  const emoji = getFaceEmoji(name);
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={{ fontSize: size * 0.52 }}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: 'rgba(77,181,255,0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoWrap: {
    backgroundColor: colors.surface,
  },
});
