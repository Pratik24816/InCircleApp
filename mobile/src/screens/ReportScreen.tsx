import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { ScreenBg } from '../components/ScreenBg';
import { ScreenHeader } from '../components/ScreenHeader';
import { colors, spacing, typography } from '../theme/tokens';
import type { MainStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<MainStackParamList>;
type R = RouteProp<MainStackParamList, 'Report'>;

const types = ['user', 'activity', 'message', 'spam', 'harassment', 'unsafe', 'other'];

export function ReportScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<R>();
  const [type, setType] = useState('activity');

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
        <AppInput label="Reason" placeholder="e.g. unsafe" />
        <AppInput label="Description" placeholder="What happened?" multiline />
        <AppButton title="Submit (mock)" onPress={() => navigation.goBack()} />
        <Text style={styles.todo}>TODO: POST /reports</Text>
      </ScrollView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  meta: { ...typography.caption, color: colors.muted, marginBottom: spacing.md },
  label: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm },
  types: { marginBottom: spacing.md },
  todo: { ...typography.caption, color: colors.muted, marginTop: spacing.md, textAlign: 'center' },
});
