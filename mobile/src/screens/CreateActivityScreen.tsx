import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityDatePicker } from '../components/ActivityDatePicker';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { CreateActivityPreview } from '../components/CreateActivityPreview';
import { ScreenBg } from '../components/ScreenBg';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { createActivity } from '../services/activities.service';
import { fetchCategories } from '../services/catalog.service';
import { getApiErrorMessage } from '../services/auth.service';
import { useAppStore } from '../store/useAppStore';
import type { Category } from '../types/auth';
import { colors, radii, spacing, typography } from '../theme/tokens';
import type { CreateStackList } from '../navigation/types';
import { buildActivityPreview } from '../utils/buildActivityPreview';
import { getTomorrowPreset } from '../utils/activityDatetime';
import { getCoverPhotoLabel, resolveActivityCoverUrl } from '../utils/activityCovers';

type Nav = NativeStackNavigationProp<CreateStackList>;

const FOOTER_HEIGHT = 76;

const groupTypes = [
  {
    id: 'open_join' as const,
    label: 'Open join',
    hint: 'Anyone nearby can tap I\'m In',
    emoji: '🌍',
  },
  {
    id: 'need_one_person' as const,
    label: 'Need one person',
    hint: 'Almost full — one spot to fill',
    emoji: '🙋',
  },
  {
    id: 'fixed_group' as const,
    label: 'Fixed group',
    hint: 'Set crew size and keep it tight',
    emoji: '👥',
  },
];

type GroupTypeId = (typeof groupTypes)[number]['id'];

type PlanStepProps = {
  title: string;
  description: string;
  tags: string;
  categories: Category[];
  categoryId: string | null;
  coverLabel: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onCategoryChange: (id: string) => void;
};

function CreatePlanStep({
  title,
  description,
  tags,
  categories,
  categoryId,
  coverLabel,
  onTitleChange,
  onDescriptionChange,
  onTagsChange,
  onCategoryChange,
}: PlanStepProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionEyebrow}>The plan</Text>
      <Text style={styles.lead}>What's the vibe?</Text>
      <Text style={styles.leadSub}>Name it, describe it, pick a category.</Text>
      <AppInput label="Title" placeholder="Morning Riverfront Walk" value={title} onChangeText={onTitleChange} />
      <AppInput
        label="Description"
        placeholder="Easy 5 km walk. All paces welcome."
        multiline
        value={description}
        onChangeText={onDescriptionChange}
      />
      <Text style={styles.label}>Category</Text>
      <View style={styles.chipRow}>
        {categories.map(c => (
          <Pressable key={c.id} onPress={() => onCategoryChange(c.id)}>
            <Text style={[styles.chip, categoryId === c.id && styles.chipOn]}>
              {c.icon} {c.name}
            </Text>
          </Pressable>
        ))}
      </View>
      <AppInput label="Vibe tags" placeholder="chill, cricket, walk" value={tags} onChangeText={onTagsChange} />
      <Text style={styles.coverHint}>Cover photo: {coverLabel} — auto-selected</Text>
    </View>
  );
}

type TimePlaceStepProps = {
  startDate: Date;
  locationName: string;
  activityCity: string;
  onStartDateChange: (date: Date) => void;
  onLocationNameChange: (value: string) => void;
  onActivityCityChange: (value: string) => void;
};

function CreateTimePlaceStep({
  startDate,
  locationName,
  activityCity,
  onStartDateChange,
  onLocationNameChange,
  onActivityCityChange,
}: TimePlaceStepProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionEyebrow}>Time & place</Text>
      <Text style={styles.lead}>When & where?</Text>
      <Text style={styles.leadSub}>Help people find you IRL.</Text>
      <ActivityDatePicker value={startDate} onChange={onStartDateChange} />
      <AppInput
        label="Location"
        placeholder="Sabarmati Riverfront Gate 3"
        value={locationName}
        onChangeText={onLocationNameChange}
      />
      <AppInput label="City" placeholder="Ahmedabad" value={activityCity} onChangeText={onActivityCityChange} />
    </View>
  );
}

type CrewStepProps = {
  groupType: GroupTypeId;
  groupSize: string;
  onGroupTypeChange: (id: GroupTypeId) => void;
  onGroupSizeChange: (value: string) => void;
};

function CreateCrewStep({
  groupType,
  groupSize,
  onGroupTypeChange,
  onGroupSizeChange,
}: CrewStepProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionEyebrow}>The crew</Text>
      <Text style={styles.lead}>Who's joining?</Text>
      <Text style={styles.leadSub}>Set the crew size and how people can RSVP.</Text>
      <Text style={styles.label}>Group type</Text>
      {groupTypes.map(g => (
        <Pressable
          key={g.id}
          onPress={() => onGroupTypeChange(g.id)}
          style={[styles.groupCard, groupType === g.id && styles.groupCardOn]}>
          <Text style={styles.groupEmoji}>{g.emoji}</Text>
          <View style={styles.groupText}>
            <Text style={[styles.groupTitle, groupType === g.id && styles.groupTitleOn]}>{g.label}</Text>
            <Text style={styles.groupHint}>{g.hint}</Text>
          </View>
        </Pressable>
      ))}
      <AppInput
        label="Group size (optional)"
        placeholder="e.g. 8"
        keyboardType="number-pad"
        value={groupSize}
        onChangeText={onGroupSizeChange}
      />
    </View>
  );
}

export function CreateActivityScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const { user } = useAuth();
  const city = useAppStore(s => s.selectedCity);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [gt, setGt] = useState<GroupTypeId>('open_join');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(() => getTomorrowPreset());
  const [locationName, setLocationName] = useState('');
  const [activityCity, setActivityCity] = useState(city);
  const [groupSize, setGroupSize] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  const footerPad = Math.max(insets.bottom, spacing.md);

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

  const selectedCategory = useMemo(
    () => categories.find(c => c.id === categoryId) ?? null,
    [categories, categoryId],
  );

  const startIso = startDate.toISOString();

  const previewActivity = useMemo(
    () =>
      buildActivityPreview({
        title,
        locationName,
        city: activityCity.trim() || city,
        startDatetime: startIso,
        category: selectedCategory,
        tags,
        groupType: gt,
        groupSize,
        creator: user,
      }),
    [title, locationName, activityCity, city, startIso, selectedCategory, tags, gt, groupSize, user],
  );

  const coverLabel = useMemo(() => getCoverPhotoLabel(previewActivity), [previewActivity]);

  const scrollToPreview = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      Alert.alert('Add a title', 'Give your plan a name people will notice.');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Add a description', 'Tell people what to expect.');
      return false;
    }
    if (!categoryId) {
      Alert.alert('Pick a category');
      return false;
    }
    if (startDate.getTime() <= Date.now()) {
      Alert.alert('Pick a future time', 'Your plan needs to start in the future.');
      return false;
    }
    if (!locationName.trim()) {
      Alert.alert('Add a location', 'Where should people meet you?');
      return false;
    }
    return true;
  };

  const publish = async () => {
    if (!validateForm() || !categoryId) {
      return;
    }

    setSaving(true);
    try {
      await createActivity({
        title: title.trim(),
        description: description.trim(),
        categoryId,
        startDatetime: startDate.toISOString(),
        locationName: locationName.trim(),
        city: activityCity.trim() || city,
        groupType: gt,
        groupSize: groupSize.trim() ? parseInt(groupSize, 10) : null,
        tags: tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
        coverUrl: resolveActivityCoverUrl(previewActivity),
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
      <ScreenHeader
        title="Host a plan"
        subtitle="Share something worth showing up for"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.flex}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={8}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[
              styles.scroll,
              { paddingBottom: FOOTER_HEIGHT + footerPad + spacing.lg },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <CreateActivityPreview activity={previewActivity} />
            <CreatePlanStep
              title={title}
              description={description}
              tags={tags}
              categories={categories}
              categoryId={categoryId}
              coverLabel={coverLabel}
              onTitleChange={setTitle}
              onDescriptionChange={setDescription}
              onTagsChange={setTags}
              onCategoryChange={setCategoryId}
            />
            <CreateTimePlaceStep
              startDate={startDate}
              locationName={locationName}
              activityCity={activityCity}
              onStartDateChange={setStartDate}
              onLocationNameChange={setLocationName}
              onActivityCityChange={setActivityCity}
            />
            <CreateCrewStep
              groupType={gt}
              groupSize={groupSize}
              onGroupTypeChange={setGt}
              onGroupSizeChange={setGroupSize}
            />
          </ScrollView>
        </KeyboardAvoidingView>

        <View style={[styles.stickyFooter, { paddingBottom: footerPad }]}>
          <AppButton title="Preview" variant="ghost" onPress={scrollToPreview} style={styles.footerBtn} />
          <AppButton
            title={saving ? 'Publishing...' : 'Publish 🔥'}
            onPress={publish}
            disabled={saving}
            style={styles.footerBtnPrimary}
          />
          {saving ? <ActivityIndicator color={colors.primary} style={styles.saving} /> : null}
        </View>
      </View>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  section: {
    marginBottom: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  sectionEyebrow: {
    ...typography.caption,
    color: colors.primary,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  lead: {
    ...typography.title,
    color: colors.text,
    marginBottom: 4,
  },
  leadSub: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  label: {
    ...typography.caption,
    color: colors.muted,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    ...typography.caption,
    color: colors.text,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  chipOn: { borderColor: colors.primary, backgroundColor: 'rgba(140,255,79,0.12)' },
  coverHint: {
    ...typography.caption,
    color: colors.muted,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  groupCardOn: {
    borderColor: 'rgba(140,255,79,0.55)',
    backgroundColor: 'rgba(140,255,79,0.1)',
  },
  groupEmoji: { fontSize: 28 },
  groupText: { flex: 1 },
  groupTitle: { ...typography.subtitle, color: colors.text, marginBottom: 2 },
  groupTitleOn: { color: colors.primary },
  groupHint: { ...typography.caption, color: colors.textSecondary },
  stickyFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: 'rgba(2,6,23,0.96)',
  },
  footerBtn: { flex: 1 },
  footerBtnPrimary: { flex: 1 },
  saving: {
    position: 'absolute',
    top: -spacing.lg,
    alignSelf: 'center',
  },
});
