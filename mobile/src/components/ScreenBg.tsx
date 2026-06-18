import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme/tokens';

export function ScreenBg({ children, style, ...rest }: ViewProps) {
  return (
    <LinearGradient
      colors={[colors.background, '#0a1224', colors.background]}
      style={[styles.flex, style]}
      {...rest}>
      <View style={styles.flex}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
