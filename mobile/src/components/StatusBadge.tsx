import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ActivityStatus } from '../types/models';
import { colors, radii, typography } from '../theme/tokens';

const LABEL: Record<ActivityStatus, string> = {
  open: 'Open',
  almost_full: 'Almost full',
  full: 'Full',
  done: 'Done',
  cancelled: 'Cancelled',
  closed: 'Closed',
};

export function StatusBadge({ status }: { status: ActivityStatus | string }) {
  const key = (status in LABEL ? status : 'open') as ActivityStatus;
  const tone =
    key === 'full' || key === 'cancelled'
      ? styles.bad
      : key === 'almost_full'
        ? styles.warn
        : key === 'done' || key === 'closed'
          ? styles.neutral
          : styles.good;
  const txt =
    key === 'full' || key === 'cancelled'
      ? styles.txtBad
      : key === 'almost_full'
        ? styles.txtWarn
        : key === 'done' || key === 'closed'
          ? styles.txtMuted
          : styles.txtGood;
  return (
    <View style={[styles.wrap, tone]}>
      <Text style={[styles.txt, txt]}>{LABEL[key]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  txt: { ...typography.caption, fontWeight: '700' },
  txtGood: { color: colors.primary },
  txtWarn: { color: colors.warning },
  txtBad: { color: colors.danger },
  txtMuted: { color: colors.muted },
  good: {
    borderColor: 'rgba(140,255,79,0.45)',
    backgroundColor: 'rgba(140,255,79,0.12)',
  },
  warn: {
    borderColor: 'rgba(255,176,32,0.45)',
    backgroundColor: 'rgba(255,176,32,0.12)',
  },
  bad: {
    borderColor: 'rgba(255,90,95,0.45)',
    backgroundColor: 'rgba(255,90,95,0.1)',
  },
  neutral: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});
