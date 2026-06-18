import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NotificationItem } from '../components/NotificationItem';
import { ScreenBg } from '../components/ScreenBg';
import { ScreenHeader } from '../components/ScreenHeader';
import { MOCK_NOTIFICATIONS } from '../data/mock';
import type { MainStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export function NotificationsScreen() {
  const navigation = useNavigation<Nav>();
  return (
    <ScreenBg>
      <ScreenHeader title="Notifications" onBack={() => navigation.goBack()} />
      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
          <NotificationItem item={item} onPress={() => {}} />
        )}
        contentContainerStyle={styles.list}
      />
    </ScreenBg>
  );
}

const styles = StyleSheet.create({ list: { paddingBottom: 40 } });
