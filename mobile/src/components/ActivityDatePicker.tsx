import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AppButton } from './AppButton';
import { colors, radii, spacing, typography } from '../theme/tokens';
import {
  addMinutes,
  formatDayChipLabel,
  formatFriendlyActivityDate,
  formatFriendlyActivityTime,
  getPresetDate,
  getUpcomingDays,
  isSameCalendarDay,
  matchQuickPreset,
  setCalendarDay,
  type ActivityQuickPreset,
} from '../utils/activityDatetime';

const QUICK_PRESETS: { id: ActivityQuickPreset; label: string }[] = [
  { id: 'tonight', label: 'Tonight' },
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: 'weekend', label: 'Weekend' },
];

type Props = {
  value: Date;
  onChange: (date: Date) => void;
};

export function ActivityDatePicker({ value, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const now = useMemo(() => new Date(), []);
  const dayOptions = useMemo(() => getUpcomingDays(14, now), [now]);
  const activePreset = matchQuickPreset(value, now);
  const minTime = now.getTime();

  const applyPreset = (preset: ActivityQuickPreset) => {
    onChange(getPresetDate(preset, now));
  };

  const selectDay = (day: Date) => {
    onChange(setCalendarDay(value, day));
  };

  const shiftTime = (deltaMinutes: number) => {
    const next = addMinutes(value, deltaMinutes);
    if (next.getTime() < minTime) {
      onChange(new Date(minTime + 15 * 60 * 1000));
      return;
    }
    onChange(next);
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>When</Text>
      <Pressable
        onPress={() => setExpanded(current => !current)}
        style={({ pressed }) => [styles.field, pressed && styles.fieldPressed]}>
        <Text style={styles.dateLine}>{formatFriendlyActivityDate(value, now)}</Text>
        <Text style={styles.timeLine}>{formatFriendlyActivityTime(value)}</Text>
        <Text style={styles.tapHint}>{expanded ? 'Tap to collapse' : 'Tap to change'}</Text>
      </Pressable>

      <View style={styles.chipRow}>
        {QUICK_PRESETS.map(preset => (
          <Pressable key={preset.id} onPress={() => applyPreset(preset.id)}>
            <Text style={[styles.chip, activePreset === preset.id && styles.chipOn]}>
              {preset.label}
            </Text>
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

          <Text style={styles.panelLabel}>Pick a time</Text>
          <View style={styles.timeRow}>
            <Pressable onPress={() => shiftTime(-30)} style={styles.timeBtn}>
              <Text style={styles.timeBtnText}>−</Text>
            </Pressable>
            <Text style={styles.timeValue}>{formatFriendlyActivityTime(value)}</Text>
            <Pressable onPress={() => shiftTime(30)} style={styles.timeBtn}>
              <Text style={styles.timeBtnText}>+</Text>
            </Pressable>
          </View>
          <Text style={styles.timeHint}>Adjust in 30-minute steps</Text>

          <AppButton title="Done" onPress={() => setExpanded(false)} style={styles.doneBtn} />
        </View>
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
    marginBottom: spacing.sm,
  },
  fieldPressed: { borderColor: 'rgba(140,255,79,0.45)' },
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
  tapHint: {
    ...typography.caption,
    color: colors.muted,
    marginTop: spacing.xs,
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
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.xs,
  },
  timeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  timeBtnText: {
    ...typography.title,
    color: colors.text,
    lineHeight: 28,
  },
  timeValue: {
    ...typography.title,
    color: colors.text,
    minWidth: 100,
    textAlign: 'center',
    fontWeight: '700',
  },
  timeHint: {
    ...typography.caption,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  doneBtn: { marginTop: spacing.xs },
});
