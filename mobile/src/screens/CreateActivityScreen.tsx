import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CommonActions, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ActivityCoverPicker } from '../components/ActivityCoverPicker';
import { ActivityDatePicker } from '../components/ActivityDatePicker';
import { ActivityLocationPicker, type LocationSelection } from '../components/ActivityLocationPicker';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { CreateActivityPreview } from '../components/CreateActivityPreview';
import { CreatePublishSuccess } from '../components/CreatePublishSuccess';
import { ScreenBg } from '../components/ScreenBg';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { createActivity } from '../services/activities.service';
import { fetchCategories } from '../services/catalog.service';
import { getApiErrorMessage } from '../services/auth.service';
import { uploadActivityCover } from '../services/uploads.service';
import { useAppStore } from '../store/useAppStore';
import type { Category } from '../types/auth';
import { colors, radii, spacing, typography } from '../theme/tokens';
import type { CreateStackList } from '../navigation/types';
import { buildActivityPreview } from '../utils/buildActivityPreview';
import { getTomorrowPreset } from '../utils/activityDatetime';
import { getCoverPhotoLabel, resolveActivityCoverUrl } from '../utils/activityCovers';
import {
  CREATE_FORM_LIMITS,
  firstCreateFormErrorKey,
  validateCreateActivityForm,
  type CreateFormErrors,
} from '../utils/createActivityValidation';

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
type FieldKey = keyof CreateFormErrors | 'preview';

type PlanStepProps = {
  title: string;
  description: string;
  tags: string;
  categories: Category[];
  categoryId: string | null;
  coverUrl: string | null;
  coverLabel: string;
  coverLocalUri: string | null;
  errors: CreateFormErrors;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onCategoryChange: (id: string) => void;
  onCoverLocalUriChange: (uri: string | null) => void;
  onLayout: (key: FieldKey) => (event: LayoutChangeEvent) => void;
};

function CreatePlanStep({
  title,
  description,
  tags,
  categories,
  categoryId,
  coverUrl,
  coverLabel,
  coverLocalUri,
  errors,
  onTitleChange,
  onDescriptionChange,
  onTagsChange,
  onCategoryChange,
  onCoverLocalUriChange,
  onLayout,
}: PlanStepProps) {
  return (
    <View style={styles.section} onLayout={onLayout('title')}>
      <Text style={styles.sectionEyebrow}>The plan</Text>
      <Text style={styles.lead}>What's the vibe?</Text>
      <Text style={styles.leadSub}>Name it, describe it, pick a category.</Text>
      <AppInput
        label={`Title (${CREATE_FORM_LIMITS.titleMin}–${CREATE_FORM_LIMITS.titleMax})`}
        placeholder="Morning Riverfront Walk"
        value={title}
        onChangeText={onTitleChange}
        error={errors.title}
        maxLength={CREATE_FORM_LIMITS.titleMax}
      />
      <View onLayout={onLayout('description')}>
        <AppInput
          label={`Description (max ${CREATE_FORM_LIMITS.descriptionMax})`}
          placeholder="Easy 5 km walk. All paces welcome."
          multiline
          value={description}
          onChangeText={onDescriptionChange}
          error={errors.description}
          maxLength={CREATE_FORM_LIMITS.descriptionMax}
        />
      </View>
      <View onLayout={onLayout('categoryId')}>
        <Text style={styles.label}>Category</Text>
        {errors.categoryId ? <Text style={styles.fieldError}>{errors.categoryId}</Text> : null}
        <View style={styles.chipRow}>
          {categories.map(c => (
            <Pressable key={c.id} onPress={() => onCategoryChange(c.id)}>
              <Text style={[styles.chip, categoryId === c.id && styles.chipOn]}>
                {c.icon} {c.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <AppInput label="Vibe tags" placeholder="chill, cricket, walk" value={tags} onChangeText={onTagsChange} />
      <ActivityCoverPicker
        coverUrl={coverUrl}
        autoLabel={coverLabel}
        localUri={coverLocalUri}
        onLocalUriChange={onCoverLocalUriChange}
      />
    </View>
  );
}

type TimePlaceStepProps = {
  startDate: Date;
  endDate: Date | null;
  hasEndDate: boolean;
  locationName: string;
  activityCity: string;
  latitude?: number;
  longitude?: number;
  errors: CreateFormErrors;
  biasCity: string;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date | null) => void;
  onHasEndDateChange: (enabled: boolean) => void;
  onLocationChange: (value: LocationSelection) => void;
  onLayout: (key: FieldKey) => (event: LayoutChangeEvent) => void;
};

function CreateTimePlaceStep({
  startDate,
  endDate,
  hasEndDate,
  locationName,
  activityCity,
  latitude,
  longitude,
  errors,
  biasCity,
  onStartDateChange,
  onEndDateChange,
  onHasEndDateChange,
  onLocationChange,
  onLayout,
}: TimePlaceStepProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionEyebrow}>Time & place</Text>
      <Text style={styles.lead}>When & where?</Text>
      <Text style={styles.leadSub}>Help people find you IRL.</Text>
      <View onLayout={onLayout('startDate')}>
        <ActivityDatePicker
          value={startDate}
          onChange={onStartDateChange}
          hasEndDate={hasEndDate}
          onHasEndDateChange={onHasEndDateChange}
          endValue={endDate}
          onEndChange={onEndDateChange}
          startError={errors.startDate}
          endError={errors.endDate}
        />
      </View>
      <View onLayout={onLayout('locationName')}>
        <ActivityLocationPicker
          locationName={locationName}
          city={activityCity}
          latitude={latitude}
          longitude={longitude}
          biasCity={biasCity}
          onChange={onLocationChange}
          locationError={errors.locationName}
          cityError={errors.activityCity}
        />
      </View>
    </View>
  );
}

type CrewStepProps = {
  groupType: GroupTypeId;
  groupSize: string;
  groupSizeError?: string;
  onGroupTypeChange: (id: GroupTypeId) => void;
  onGroupSizeChange: (value: string) => void;
  onLayout: (key: FieldKey) => (event: LayoutChangeEvent) => void;
};

function CreateCrewStep({
  groupType,
  groupSize,
  groupSizeError,
  onGroupTypeChange,
  onGroupSizeChange,
  onLayout,
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
      <View onLayout={onLayout('groupSize')}>
        <AppInput
          label="Group size (optional)"
          placeholder="e.g. 8"
          keyboardType="number-pad"
          value={groupSize}
          onChangeText={onGroupSizeChange}
          error={groupSizeError}
        />
      </View>
    </View>
  );
}

export function CreateActivityScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const fieldOffsets = useRef<Partial<Record<FieldKey, number>>>({});
  const { user } = useAuth();
  const city = useAppStore(s => s.selectedCity);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [gt, setGt] = useState<GroupTypeId>('open_join');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(() => getTomorrowPreset());
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [activityCity, setActivityCity] = useState(city);
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [groupSize, setGroupSize] = useState('');
  const [tags, setTags] = useState('');
  const [coverLocalUri, setCoverLocalUri] = useState<string | null>(null);
  const [errors, setErrors] = useState<CreateFormErrors>({});
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [publishedTitle, setPublishedTitle] = useState('');

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
        coverUrl: coverLocalUri,
        latitude,
        longitude,
        creator: user,
      }),
    [
      title,
      locationName,
      activityCity,
      city,
      startIso,
      selectedCategory,
      tags,
      gt,
      groupSize,
      coverLocalUri,
      latitude,
      longitude,
      user,
    ],
  );

  const coverLabel = useMemo(() => getCoverPhotoLabel(previewActivity), [previewActivity]);
  const resolvedCoverUrl = useMemo(() => resolveActivityCoverUrl(previewActivity), [previewActivity]);

  const onFieldLayout = (key: FieldKey) => (event: LayoutChangeEvent) => {
    fieldOffsets.current[key] = event.nativeEvent.layout.y;
  };

  const scrollToField = (key: FieldKey) => {
    if (key === 'preview') {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    const y = fieldOffsets.current[key];
    if (y != null) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
    }
  };

  const runValidation = (): CreateFormErrors => {
    const next = validateCreateActivityForm({
      title,
      description,
      categoryId,
      startDate,
      endDate,
      hasEndDate,
      locationName,
      activityCity,
      groupType: gt,
      groupSize,
    });
    setErrors(next);
    return next;
  };

  useEffect(() => {
    if (!touched) {
      return;
    }
    runValidation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, categoryId, startDate, endDate, hasEndDate, locationName, activityCity, groupSize, gt, touched]);

  const scrollToPreview = () => scrollToField('preview');

  const handleLocationChange = (value: LocationSelection) => {
    setLocationName(value.locationName);
    setActivityCity(value.city);
    setLatitude(value.latitude);
    setLongitude(value.longitude);
    setTouched(true);
  };

  const publish = async () => {
    setTouched(true);
    const validation = runValidation();
    const firstKey = firstCreateFormErrorKey(validation);
    if (firstKey) {
      scrollToField(firstKey === 'activityCity' ? 'locationName' : firstKey);
      Alert.alert('Almost there', 'Fix the highlighted fields to publish your plan.');
      return;
    }
    if (!categoryId) {
      return;
    }

    setSaving(true);
    try {
      let coverUrl = resolvedCoverUrl;
      if (coverLocalUri) {
        coverUrl = await uploadActivityCover(coverLocalUri);
      }

      await createActivity({
        title: title.trim(),
        description: description.trim(),
        categoryId,
        startDatetime: startDate.toISOString(),
        endDatetime: hasEndDate && endDate ? endDate.toISOString() : null,
        locationName: locationName.trim(),
        city: activityCity.trim() || city,
        latitude,
        longitude,
        groupType: gt,
        groupSize: groupSize.trim() ? parseInt(groupSize, 10) : null,
        tags: tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
        coverUrl,
      });
      setPublishedTitle(title.trim());
      setShowSuccess(true);
    } catch (error) {
      Alert.alert('Could not create activity', getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTags('');
    setLocationName('');
    setActivityCity(city);
    setLatitude(undefined);
    setLongitude(undefined);
    setGroupSize('');
    setCoverLocalUri(null);
    setEndDate(null);
    setHasEndDate(false);
    setStartDate(getTomorrowPreset());
    setErrors({});
    setTouched(false);
    if (categories[0]) {
      setCategoryId(categories[0].id);
    }
  };

  const goToCreatedPlans = () => {
    setShowSuccess(false);
    resetForm();
    navigation.getParent()?.navigate('MyEventsTab', {
      screen: 'MyEvents',
      params: { initialTab: 'created' },
    });
  };

  const finishAfterSuccess = () => {
    setShowSuccess(false);
    resetForm();
    navigation.dispatch(CommonActions.goBack());
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
            <View onLayout={onFieldLayout('preview')}>
              <CreateActivityPreview activity={previewActivity} />
            </View>
            <CreatePlanStep
              title={title}
              description={description}
              tags={tags}
              categories={categories}
              categoryId={categoryId}
              coverUrl={resolvedCoverUrl}
              coverLabel={coverLabel}
              coverLocalUri={coverLocalUri}
              errors={errors}
              onTitleChange={v => {
                setTitle(v);
                setTouched(true);
              }}
              onDescriptionChange={v => {
                setDescription(v);
                setTouched(true);
              }}
              onTagsChange={setTags}
              onCategoryChange={id => {
                setCategoryId(id);
                setTouched(true);
              }}
              onCoverLocalUriChange={setCoverLocalUri}
              onLayout={onFieldLayout}
            />
            <CreateTimePlaceStep
              startDate={startDate}
              endDate={endDate}
              hasEndDate={hasEndDate}
              locationName={locationName}
              activityCity={activityCity}
              latitude={latitude}
              longitude={longitude}
              errors={errors}
              biasCity={city}
              onStartDateChange={d => {
                setStartDate(d);
                setTouched(true);
              }}
              onEndDateChange={d => {
                setEndDate(d);
                setTouched(true);
              }}
              onHasEndDateChange={setHasEndDate}
              onLocationChange={handleLocationChange}
              onLayout={onFieldLayout}
            />
            <CreateCrewStep
              groupType={gt}
              groupSize={groupSize}
              groupSizeError={errors.groupSize}
              onGroupTypeChange={setGt}
              onGroupSizeChange={v => {
                setGroupSize(v);
                setTouched(true);
              }}
              onLayout={onFieldLayout}
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

      <CreatePublishSuccess
        visible={showSuccess}
        planTitle={publishedTitle}
        onViewPlans={goToCreatedPlans}
        onDone={finishAfterSuccess}
      />
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
  fieldError: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
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
