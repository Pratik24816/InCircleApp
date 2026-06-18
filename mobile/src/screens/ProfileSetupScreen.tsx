import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { ScreenBg } from '../components/ScreenBg';
import { ScreenHeader } from '../components/ScreenHeader';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../services/auth.service';
import { useAppStore } from '../store/useAppStore';
import { colors, spacing, typography } from '../theme/tokens';
import type { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProfileSetupScreen() {
  const navigation = useNavigation<Nav>();
  const { user, saveProfile } = useAuth();
  const setSelectedCity = useAppStore(s => s.setSelectedCity);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('Ahmedabad');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setUsername(user.username || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const next = async () => {
    if (!fullName.trim()) {
      Alert.alert('Full name required');
      return;
    }
    if (!username.trim()) {
      Alert.alert('Username required', 'Choose a username (3–20 characters, letters, numbers, underscore).');
      return;
    }

    setSaving(true);
    try {
      await saveProfile({
        fullName: fullName.trim(),
        username: username.trim(),
        bio: bio.trim() || undefined,
      });
      setSelectedCity(city.trim() || 'Ahmedabad');
      navigation.replace('InterestSelection');
    } catch (error) {
      Alert.alert('Could not save profile', getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenBg>
      <ScreenHeader title="Your profile" subtitle="Step 1 of 2" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <View style={styles.avatar}>
          {user?.profilePhoto ? (
            <Image source={{ uri: user.profilePhoto }} style={styles.avatarImg} />
          ) : (
            <Text style={styles.avatarTxt}>+</Text>
          )}
          <Text style={styles.avatarHint}>
            {user?.profilePhoto ? 'From Google — custom upload coming soon' : 'Photo from Google after sign-in'}
          </Text>
        </View>
        <AppInput label="Full name" placeholder="Aarav Mehta" value={fullName} onChangeText={setFullName} />
        <AppInput label="Username" placeholder="username" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <AppInput label="Bio" placeholder="Short intro" multiline value={bio} onChangeText={setBio} />
        <AppInput label="City" placeholder="Ahmedabad" value={city} onChangeText={setCity} />
        <AppButton title={saving ? 'Saving...' : 'Continue'} onPress={next} disabled={saving} />
        {saving ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} /> : null}
      </ScrollView>
    </ScreenBg>
  );
}

const styles = StyleSheet.create({
  avatar: {
    height: 100,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarTxt: { fontSize: 32, color: colors.primary },
  avatarHint: { ...typography.caption, color: colors.muted, marginTop: 4, textAlign: 'center', paddingHorizontal: spacing.sm },
});
