import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { Activity } from '../types/auth';
import { colors, radii, spacing, typography } from '../theme/tokens';
import {
  DEMO_USER_LOCATION,
  formatDistance,
  getNearbyAreas,
  type NearbyArea,
} from '../utils/locationDisplay';

type Props = {
  activities: Activity[];
  selected?: string | null;
  onSelect: (area: NearbyArea | null) => void;
};

function AreaChip({
  area,
  selected,
  onPress,
}: {
  area: NearbyArea;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipOn]}>
      <Text style={[styles.label, selected && styles.labelOn]} numberOfLines={1}>
        📍 {area.name} • {formatDistance(area.distanceKm)}
      </Text>
    </Pressable>
  );
}

export function NearbyAreasSection({ activities, selected, onSelect }: Props) {
  const areas = getNearbyAreas(activities, DEMO_USER_LOCATION.latitude, DEMO_USER_LOCATION.longitude);

  if (!areas.length) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Nearby</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}>
        <Pressable
          onPress={() => onSelect(null)}
          style={[styles.chip, selected == null && styles.chipOn]}>
          <Text style={[styles.label, selected == null && styles.labelOn]}>All areas</Text>
        </Pressable>
        {areas.map(area => (
          <AreaChip
            key={area.name}
            area={area}
            selected={selected === area.name}
            onPress={() => onSelect(selected === area.name ? null : area)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  heading: {
    ...typography.caption,
    color: colors.muted,
    letterSpacing: 1.4,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  row: { paddingRight: spacing.lg },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
  },
  chipOn: {
    borderColor: 'rgba(77,181,255,0.55)',
    backgroundColor: 'rgba(77,181,255,0.14)',
  },
  label: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  labelOn: { color: colors.secondary, fontWeight: '700' },
});
