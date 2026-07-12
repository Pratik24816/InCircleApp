import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { AppButton } from './AppButton';
import { colors, radii, spacing, typography } from '../theme/tokens';
import {
  formatDayChipLabel,
  formatFriendlyActivityDate,
  formatFriendlyActivityTime,
  getPresetDate,
  getUpcomingDays,
  isSameCalendarDay,
  matchQuickPreset,
  mergeDateAndTime,
  setCalendarDay,
  type ActivityQuickPreset,
} from '../utils/activityDatetime';

const QUICK_PRESETS: { id: ActivityQuickPreset; label: string }[] = [
  { id: 'tonight', label: 'Tonight' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'weekend', label: 'Weekend' },
];

type PickerTarget = 'start-date' | 'start-time' | 'end-date' | 'end-time';

type Props = {
  value: Date;
  onChange: (date: Date) => void;
  hasEndDate?: boolean;
  onHasEndDateChange?: (enabled: boolean) => void;
  endValue?: Date | null;
  onEndChange?: (date: Date | null) => void;
  startError?: string;
  endError?: string;
};

export function ActivityDatePicker({
  value,
  onChange,
  hasEndDate = false,
  onHasEndDateChange,
  endValue,
  onEndChange,
  startError,
  endError,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const now = useMemo(() => new Date(), []);
  const dayOptions = useMemo(() => getUpcomingDays(14, now), [now]);
  const activePreset = matchQuickPreset(value, now);
  const minDate = now;

  const applyPreset = (preset: ActivityQuickPreset) => {
    onChange(getPresetDate(preset, now));
  };

  const selectDay = (day: Date) => {
    onChange(setCalendarDay(value, day));
  };

  const openPicker = (target: PickerTarget) => {
    setPickerTarget(target);
  };

  const closePicker = () => setPickerTarget(null);

  const handlePickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') {
      closePicker();
    }
    if (event.type === 'dismissed' || !selected) {
      return;
    }

    if (pickerTarget === 'start-date') {
      onChange(mergeDateAndTime(selected, value));
      return;
    }
    if (pickerTarget === 'start-time') {
      onChange(mergeDateAndTime(value, selected));
      return;
    }
    if (pickerTarget === 'end-date' && onEndChange) {
      const base = endValue ?? new Date(value.getTime() + 2 * 60 * 60 * 1000);
      onEndChange(mergeDateAndTime(selected, base));
      return;
    }
    if (pickerTarget === 'end-time' && onEndChange && endValue) {
      onEndChange(mergeDateAndTime(endValue, selected));
    }
  };

  const pickerValue = (() => {
    if (pickerTarget === 'end-date' || pickerTarget === 'end-time') {
      return endValue ?? new Date(value.getTime() + 2 * 60 * 60 * 1000);
    }
    return value;
  })();

  const toggleEndDate = () => {
    const next = !hasEndDate;
    onHasEndDateChange?.(next);
    if (next && onEndChange) {
      onEndChange(new Date(value.getTime() + 2 * 60 * 60 * 1000));
    }
    if (!next) {
      onEndChange?.(null);
    }
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>When</Text>
      <Pressable
        onPress={() => setExpanded(current => !current)}
        style={({ pressed }) => [
          styles.field,
          pressed && styles.fieldPressed,
          startError && styles.fieldError,
        ]}>
        <Text style={styles.dateLine}>{formatFriendlyActivityDate(value, now)}</Text>
        <Text style={styles.timeLine}>{formatFriendlyActivityTime(value)}</Text>
        {hasEndDate && endValue ? (
          <Text style={styles.endLine}>Until {formatFriendlyActivityTime(endValue)}</Text>
        ) : null}
        <Text style={styles.tapHint}>{expanded ? 'Tap to collapse' : 'Tap to change'}</Text>
      </Pressable>
      {startError ? <Text style={styles.error}>{startError}</Text> : null}

      <View style={styles.chipRow}>
        {QUICK_PRESETS.map(preset => (
          <Pressable key={preset.id} onPress={() => applyPreset(preset.id)}>
            <Text style={[styles.chip, activePreset === preset.id && styles.chipOn]}>{preset.label}</Text>
          </Pressable>
        ))}
      </View>

      {expanded ? (
        <View style={styles.panel}>
          <Text style={styles.panelLabel}>Pick a date</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayScroll}>
            {dayOptions.map(day => {
              const selected = isSameCalendarDay(value, day);
              return (
                <Pressable key={day.toISOString()} onPress={() => selectDay(day)}>
                  <View style={[styles.dayChip, selected && styles.dayChipOn]}>
                    <Text style={[styles.dayChipText, selected && styles.dayChipTextOn]}>
                      {formatDayChipLabel(day, now)}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.panelLabel}>Start time</Text>
          <View style={styles.pickerRow}>
            <Pressable onPress={() => openPicker('start-date')} style={styles.pickerBtn}>
              <Text style={styles.pickerBtnLabel}>Date</Text>
              <Text style={styles.pickerBtnValue}>
                {value.toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </Text>
            </Pressable>
            <Pressable onPress={() => openPicker('start-time')} style={styles.pickerBtn}>
              <Text style={styles.pickerBtnLabel}>Time</Text>
              <Text style={styles.pickerBtnValue}>{formatFriendlyActivityTime(value)}</Text>
            </Pressable>
          </View>

          <Pressable onPress={toggleEndDate} style={styles.endToggle}>
            <View style={[styles.checkbox, hasEndDate && styles.checkboxOn]}>
              {hasEndDate ? <Text style={styles.checkmark}>✓</Text> : null}
            </View>
            <Text style={styles.endToggleText}>Add end time (optional)</Text>
          </Pressable>

          {hasEndDate ? (
            <View style={styles.pickerRow}>
              <Pressable onPress={() => openPicker('end-date')} style={styles.pickerBtn}>
                <Text style={styles.pickerBtnLabel}>End date</Text>
                <Text style={styles.pickerBtnValue}>
                  {(endValue ?? value).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </Text>
              </Pressable>
              <Pressable onPress={() => openPicker('end-time')} style={styles.pickerBtn}>
                <Text style={styles.pickerBtnLabel}>End time</Text>
                <Text style={styles.pickerBtnValue}>
                  {formatFriendlyActivityTime(endValue ?? value)}
                </Text>
              </Pressable>
            </View>
          ) : null}
          {endError ? <Text style={styles.error}>{endError}</Text> : null}

          <AppButton title="Done" onPress={() => setExpanded(false)} style={styles.doneBtn} />
        </View>
      ) : null}

      {pickerTarget ? (
        <DateTimePicker
          value={pickerValue}
          mode={pickerTarget.includes('time') ? 'time' : 'date'}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={pickerTarget.includes('start') ? minDate : value}
          onChange={handlePickerChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  field: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.xs,
  },
  fieldPressed: { borderColor: 'rgba(140,255,79,0.45)' },
  fieldError: { borderColor: colors.danger },
  dateLine: {
    ...typography.title,
    color: colors.text,
    marginBottom: 2,
  },
  timeLine: {
    ...typography.subtitle,
    color: colors.primary,
    fontWeight: '700',
  },
  endLine: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  tapHint: {
    ...typography.caption,
    color: colors.muted,
    marginTop: spacing.xs,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    ...typography.caption,
    color: colors.text,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    fontWeight: '600',
  },
  chipOn: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(140,255,79,0.12)',
    color: colors.primary,
  },
  panel: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  panelLabel: {
    ...typography.caption,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: spacing.sm,
  },
  dayScroll: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  dayChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginRight: spacing.sm,
  },
  dayChipOn: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(140,255,79,0.12)',
  },
  dayChipText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  dayChipTextOn: {
    color: colors.primary,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  pickerBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  pickerBtnLabel: {
    ...typography.caption,
    color: colors.muted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  pickerBtnValue: {
    ...typography.subtitle,
    color: colors.text,
    fontWeight: '700',
  },
  endToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(140,255,79,0.15)',
  },
  checkmark: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  endToggleText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  doneBtn: { marginTop: spacing.xs },
});
