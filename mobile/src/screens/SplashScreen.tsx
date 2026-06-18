import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { apiConfigHint } from '../config/api.config';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { useAppStore } from '../store/useAppStore';
import type { RootStackParamList } from '../navigation/types';

const splashBg = require('../../img/splashbg.png');
const sLogo = require('../../img/slogo.png');

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SplashScreen() {
  const navigation = useNavigation<Nav>();
  const { authReady, authLoading } = useAuth();
  const onboardingComplete = useAppStore(s => s.onboardingComplete);
  const isAuthenticated = useAppStore(s => s.isAuthenticated);
  const profileComplete = useAppStore(s => s.profileComplete);
  const interestsComplete = useAppStore(s => s.interestsComplete);

  const goNext = useCallback(() => {
    if (!onboardingComplete) {
      navigation.replace('Onboarding');
    } else if (!isAuthenticated) {
      navigation.replace('Login');
    } else if (!profileComplete) {
      navigation.replace('ProfileSetup');
    } else if (!interestsComplete) {
      navigation.replace('InterestSelection');
    } else {
      navigation.replace('Main');
    }
  }, [
    navigation,
    onboardingComplete,
    isAuthenticated,
    profileComplete,
    interestsComplete,
  ]);

  const busy = !authReady || authLoading;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBlock}>
          <Image source={sLogo} style={styles.logoImg} resizeMode="contain" accessibilityLabel="InCircle logo" />
          <Text style={styles.brandRow} accessibilityRole="header">
            <Text style={styles.brandIn}>In</Text>
            <Text style={styles.brandCircle}>Circle</Text>
          </Text>
          <Text style={styles.tagline}>
            Find people. Make plans. <Text style={styles.taglineAccent}>Go In.</Text>
          </Text>
        </View>

        <View style={styles.heroWrap}>
          <ImageBackground source={splashBg} style={styles.heroBg} imageStyle={styles.heroImage}>
            <LinearGradient
              colors={['rgba(2,6,23,0.82)', 'rgba(2,6,23,0.15)', 'rgba(2,6,23,0.92)']}
              locations={[0, 0.45, 1]}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.heroContent}>
              <Text style={styles.heroLine1}>Real people. Real plans.</Text>
              <Text style={styles.heroLine2}>Real memories.</Text>
              <View style={styles.dotsRow}>
                <View style={[styles.dot, styles.dotActive]} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.bottomBlock}>
          <Pressable
            onPress={goNext}
            disabled={busy}
            style={({ pressed }) => [styles.ctaWrap, pressed && styles.ctaPressed, busy && styles.ctaDisabled]}
            accessibilityRole="button"
            accessibilityLabel="Get started">
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.ctaGrad}>
              {busy ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.ctaText}>Get Started</Text>
              )}
            </LinearGradient>
          </Pressable>
          <Text style={styles.footer}>Join the circle. Be part of something real.</Text>
          {__DEV__ ? <Text style={styles.devHint}>{apiConfigHint()}</Text> : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  topBlock: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  logoImg: {
    width: 96,
    height: 96,
    marginBottom: spacing.sm,
  },
  brandRow: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  brandIn: {
    color: colors.primary,
  },
  brandCircle: {
    color: colors.text,
  },
  tagline: {
    marginTop: spacing.sm,
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  taglineAccent: {
    color: colors.primary,
    fontWeight: '700',
  },
  heroWrap: {
    flex: 1,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderRadius: radii.xl,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  heroBg: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  heroImage: {
    borderRadius: radii.xl,
  },
  heroContent: {
    padding: spacing.xl,
    paddingBottom: spacing.lg,
  },
  heroLine1: {
    ...typography.title,
    color: colors.text,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.55)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 8,
  },
  heroLine2: {
    ...typography.display,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.xs,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  dotActive: {
    backgroundColor: colors.primary,
    width: 22,
    borderRadius: 4,
  },
  bottomBlock: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  ctaWrap: {
    borderRadius: radii.pill,
    overflow: 'hidden',
  },
  ctaPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  ctaDisabled: {
    opacity: 0.7,
  },
  ctaGrad: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    minHeight: 52,
  },
  ctaText: {
    ...typography.subtitle,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footer: {
    marginTop: spacing.md,
    textAlign: 'center',
    ...typography.caption,
    color: colors.muted,
    paddingHorizontal: spacing.md,
  },
  devHint: {
    marginTop: spacing.sm,
    textAlign: 'center',
    ...typography.caption,
    color: colors.muted,
    fontSize: 10,
    paddingHorizontal: spacing.md,
  },
});
