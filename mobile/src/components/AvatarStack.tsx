import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../theme/tokens';
import type { ActivityPerson } from '../utils/avatarDisplay';
import { getFaceEmoji, getFirstName } from '../utils/avatarDisplay';
import { Avatar } from './Avatar';

type Props = {
  people: ActivityPerson[];
  total: number;
  max?: number;
  size?: number;
  showNames?: boolean;
};

export function AvatarStack({
  people,
  total,
  max = 4,
  size = 30,
  showNames = false,
}: Props) {
  const shown = people.slice(0, max);
  const overflow = Math.max(0, total - shown.length);

  if (!shown.length && total === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.stackRow}>
        {shown.map((person, index) => (
          <View
            key={person.id}
            style={[
              styles.avatarSlot,
              index > 0 && { marginLeft: -size * 0.32 },
              { zIndex: shown.length - index },
            ]}>
            <Avatar name={person.fullName} uri={person.profilePhoto} size={size} />
          </View>
        ))}
        {overflow > 0 ? (
          <View
            style={[
              styles.more,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                marginLeft: shown.length ? -size * 0.32 : 0,
              },
            ]}>
            <Text style={[styles.moreText, { fontSize: size * 0.28 }]}>+{overflow}</Text>
          </View>
        ) : null}
      </View>
      {showNames ? (
        <View style={styles.namesRow}>
          {shown.map(person => (
            <Text key={person.id} style={styles.name} numberOfLines={1}>
              {person.profilePhoto?.trim() ? '' : `${getFaceEmoji(person.fullName)} `}
              {getFirstName(person.fullName)}
            </Text>
          ))}
          {overflow > 0 ? <Text style={styles.nameMuted}>+{overflow}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  stackRow: { flexDirection: 'row', alignItems: 'center' },
  avatarSlot: {
    borderWidth: 2,
    borderColor: colors.surface,
    borderRadius: 999,
  },
  more: {
    backgroundColor: 'rgba(77,181,255,0.22)',
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    ...typography.caption,
    color: colors.secondary,
    fontWeight: '700',
  },
  namesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  name: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },
  nameMuted: { ...typography.caption, color: colors.muted, fontWeight: '600' },
});
