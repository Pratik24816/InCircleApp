import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { InterestChip } from '../components/InterestChip';
import { ScreenBg } from '../components/ScreenBg';
import { ScreenHeader } from '../components/ScreenHeader';
import { MOCK_INTERESTS } from '../data/mock';
import { useAppStore } from '../store/useAppStore';
import { colors, spacing, typography } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function InterestSelectionScreen() {
  const navigation = useNavigation<Nav>();
  const setInterestsComplete = useAppStore(s => s.setInterestsComplete);
  const setSelectedInterests = useAppStore(s => s.setSelectedInterests);
  const [sel, setSel] = useState<Set<string>>(new Set(['i1', 'i3', 'i8']));

  const toggle = (id: string) => {
    setSel(prev => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });
  };

  const done = () => {
    setSelectedInterests([...sel]);
    setInterestsComplete(true);
    navigation.replace('Main');
  };

  return (
    <ScreenBg>
      <ScreenHeader title="Interests" subtitle="Step 2 of 2" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.lead}>Pick what moves you. This powers recommendations later.</Text>
        <View style={styles.grid}>
          {MOCK_INTERESTS.map(i => (
            <InterestChip
              key={i.id}
              label={i.name}
              selected={sel.has(i.id)}
              onPress={() => toggle(i.id)}
            />
          ))}
        </View>
        <AppButton title="Finish" onPress={done} />
        <Text style={styles.note}>TODO: sync PUT /users/me/interests</Text>
      </ScrollView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  lead: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4, marginBottom: spacing.lg },
  note: { ...typography.caption, color: colors.muted, marginTop: spacing.md, textAlign: 'center' },
});
