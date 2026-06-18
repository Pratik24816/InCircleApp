import React from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../components/AppButton';
import { ScreenBg } from '../components/ScreenBg';
import { colors, radii, spacing, typography } from '../theme/tokens';
import { useAppStore } from '../store/useAppStore';
import type { RootStackParamList } from '../navigation/types';

const TOTAL_STEPS = 3;
const heroImage = require('../../img/splashbg.png');

const POPULAR_PLANS = [
  { id: '1', icon: '🌅', label: 'Morning Walk' },
  { id: '2', icon: '🏏', label: 'Cricket Match' },
  { id: '3', icon: '🏙️', label: 'City Sightseeing' },
  { id: '4', icon: '🏓', label: 'Pickleball Game' },
] as const;

type GroupId = 'just' | 'small' | 'medium' | 'large';

const GROUP_OPTIONS: { id: GroupId; icon: string; label: string }[] = [
  { id: 'just', icon: '👤', label: 'Just me' },
  { id: 'small', icon: '👥', label: 'Small group' },
  { id: 'medium', icon: '👥', label: 'Medium group' },
  { id: 'large', icon: '👨‍👩‍👧‍👦', label: 'Large group' },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const setOnboardingComplete = useAppStore(s => s.setOnboardingComplete);
  const [index, setIndex] = React.useState(0);
  const [groupSize, setGroupSize] = React.useState<GroupId>('medium');

  const finish = React.useCallback(() => {
    setOnboardingComplete(true);
    navigation.replace('Login');
  }, [navigation, setOnboardingComplete]);

  const next = () => {
    if (index < TOTAL_STEPS - 1) {
      setIndex(i => i + 1);
    } else {
      finish();
    }
  };

  const skip = () => {
    finish();
  };

  const stepNum = index + 1;
  const footerTitle = index === TOTAL_STEPS - 1 ? 'Get started' : 'Next';

  return (
    <ScreenBg>
      <ImageBackground
        source={heroImage}
        style={styles.bgDim}
        imageStyle={styles.bgDimImage}
        resizeMode="cover">
        <LinearGradient
          colors={['rgba(2,6,23,0.94)', 'rgba(2,6,23,0.88)', 'rgba(2,6,23,0.97)']}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          <View style={styles.top}>
            <View />
            <Pressable onPress={skip} hitSlop={12}>
              <Text style={styles.skip}>Skip</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled">
            <Animated.View key={index} entering={FadeInRight.duration(380)} style={styles.body}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>{String(stepNum)}</Text>
              </View>

              {index === 0 ? (
                <StepCreatePlan />
              ) : index === 1 ? (
                <StepGroupSize selected={groupSize} onSelect={setGroupSize} />
              ) : (
                <StepJoinWithIn onJoin={finish} />
              )}
            </Animated.View>
          </ScrollView>

          <View style={styles.bottomChrome}>
            <View style={styles.dots}>
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <View key={i} style={[styles.dot, i === index && styles.dotOn]} />
              ))}
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { flex: index + 1 }]} />
              <View style={{ flex: TOTAL_STEPS - index - 1 }} />
            </View>
            <View style={styles.footer}>
              <AppButton title={footerTitle} onPress={next} />
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </ScreenBg>
  );
}

function StepCreatePlan() {
  return (
    <>
      <Text style={styles.title}>Create a plan</Text>
      <Text style={styles.desc}>
        Start a plan for anything – morning walks, cricket, sightseeing and more.
      </Text>

      <View style={styles.heroRing}>
        <Image source={heroImage} style={styles.heroInner} resizeMode="cover" />
      </View>

      <Text style={styles.sectionLabel}>Popular plans</Text>
      {POPULAR_PLANS.map(row => (
        <Pressable key={row.id} style={({ pressed }) => [styles.glassRow, pressed && styles.glassRowPressed]}>
          <Text style={styles.glassIcon}>{row.icon}</Text>
          <Text style={styles.glassLabel}>{row.label}</Text>
        </Pressable>
      ))}
    </>
  );
}

function StepGroupSize({
  selected,
  onSelect,
}: {
  selected: GroupId;
  onSelect: (id: GroupId) => void;
}) {
  return (
    <>
      <Text style={styles.title}>Choose group size</Text>
      <Text style={styles.desc}>Pick how many people you want to plan with.</Text>

      <View style={styles.heroRingSmall}>
        <Text style={styles.heroEmoji}>👥</Text>
      </View>

      {GROUP_OPTIONS.map(opt => {
        const isOn = opt.id === selected;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onSelect(opt.id)}
            style={({ pressed }) => [
              styles.glassRow,
              isOn && styles.glassRowSelected,
              pressed && styles.glassRowPressed,
            ]}>
            <Text style={styles.glassIcon}>{opt.icon}</Text>
            <Text style={styles.glassLabel}>{opt.label}</Text>
            {isOn ? <Text style={styles.check}>✓</Text> : <View style={styles.checkSpacer} />}
          </Pressable>
        );
      })}
    </>
  );
}

function StepJoinWithIn({ onJoin }: { onJoin: () => void }) {
  return (
    <>
      <Text style={styles.title}>People join with In</Text>
      <Text style={styles.desc}>Share your plan. People discover and join with.</Text>

      <View style={styles.phoneMock}>
        <LinearGradient
          colors={['rgba(15,23,42,0.95)', 'rgba(30,41,59,0.9)']}
          style={styles.phoneInner}>
          <View style={styles.phoneNotch} />
          <View style={styles.phoneAvatars}>
            {['🧑', '👩', '🧔', '👨'].map((e, i) => (
              <View key={i} style={styles.phoneAvBubble}>
                <Text style={styles.phoneAvEmoji}>{e}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.phoneHint}>❤️  ·  👥</Text>
        </LinearGradient>
      </View>

      <Pressable onPress={onJoin} style={({ pressed }) => [styles.joinPillWrap, pressed && styles.joinPillPressed]}>
        <LinearGradient
          colors={[colors.primary, '#6AE63A']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.joinPill}>
          <Text style={styles.joinPillText}>Join with In</Text>
        </LinearGradient>
      </Pressable>

      <View style={styles.summaryCard}>
        <View style={styles.summaryTop}>
          <Text style={styles.summaryIcon}>🌿</Text>
          <View style={styles.summaryTextCol}>
            <Text style={styles.summaryTitle}>Sunday Morning Walk</Text>
            <Text style={styles.summaryMeta}>Today, 6:30 AM · Sabarmati Riverfront</Text>
          </View>
        </View>
        <View style={styles.summaryJoinRow}>
          <View style={styles.avatarStack}>
            {['P', 'D', 'A', 'R'].map((ch, i) => (
              <View key={i} style={[styles.miniAv, i > 0 && styles.miniAvOverlap]}>
                <Text style={styles.miniAvText}>{ch}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.joinedPlus}>+12 joined</Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bgDim: {
    flex: 1,
  },
  bgDimImage: {
    opacity: 0.22,
  },
  safe: {
    flex: 1,
  },
  top: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skip: { ...typography.subtitle, color: colors.secondary },
  scroll: {
    paddingBottom: spacing.md,
    flexGrow: 1,
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  stepBadge: {
    alignSelf: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    backgroundColor: 'rgba(2,6,23,0.5)',
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  stepBadgeText: {
    ...typography.subtitle,
    color: colors.primary,
    fontWeight: '800',
  },
  title: {
    ...typography.display,
    fontSize: 26,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  desc: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  heroRing: {
    alignSelf: 'center',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: colors.primary,
    padding: 4,
    marginBottom: spacing.lg,
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
    overflow: 'hidden',
  },
  heroInner: {
    width: '100%',
    height: '100%',
    borderRadius: 94,
  },
  heroRingSmall: {
    alignSelf: 'center',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(15,23,42,0.6)',
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  heroEmoji: {
    fontSize: 52,
  },
  sectionLabel: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  glassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  glassRowSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(140,255,79,0.08)',
  },
  glassRowPressed: {
    opacity: 0.9,
  },
  glassIcon: {
    fontSize: 22,
    marginRight: spacing.md,
    width: 32,
    textAlign: 'center',
  },
  glassLabel: {
    flex: 1,
    ...typography.subtitle,
    color: colors.text,
    fontWeight: '600',
  },
  check: {
    ...typography.title,
    color: colors.primary,
    fontWeight: '800',
    marginLeft: spacing.sm,
  },
  checkSpacer: {
    width: 24,
  },
  phoneMock: {
    alignSelf: 'center',
    width: 160,
    height: 200,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(140,255,79,0.35)',
    overflow: 'hidden',
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(2,6,23,0.6)',
  },
  phoneInner: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneNotch: {
    position: 'absolute',
    top: 8,
    width: 48,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  phoneAvatars: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingTop: spacing.lg,
  },
  phoneAvBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  phoneAvEmoji: {
    fontSize: 20,
  },
  phoneHint: {
    marginTop: spacing.sm,
    color: colors.muted,
    fontSize: 14,
  },
  joinPillWrap: {
    alignSelf: 'center',
    borderRadius: radii.pill,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    minWidth: 220,
  },
  joinPillPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  joinPill: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  joinPillText: {
    ...typography.subtitle,
    color: '#052e16',
    fontWeight: '800',
  },
  summaryCard: {
    borderRadius: radii.lg,
    padding: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  summaryTextCol: {
    flex: 1,
  },
  summaryIcon: {
    fontSize: 22,
    marginTop: 2,
  },
  summaryTitle: {
    ...typography.subtitle,
    color: colors.text,
    fontWeight: '700',
  },
  summaryMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  summaryJoinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  miniAv: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(77,181,255,0.35)',
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvOverlap: {
    marginLeft: -10,
  },
  miniAvText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  joinedPlus: {
    marginLeft: spacing.md,
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  bottomChrome: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotOn: {
    backgroundColor: colors.primary,
    width: 22,
  },
  progressTrack: {
    flexDirection: 'row',
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginBottom: spacing.md,
  },
  progressFill: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  footer: {
    paddingBottom: spacing.sm,
  },
});
