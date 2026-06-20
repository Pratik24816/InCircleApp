import type { Activity } from '../types/auth';

const pexels = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900&h=400&fit=crop`;

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&h=400&q=80`;

export const DEFAULT_COVER_URL = pexels(1179225);

const COVER_BY_ID: Record<string, string> = {
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1': pexels(247600),
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2': pexels(274506),
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3': pexels(128756),
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb4': unsplash('photo-1558618666-fcd25c85cd64'),
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb5': unsplash('photo-1481627834876-b7833e8f5570'),
  'dddddddd-dddd-4ddd-8ddd-dddddddddd01': unsplash('photo-1522778119026-d647f0596c20'),
  'dddddddd-dddd-4ddd-8ddd-dddddddddd02': pexels(1152994),
  'dddddddd-dddd-4ddd-8ddd-dddddddddd03': pexels(128756),
  'dddddddd-dddd-4ddd-8ddd-dddddddddd04': pexels(5739101),
};

const COVER_BY_KEYWORD: [RegExp, string][] = [
  [/riverfront|sabarmati|morning walk/i, pexels(247600)],
  [/walk|walking|hike/i, pexels(1179225)],
  [/cricket/i, pexels(274506)],
  [/pickell|pickleball|pickle ball|paddle/i, unsplash('photo-1554068865-24cecd4e34b8')],
  [/cycling|cycle|bike|cycling loop/i, unsplash('photo-1558618666-fcd25c85cd64')],
  [/chai|coffee|networking|meetup|cafe/i, pexels(128756)],
  [/study|library|focus/i, unsplash('photo-1481627834876-b7833e8f5570')],
  [/football|soccer/i, unsplash('photo-1522778119026-d647f0596c20')],
  [/open mic|music|mic night/i, pexels(1152994)],
  [/board game|boardgame|catan|dice/i, pexels(5739101)],
];

const CATEGORY_COVERS: Record<string, string> = {
  fitness: pexels(247600),
  sports: pexels(274506),
  outdoor: unsplash('photo-1558618666-fcd25c85cd64'),
  social: pexels(128756),
};

export function isDirectImageUrl(url: string): boolean {
  const u = url.trim().toLowerCase();
  if (!u.startsWith('http')) {
    return false;
  }
  if (u.includes('adobe.com') || u.includes('google.com/search')) {
    return false;
  }
  return (
    u.includes('images.pexels.com/photos/') ||
    u.includes('images.unsplash.com/photo-') ||
    /\.(jpg|jpeg|png|webp)(\?|$)/.test(u)
  );
}

export function resolveActivityCoverUrl(
  activity: Pick<Activity, 'id' | 'coverUrl' | 'title' | 'tags' | 'category'>,
): string {
  if (activity.id && COVER_BY_ID[activity.id]) {
    return COVER_BY_ID[activity.id];
  }

  const stored = activity.coverUrl?.trim();
  if (stored && isDirectImageUrl(stored)) {
    return stored;
  }

  const haystack = `${activity.title} ${activity.tags?.join(' ') ?? ''}`;
  for (const [pattern, url] of COVER_BY_KEYWORD) {
    if (pattern.test(haystack)) {
      return url;
    }
  }

  const slug = activity.category?.slug;
  if (slug && CATEGORY_COVERS[slug]) {
    return CATEGORY_COVERS[slug];
  }

  return DEFAULT_COVER_URL;
}

/** @deprecated use resolveActivityCoverUrl — always returns a photo URL */
export function getActivityCoverUrl(
  activity: Pick<Activity, 'id' | 'coverUrl' | 'title' | 'tags' | 'category'>,
): string {
  return resolveActivityCoverUrl(activity);
}

export function getCoverPhotoLabel(
  activity: Pick<Activity, 'title' | 'tags' | 'category'>,
): string {
  const haystack = `${activity.title} ${activity.tags?.join(' ') ?? ''}`.toLowerCase();
  if (/riverfront|sabarmati/.test(haystack)) return 'Riverfront';
  if (/cricket/.test(haystack)) return 'Cricket ground';
  if (/cycling|cycle|bike/.test(haystack)) return 'Cycling';
  if (/coffee|chai|cafe|meetup/.test(haystack)) return 'Café';
  if (/pickleball|pickell|paddle/.test(haystack)) return 'Pickleball';
  if (/football|soccer/.test(haystack)) return 'Football';
  if (/study|library/.test(haystack)) return 'Library';
  if (/walk|walking/.test(haystack)) return 'Walking trail';
  return activity.category?.name ?? 'Plan photo';
}
