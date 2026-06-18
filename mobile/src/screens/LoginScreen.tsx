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
import { useAppStore } from '../store/useAppStore';
import { colors, spacing, typography } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { signInWithGoogle, authLoading } = useAuth();
  const interestsComplete = useAppStore(s => s.interestsComplete);
  const [busy, setBusy] = useState(false);

  const showEmailNotReady = () => {
    Alert.alert(
      'Coming soon',
      'Email/password login is not on the backend yet. Use Google sign-in.',
    );
  };

  const handleGoogleSignIn = async () => {
    if (!isGoogleSignInConfigured()) {
      Alert.alert(
        'Google Sign-In not configured',
        'Set GOOGLE_WEB_CLIENT_ID in mobile/src/config/api.config.ts and matching IDs in backend/.env',
      );
      return;
    }

    setBusy(true);
    try {
      const loggedInUser = await signInWithGoogle();
      if (!loggedInUser.isProfileCompleted) {
        navigation.replace('ProfileSetup');
      } else if (!interestsComplete) {
        navigation.replace('InterestSelection');
      } else {
        navigation.replace('Main');
      }
    } catch (error) {
      if (!isGoogleSignInCancelled(error)) {
        Alert.alert('Sign in failed', getApiErrorMessage(error));
      }
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
        <AppInput label="Email or phone" placeholder="you@email.com" keyboardType="email-address" editable={false} />
        <AppInput label="Password" placeholder="••••••••" secureTextEntry editable={false} />
        <AppButton title="Sign in (email — soon)" onPress={showEmailNotReady} disabled={loading} />
        <AppButton
          title="Create account"
          variant="ghost"
          onPress={() => navigation.navigate('Signup')}
          style={{ marginTop: spacing.sm }}
          disabled={loading}
        />
        <View style={styles.row}>
          <AppButton
            title={loading ? '...' : 'Google'}
            variant="secondary"
            onPress={handleGoogleSignIn}
            style={styles.half}
            disabled={loading}
          />
          <AppButton title="Apple" variant="secondary" onPress={showEmailNotReady} style={styles.half} disabled={loading} />
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
  row: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  half: { flex: 1 },
  hint: { ...typography.caption, color: colors.muted, textAlign: 'center', marginTop: spacing.lg },
});
