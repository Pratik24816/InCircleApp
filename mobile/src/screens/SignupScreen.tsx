import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { ScreenBg } from '../components/ScreenBg';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, spacing, typography } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SignupScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <ScreenBg>
      <ScreenHeader title="Create account" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <AppInput label="Full name" placeholder="Aarav Mehta" />
        <AppInput label="Email" placeholder="you@email.com" keyboardType="email-address" />
        <AppInput label="Password" placeholder="8+ characters" secureTextEntry />
        <AppButton title="Continue" onPress={() => navigation.navigate('Otp', { hint: '+91******3210' })} />
        <Text style={styles.note}>Social signup placeholders — TODO backend</Text>
      </ScrollView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  note: { ...typography.caption, color: colors.muted, marginTop: spacing.lg, textAlign: 'center' },
});
