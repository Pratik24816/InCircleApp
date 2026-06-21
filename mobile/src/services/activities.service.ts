import { apiClient } from './api.client';
import type { Activity, CreateActivityPayload, UpdateActivityPayload } from '../types/auth';
import { DEMO_USER_LOCATION } from '../utils/locationDisplay';

type GeoParams = {
  city?: string;
  lat?: number;
  lng?: number;
};

function withGeo(params?: GeoParams) {
  return {
    ...params,
    lat: params?.lat ?? DEMO_USER_LOCATION.latitude,
    lng: params?.lng ?? DEMO_USER_LOCATION.longitude,
  };
}

export async function fetchActivities(params: {
  city?: string;
  categoryId?: string;
  q?: string;
  excludeFeatured?: boolean;
  lat?: number;
  lng?: number;
}): Promise<Activity[]> {
  const { data } = await apiClient.get<Activity[]>('/activities', { params: withGeo(params) });
  return data;
}

export async function fetchFeaturedActivity(city?: string, lat?: number, lng?: number): Promise<Activity | null> {
  const { data } = await apiClient.get<Activity | null>('/activities/featured', {
    params: withGeo({ city, lat, lng }),
  });
  return data;
}

export async function fetchTonightActivities(city?: string, lat?: number, lng?: number): Promise<Activity[]> {
  const { data } = await apiClient.get<Activity[]>('/activities/tonight', {
    params: withGeo({ city, lat, lng }),
  });
  return data;
}

export async function fetchActivityById(id: string, lat?: number, lng?: number): Promise<Activity> {
  const { data } = await apiClient.get<Activity>(`/activities/${id}`, {
    params: withGeo({ lat, lng }),
  });
  return data;
}

export async function createActivity(payload: CreateActivityPayload): Promise<Activity> {
  const { data } = await apiClient.post<Activity>('/activities', payload);
  return data;
}

export async function updateActivity(id: string, payload: UpdateActivityPayload): Promise<Activity> {
  const { data } = await apiClient.patch<Activity>(`/activities/${id}`, payload);
  return data;
}

export async function cancelActivity(id: string): Promise<Activity> {
  const { data } = await apiClient.delete<Activity>(`/activities/${id}`);
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
