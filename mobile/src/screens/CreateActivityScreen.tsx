import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { ScreenBg } from '../components/ScreenBg';
import { ScreenHeader } from '../components/ScreenHeader';
import { MOCK_CATEGORIES } from '../data/mock';
import { colors, spacing, typography } from '../theme/tokens';
import type { MainStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<MainStackParamList>;

const groupTypes = [
  { id: 'need_one_person', label: 'Need one person' },
  { id: 'fixed_group', label: 'Fixed group' },
  { id: 'open_join', label: 'Open join' },
] as const;

export function CreateActivityScreen() {
  const navigation = useNavigation<Nav>();
  const [gt, setGt] = useState<string>('open_join');

  return (
    <ScreenBg>
      <ScreenHeader title="Create" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}>
        <AppInput label="Title" placeholder="Morning Walk" />
        <AppInput label="Description" placeholder="What's the plan?" multiline />
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {MOCK_CATEGORIES.map(c => (
            <Text key={c.id} style={styles.chip}>
              {c.icon} {c.name}
            </Text>
          ))}
        </ScrollView>
        <AppInput label="Start date & time" placeholder="2026-06-01 06:30" />
        <AppInput label="Location name" placeholder="Sabarmati Riverfront" />
        <AppInput label="City" placeholder="Ahmedabad" defaultValue="Ahmedabad" />
        <Text style={styles.label}>Group type</Text>
        {groupTypes.map(g => (
          <AppButton
            key={g.id}
            title={g.label}
            variant={gt === g.id ? 'primary' : 'ghost'}
            onPress={() => setGt(g.id)}
            style={{ marginBottom: spacing.sm }}
          />
        ))}
        <AppInput label="Group size (optional)" placeholder="e.g. 8" keyboardType="number-pad" />
        <AppInput label="Tags" placeholder="walk, morning" />
        <View style={styles.cover}>
          <Text style={styles.coverTxt}>Cover image — TODO upload</Text>
        </View>
        <AppButton title="Publish (mock)" onPress={() => navigation.goBack()} />
        <Text style={styles.todo}>TODO: POST /activities</Text>
      </ScrollView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  label: { ...typography.caption, color: colors.muted, marginBottom: spacing.sm, marginTop: spacing.sm },
  chip: {
    ...typography.caption,
    color: colors.text,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    marginRight: spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  cover: {
    height: 120,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.md,
  },
  coverTxt: { ...typography.caption, color: colors.muted },
  todo: { ...typography.caption, color: colors.muted, marginTop: spacing.md, textAlign: 'center' },
});
