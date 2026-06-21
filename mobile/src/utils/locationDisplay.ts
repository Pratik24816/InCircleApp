import type { Activity } from '../types/auth';

/** Demo map center — Sabarmati Riverfront (used until device GPS is wired up) */
export const DEMO_USER_LOCATION = {
  latitude: 23.0375,
  longitude: 72.5853,
  label: 'Riverfront',
} as const;

const NEIGHBORHOOD_RULES: [RegExp, string][] = [
  [/riverfront|sabarmati/i, 'Riverfront'],
  [/cg road/i, 'CG Road'],
  [/satellite/i, 'Satellite'],
  [/navrangpura/i, 'Navrangpura'],
  [/prahlad/i, 'Prahlad Nagar'],
  [/science city/i, 'Science City'],
  [/sg highway/i, 'SG Highway'],
  [/law garden|gvg ground/i, 'Law Garden'],
  [/library|city central/i, 'Navrangpura'],
  [/mani.*tea|blue tokai/i, 'CG Road'],
  [/mocha art/i, 'Navrangpura'],
  [/arena turf/i, 'Satellite'],
  [/dice & dine/i, 'SG Highway'],
  [/iim road/i, 'IIM Road'],
  [/bhadra|old city/i, 'Old City'],
];

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getNeighborhoodName(locationName: string): string {
  const trimmed = locationName.trim();
  for (const [pattern, name] of NEIGHBORHOOD_RULES) {
    if (pattern.test(trimmed)) {
      return name;
    }
  }

  const commaParts = trimmed.split(',').map(part => part.trim()).filter(Boolean);
  if (commaParts.length > 1) {
    return commaParts[commaParts.length - 1];
  }

  const words = trimmed.split(/\s+/);
  if (words.length <= 2) {
    return trimmed;
  }

  return words.slice(0, 2).join(' ');
}

export function formatDistance(km: number): string {
  if (km < 10) {
    const rounded = Math.round(km * 10) / 10;
    if (Number.isInteger(rounded)) {
      return `${rounded}km`;
    }
    return `${rounded.toFixed(1)}km`;
  }
  return `${Math.round(km)}km`;
}

export function getActivityDistanceKm(
  activity: Activity,
  refLat = DEMO_USER_LOCATION.latitude,
  refLng = DEMO_USER_LOCATION.longitude,
): number {
  if (activity.distanceKm != null && activity.distanceKm >= 0) {
    return activity.distanceKm;
  }
  if (activity.latitude && activity.longitude) {
    return haversineKm(refLat, refLng, activity.latitude, activity.longitude);
  }
  return 2;
}

export function getActivityLocationLine(
  activity: Activity,
  refLat = DEMO_USER_LOCATION.latitude,
  refLng = DEMO_USER_LOCATION.longitude,
): string {
  const neighborhood = getNeighborhoodName(activity.locationName);
  const km = getActivityDistanceKm(activity, refLat, refLng);
  return `📍 ${neighborhood} • ${formatDistance(km)}`;
}

export type NearbyArea = {
  name: string;
  distanceKm: number;
};

export function getNearbyAreas(
  activities: Activity[],
  refLat = DEMO_USER_LOCATION.latitude,
  refLng = DEMO_USER_LOCATION.longitude,
): NearbyArea[] {
  const byName = new Map<string, number>();

  for (const activity of activities) {
    const name = getNeighborhoodName(activity.locationName);
    const km = getActivityDistanceKm(activity, refLat, refLng);
    const existing = byName.get(name);
    if (existing == null || km < existing) {
      byName.set(name, km);
    }
  }

  return [...byName.entries()]
    .map(([name, distanceKm]) => ({ name, distanceKm }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function getClosestArea(
  activities: Activity[],
  refLat = DEMO_USER_LOCATION.latitude,
  refLng = DEMO_USER_LOCATION.longitude,
): NearbyArea | null {
  const areas = getNearbyAreas(activities, refLat, refLng);
  return areas[0] ?? null;
}
