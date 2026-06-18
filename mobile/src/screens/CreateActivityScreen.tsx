import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { ScreenBg } from '../components/ScreenBg';
import { ScreenHeader } from '../components/ScreenHeader';
import { createActivity } from '../services/activities.service';
import { fetchCategories } from '../services/catalog.service';
import { getApiErrorMessage } from '../services/auth.service';
import { useAppStore } from '../store/useAppStore';
import type { Category } from '../types/auth';
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
  const city = useAppStore(s => s.selectedCity);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [gt, setGt] = useState<(typeof groupTypes)[number]['id']>('open_join');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDatetime, setStartDatetime] = useState('');
  const [locationName, setLocationName] = useState('');
  const [activityCity, setActivityCity] = useState(city);
  const [groupSize, setGroupSize] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories()
      .then(cats => {
        setCategories(cats);
        if (cats[0]) {
          setCategoryId(cats[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const publish = async () => {
    if (!title.trim() || !description.trim() || !locationName.trim() || !startDatetime.trim()) {
      Alert.alert('Missing fields', 'Title, description, start time, and location are required.');
      return;
    }
    if (!categoryId) {
      Alert.alert('Pick a category');
      return;
    }

    const parsed = new Date(startDatetime.replace(' ', 'T'));
    if (Number.isNaN(parsed.getTime())) {
      Alert.alert('Invalid date', 'Use format: 2026-06-01T06:30 or 2026-06-01 06:30');
      return;
    }

    setSaving(true);
    try {
      await createActivity({
        title: title.trim(),
        description: description.trim(),
        categoryId,
        startDatetime: parsed.toISOString(),
        locationName: locationName.trim(),
        city: activityCity.trim() || city,
        groupType: gt,
        groupSize: groupSize.trim() ? parseInt(groupSize, 10) : null,
        tags: tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
      });
      navigation.goBack();
    } catch (error) {
      Alert.alert('Could not create activity', getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenBg>
      <ScreenHeader title="Create" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 100 }}>
        <AppInput label="Title" placeholder="Morning Walk" value={title} onChangeText={setTitle} />
        <AppInput
          label="Description"
          placeholder="What's the plan?"
          multiline
          value={description}
          onChangeText={setDescription}
        />
        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map(c => (
            <Pressable key={c.id} onPress={() => setCategoryId(c.id)}>
              <Text style={[styles.chip, categoryId === c.id && styles.chipOn]}>
                {c.icon} {c.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
        <AppInput
          label="Start date & time"
          placeholder="2026-06-01T06:30"
          value={startDatetime}
          onChangeText={setStartDatetime}
        />
        <AppInput
          label="Location name"
          placeholder="Sabarmati Riverfront"
          value={locationName}
          onChangeText={setLocationName}
        />
        <AppInput label="City" placeholder="Ahmedabad" value={activityCity} onChangeText={setActivityCity} />
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
        <AppInput
          label="Group size (optional)"
          placeholder="e.g. 8"
          keyboardType="number-pad"
          value={groupSize}
          onChangeText={setGroupSize}
        />
        <AppInput label="Tags" placeholder="walk, morning" value={tags} onChangeText={setTags} />
        <View style={styles.cover}>
          <Text style={styles.coverTxt}>Cover image — coming soon</Text>
        </View>
        <AppButton title={saving ? 'Publishing...' : 'Publish'} onPress={publish} disabled={saving} />
        {saving ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} /> : null}
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
  chipOn: { borderColor: colors.primary, backgroundColor: 'rgba(140,255,79,0.12)' },
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
});
