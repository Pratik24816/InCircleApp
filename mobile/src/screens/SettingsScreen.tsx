import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import {
  CommonActions,
  useNavigation,
  type NavigationProp,
  type ParamListBase,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { InterestChip } from '../components/InterestChip';
import { ScreenBg } from '../components/ScreenBg';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/auth.service';
import {
  fetchNotificationPreferences,
  fetchPushStatus,
  NOTIFICATION_TONE_OPTIONS,
  sendTestNotification,
  updateNotificationPreferences,
  type NotificationTone,
} from '../services/notifications.service';
import {
  isExternalPushServerReady,
  registerExternalPushWithBackend,
  requestExternalPushPermission,
  showExternalPushNotification,
} from '../services/externalPush.service';
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
  const [loadingPrefs, setLoadingPrefs] = useState(true);
  const [savingTone, setSavingTone] = useState(false);
  const [testing, setTesting] = useState(false);
  const [tone, setTone] = useState<NotificationTone>('cheesy');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [pushServerEnabled, setPushServerEnabled] = useState(false);
  const [pushPermission, setPushPermission] = useState(false);

  const loadPrefs = useCallback(async () => {
    setLoadingPrefs(true);
    try {
      const [prefs, pushStatus] = await Promise.all([
        fetchNotificationPreferences(),
        fetchPushStatus(),
      ]);
      setTone(prefs.tone);
      setPushEnabled(prefs.pushEnabled);
      setPushServerEnabled(pushStatus.enabled);
      const allowed = await requestExternalPushPermission();
      setPushPermission(allowed);
      if (allowed) {
        await registerExternalPushWithBackend();
      }
    } catch (error) {
      Alert.alert('Could not load settings', getApiErrorMessage(error));
    } finally {
      setLoadingPrefs(false);
    }
  }, []);

  useEffect(() => {
    loadPrefs();
  }, [loadPrefs]);

  const onToneChange = async (next: NotificationTone) => {
    if (next === tone) {
      return;
    }
    setSavingTone(true);
    try {
      const prefs = await updateNotificationPreferences({ tone: next });
      setTone(prefs.tone);
    } catch (error) {
      Alert.alert('Could not save tone', getApiErrorMessage(error));
    } finally {
      setSavingTone(false);
    }
  };

  const onPushToggle = async (value: boolean) => {
    setPushEnabled(value);
    try {
      await updateNotificationPreferences({ pushEnabled: value });
    } catch (error) {
      setPushEnabled(!value);
      Alert.alert('Could not update push', getApiErrorMessage(error));
    }
  };

  const onTestNotification = async () => {
    setTesting(true);
    try {
      const allowed = await requestExternalPushPermission();
      if (!allowed) {
        Alert.alert('Notifications blocked', 'Allow notifications in system settings to see lock-screen alerts.');
        return;
      }

      const notification = await sendTestNotification();
      await showExternalPushNotification({
        title: notification.title,
        body: notification.body,
        type: notification.type,
        notificationId: notification.id,
        activityId: notification.activityId,
      });
    } catch (error) {
      Alert.alert('Test failed', getApiErrorMessage(error));
    } finally {
      setTesting(false);
    }
  };

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

  const rows = ['Account', 'Location', 'Privacy', 'Help'];

  return (
    <ScreenBg>
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        {loadingPrefs ? (
          <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.md }} />
        ) : (
          <>
            <Text style={styles.label}>Notification vibe</Text>
            <View style={styles.chipRow}>
              {NOTIFICATION_TONE_OPTIONS.map(option => (
                <InterestChip
                  key={option.id}
                  label={option.label}
                  selected={tone === option.id}
                  onPress={() => onToneChange(option.id)}
                />
              ))}
            </View>
            <Text style={styles.hint}>
              {NOTIFICATION_TONE_OPTIONS.find(o => o.id === tone)?.hint ?? ''}
              {savingTone ? ' · Saving…' : ''}
            </Text>

            <View style={styles.toggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTxt}>Lock-screen push</Text>
                <Text style={styles.hint}>
                  {pushPermission
                    ? isExternalPushServerReady() && pushServerEnabled
                      ? 'System tray + server push (Firebase connected)'
                      : isExternalPushServerReady()
                        ? 'FCM ready — add Firebase service account on server'
                        : 'Tray works via Notifee — add google-services.json for background push'
                    : 'Allow notification permission when prompted'}
                </Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={onPushToggle}
                trackColor={{ true: colors.primary, false: colors.border }}
              />
            </View>

            <AppButton
              title={testing ? 'Sending…' : 'Send test lock-screen notification'}
              variant="secondary"
              onPress={onTestNotification}
              disabled={testing}
              style={{ marginTop: spacing.md }}
            />
            <Text style={styles.hint}>
              Pull down the notification shade — you should see a Zomato-style tray card (not an in-app
              popup). Minimize the app and send again to confirm background delivery.
            </Text>
          </>
        )}

        {rows.map(r => (
          <Pressable key={r} style={styles.row}>
            <Text style={styles.rowTxt}>{r}</Text>
            <Text style={styles.chev}>›</Text>
          </Pressable>
        ))}

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
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.sm,
    fontWeight: '700',
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowTxt: { ...typography.subtitle, color: colors.text },
  chev: { color: colors.muted, fontSize: 22 },
  hint: { ...typography.caption, color: colors.muted, marginTop: spacing.sm },
});
