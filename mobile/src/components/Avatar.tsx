import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../theme/tokens';

type Props = { name: string; size?: number };

export function Avatar({ name, size = 44 }: Props) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initial, { fontSize: size * 0.38 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: 'rgba(77,181,255,0.25)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: { ...typography.title, color: colors.secondary },
});
