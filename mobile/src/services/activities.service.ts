import { apiClient } from './api.client';
import type { Activity, CreateActivityPayload } from '../types/auth';

export async function fetchActivities(params: {
  city?: string;
  categoryId?: string;
  q?: string;
  excludeFeatured?: boolean;
}): Promise<Activity[]> {
  const { data } = await apiClient.get<Activity[]>('/activities', { params });
  return data;
}

export async function fetchFeaturedActivity(city?: string): Promise<Activity | null> {
  const { data } = await apiClient.get<Activity | null>('/activities/featured', {
    params: { city },
  });
  return data;
}

export async function fetchActivityById(id: string): Promise<Activity> {
  const { data } = await apiClient.get<Activity>(`/activities/${id}`);
  return data;
}

export async function createActivity(payload: CreateActivityPayload): Promise<Activity> {
  const { data } = await apiClient.post<Activity>('/activities', payload);
  return data;
}

export async function joinActivity(id: string, status: 'joined' | 'maybe' = 'joined'): Promise<Activity> {
  const path = status === 'maybe' ? `/activities/${id}/maybe` : `/activities/${id}/join`;
  const { data } = await apiClient.post<Activity>(path, status === 'joined' ? { status } : {});
  return data;
}

export async function fetchMyActivities(
  role: 'joined' | 'created' | 'completed',
): Promise<Activity[]> {
  const { data } = await apiClient.get<Activity[]>('/users/me/activities', { params: { role } });
  return data;
}
