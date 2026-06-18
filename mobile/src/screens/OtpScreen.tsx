import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { ScreenBg } from '../components/ScreenBg';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAppStore } from '../store/useAppStore';
import { colors, spacing, typography } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type R = RouteProp<RootStackParamList, 'Otp'>;

export function OtpScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const setAuthenticated = useAppStore(s => s.setAuthenticated);
  const profileComplete = useAppStore(s => s.profileComplete);
  const interestsComplete = useAppStore(s => s.interestsComplete);

  const verify = () => {
    setAuthenticated(true);
    if (!profileComplete) {
      navigation.replace('ProfileSetup');
    } else if (!interestsComplete) {
      navigation.replace('InterestSelection');
    } else {
      navigation.replace('Main');
    }
  };

  return (
    <ScreenBg>
      <ScreenHeader title="Verify" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.sub}>
          Enter the code we sent {route.params?.hint ? `to ${route.params.hint}` : ''}.
        </Text>
        <AppInput label="OTP" placeholder="6-digit code" keyboardType="number-pad" />
        <AppButton title="Verify" onPress={verify} />
        <Text style={styles.note}>TODO: Supabase phone OTP</Text>
      </ScrollView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  sub: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  note: { ...typography.caption, color: colors.muted, marginTop: spacing.lg, textAlign: 'center' },
});
