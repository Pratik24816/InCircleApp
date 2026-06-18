import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  CommonActions,
  useNavigation,
  type NavigationProp,
  type ParamListBase,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { ScreenBg } from '../components/ScreenBg';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/auth.service';
import { colors, spacing, typography } from '../theme/tokens';
import type { ProfileStackList } from '../navigation/types';

type Nav = NativeStackNavigationProp<ProfileStackList>;

function getRootNavigation(n: Nav): NavigationProp<ParamListBase> {
  let current: unknown = n;
  while (true) {
    const parent = (current as { getParent?: () => unknown }).getParent?.();
    if (!parent) {
      return current as NavigationProp<ParamListBase>;
    }
    current = parent;
  }
}

export function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    setBusy(true);
    try {
      await signOut();
      const root = getRootNavigation(navigation);
      root.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Splash' }],
        }),
      );
    } catch (error) {
      Alert.alert('Logout failed', getApiErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const rows = ['Account', 'Notifications', 'Location', 'Privacy', 'Help'];

  return (
    <ScreenBg>
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        {rows.map(r => (
          <View key={r} style={styles.row}>
            <Text style={styles.rowTxt}>{r}</Text>
            <Text style={styles.chev}>›</Text>
          </View>
        ))}
        <Text style={styles.hint}>Preferences API — coming soon</Text>
        <AppButton
          title={busy ? 'Logging out...' : 'Log out'}
          variant="danger"
          onPress={logout}
          disabled={busy}
          style={{ marginTop: spacing.xl }}
        />
        {busy ? <ActivityIndicator color={colors.danger} style={{ marginTop: spacing.md }} /> : null}
      </ScrollView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowTxt: { ...typography.subtitle, color: colors.text },
  chev: { color: colors.muted, fontSize: 22 },
  hint: { ...typography.caption, color: colors.muted, marginTop: spacing.lg },
});
