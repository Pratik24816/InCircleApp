import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { ScreenBg } from '../components/ScreenBg';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { apiConfigHint, isGoogleSignInConfigured } from '../config/api.config';
import { isGoogleSignInCancelled, getApiErrorMessage } from '../services/auth.service';
import { colors, spacing, typography } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DEV_ACCOUNTS = [
  { label: 'You (main demo)', email: 'you@incircle.app' },
  { label: 'Priya (host)', email: 'priya@incircle.app' },
  { label: 'Dev (sports)', email: 'dev@incircle.app' },
  { label: 'New user (onboarding)', email: 'new@incircle.app' },
] as const;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { signInWithGoogle, signInWithDev, authLoading } = useAuth();
  const [busy, setBusy] = useState(false);

  const goAfterLogin = (loggedInUser: { isProfileCompleted: boolean; interestIds?: string[] }) => {
    if (!loggedInUser.isProfileCompleted) {
      navigation.replace('ProfileSetup');
    } else if (!loggedInUser.interestIds?.length) {
      navigation.replace('InterestSelection');
    } else {
      navigation.replace('Main');
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isGoogleSignInConfigured()) {
      Alert.alert(
        'Google Sign-In not configured',
        'Use Dev Login below, or set GOOGLE_WEB_CLIENT_ID in api.config.ts',
      );
      return;
    }

    setBusy(true);
    try {
      const loggedInUser = await signInWithGoogle();
      goAfterLogin(loggedInUser);
    } catch (error) {
      if (!isGoogleSignInCancelled(error)) {
        Alert.alert('Sign in failed', getApiErrorMessage(error));
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDevLogin = async (email: string) => {
    setBusy(true);
    try {
      const loggedInUser = await signInWithDev(email);
      goAfterLogin(loggedInUser);
    } catch (error) {
      Alert.alert('Dev login failed', getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const loading = busy || authLoading;

  return (
    <ScreenBg>
      <ScreenHeader title="Welcome back" subtitle="Sign in to continue" />
      <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>InCircle</Text>

        {__DEV__ ? (
          <>
            <Text style={styles.devTitle}>Dev login (no Google needed)</Text>
            <Text style={styles.devHint}>
              Backend: ENABLE_DEV_AUTH=true and run npm run seed
            </Text>
            {DEV_ACCOUNTS.map(acc => (
              <AppButton
                key={acc.email}
                title={acc.label}
                variant="secondary"
                onPress={() => handleDevLogin(acc.email)}
                disabled={loading}
                style={{ marginBottom: spacing.sm }}
              />
            ))}
            <View style={styles.divider} />
          </>
        ) : null}

        <AppInput label="Email or phone" placeholder="you@email.com" keyboardType="email-address" editable={false} />
        <AppInput label="Password" placeholder="••••••••" secureTextEntry editable={false} />
        <View style={styles.row}>
          <AppButton
            title={loading ? '...' : 'Google'}
            variant="secondary"
            onPress={handleGoogleSignIn}
            style={styles.half}
            disabled={loading}
          />
          <AppButton title="Apple" variant="ghost" onPress={() => {}} style={styles.half} disabled />
        </View>
        {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} /> : null}
        <Text style={styles.hint}>{__DEV__ ? apiConfigHint() : 'Sign in with Google'}</Text>
      </ScrollView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  pad: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  brand: {
    ...typography.display,
    color: colors.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  devTitle: { ...typography.subtitle, color: colors.text, marginBottom: spacing.xs },
  devHint: { ...typography.caption, color: colors.muted, marginBottom: spacing.md },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  half: { flex: 1 },
  hint: { ...typography.caption, color: colors.muted, textAlign: 'center', marginTop: spacing.lg },
});
