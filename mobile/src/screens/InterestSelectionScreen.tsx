import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { InterestChip } from '../components/InterestChip';
import { ScreenBg } from '../components/ScreenBg';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { fetchInterests, saveUserInterests } from '../services/catalog.service';
import { getApiErrorMessage } from '../services/auth.service';
import { useAppStore } from '../store/useAppStore';
import type { Interest } from '../types/auth';
import { colors, spacing, typography } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function InterestSelectionScreen() {
  const navigation = useNavigation<Nav>();
  const { user, refreshUser } = useAuth();
  const setInterestsComplete = useAppStore(s => s.setInterestsComplete);
  const setSelectedInterests = useAppStore(s => s.setSelectedInterests);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const list = await fetchInterests();
        setInterests(list);
        const initial = user?.interestIds?.length ? user.interestIds : [];
        setSel(new Set(initial));
      } catch (error) {
        Alert.alert('Could not load interests', getApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
    })();
  }, [user?.interestIds]);

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

  const done = async () => {
    if (sel.size === 0) {
      Alert.alert('Pick at least one interest');
      return;
    }
    setSaving(true);
    try {
      const saved = await saveUserInterests([...sel]);
      setSelectedInterests(saved.map(i => i.id));
      setInterestsComplete(true);
      await refreshUser();
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Could not save interests', getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenBg>
      <ScreenHeader title="Interests" subtitle="Step 2 of 2" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text style={styles.lead}>Pick what moves you. This powers recommendations later.</Text>
        {loading ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <View style={styles.grid}>
            {interests.map(i => (
              <InterestChip
                key={i.id}
                label={i.name}
                selected={sel.has(i.id)}
                onPress={() => toggle(i.id)}
              />
            ))}
          </View>
        )}
        <AppButton title={saving ? 'Saving...' : 'Finish'} onPress={done} disabled={saving || loading} />
      </ScrollView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  lead: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -4, marginBottom: spacing.lg },
});
