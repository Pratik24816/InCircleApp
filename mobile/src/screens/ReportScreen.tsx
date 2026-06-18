import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { ScreenBg } from '../components/ScreenBg';
import { ScreenHeader } from '../components/ScreenHeader';
import { getApiErrorMessage } from '../services/auth.service';
import { submitReport } from '../services/reports.service';
import { colors, spacing, typography } from '../theme/tokens';
import type { MainStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<MainStackParamList>;
type R = RouteProp<MainStackParamList, 'Report'>;

const types = ['user', 'activity', 'message', 'spam', 'harassment', 'unsafe', 'other'];

export function ReportScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const [type, setType] = useState('activity');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!reason.trim()) {
      Alert.alert('Reason required');
      return;
    }
    setSaving(true);
    try {
      await submitReport({
        reportType: type,
        reason: reason.trim(),
        description: description.trim() || undefined,
        activityId: route.params?.activityId,
      });
      Alert.alert('Report submitted', 'Thanks — our team will review it.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Could not submit report', getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenBg>
      <ScreenHeader title="Report" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.meta}>
          Context: {route.params?.activityId ? `activity ${route.params.activityId}` : 'general'}
        </Text>
        <Text style={styles.label}>Report type</Text>
        <View style={styles.types}>
          {types.map(t => (
            <AppButton
              key={t}
              title={t}
              variant={type === t ? 'primary' : 'ghost'}
              onPress={() => setType(t)}
              style={{ marginBottom: 6 }}
            />
          ))}
        </View>
        <AppInput label="Reason" placeholder="e.g. unsafe" value={reason} onChangeText={setReason} />
        <AppInput
          label="Description"
          placeholder="What happened?"
          multiline
          value={description}
          onChangeText={setDescription}
        />
        <AppButton title={saving ? 'Submitting...' : 'Submit'} onPress={submit} disabled={saving} />
        {saving ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} /> : null}
      </ScrollView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  meta: { ...typography.caption, color: colors.muted, marginBottom: spacing.md },
  label: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  types: { marginBottom: spacing.md },
});
