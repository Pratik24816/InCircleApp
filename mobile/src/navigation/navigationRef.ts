import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigateFromPush(activityId?: string | null): void {
  if (!navigationRef.isReady()) {
    return;
  }

  if (activityId) {
    navigationRef.navigate('Main', {
      screen: 'ActivityDetails',
      params: { id: activityId },
    });
    return;
  }

  navigationRef.navigate('Main', { screen: 'Notifications' });
}
