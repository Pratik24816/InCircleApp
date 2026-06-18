import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors, radii, spacing, typography } from '../theme/tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  disabled,
  style,
}: Props) {
  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.wrap,
          pressed && styles.pressed,
          disabled && styles.disabled,
          style,
        ]}>
        <LinearGradient
          colors={['#7AE850', '#8CFF4F', '#5FD94A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.primaryGrad}>
          <Text style={styles.primaryText}>{title}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  const textStyle: TextStyle[] = [styles.textBase];
  if (variant === 'secondary') {
    textStyle.push({ color: colors.secondary });
  } else if (variant === 'danger') {
    textStyle.push({ color: colors.danger });
  } else {
    textStyle.push({ color: colors.textSecondary });
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.ghostWrap,
        variant === 'secondary' && styles.secondaryBorder,
        variant === 'danger' && styles.dangerBorder,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      <Text style={textStyle}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radii.pill, overflow: 'hidden' },
  primaryGrad: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderRadius: radii.pill,
  },
  primaryText: {
    ...typography.subtitle,
    color: '#052e16',
    fontWeight: '700',
  },
  ghostWrap: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  secondaryBorder: { borderColor: 'rgba(77,181,255,0.45)' },
  dangerBorder: { borderColor: 'rgba(255,90,95,0.55)', backgroundColor: 'rgba(255,90,95,0.08)' },
  textBase: { ...typography.subtitle },
  pressed: { opacity: 0.88 },
  disabled: { opacity: 0.45 },
});
