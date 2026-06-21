const pexels = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=900&h=400&fit=crop`;

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&h=400&q=80`;

/** Verified direct image URLs — thematic stock photos */
export const ACTIVITY_COVER_URLS: Record<string, string> = {
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

export const CATEGORY_COVER_URLS: Record<string, string> = {
  fitness: pexels(247600),
  sports: pexels(274506),
  outdoor: unsplash('photo-1558618666-fcd25c85cd64'),
  social: pexels(128756),
};

const KEYWORD_COVERS: [RegExp, string][] = [
  [/riverfront|sabarmati|morning walk/i, pexels(247600)],
  [/walk|walking|hike/i, pexels(1179225)],
  [/cricket/i, pexels(274506)],
  [/pickell|pickleball|pickle ball|paddle/i, unsplash('photo-1554068865-24cecd4e34b8')],
  [/cycling|cycle|bike/i, unsplash('photo-1558618666-fcd25c85cd64')],
  [/chai|coffee|networking|meetup|cafe/i, pexels(128756)],
  [/study|library|focus/i, unsplash('photo-1481627834876-b7833e8f5570')],
  [/football|soccer/i, unsplash('photo-1522778119026-d647f0596c20')],
  [/open mic|music|mic night/i, pexels(1152994)],
  [/board game|boardgame|catan|dice/i, pexels(5739101)],
];

export const DEFAULT_COVER_URL = pexels(1179225);

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

export type CoverResolveInput = {
  id?: string;
  coverUrl?: string | null;
  title?: string;
  tags?: string[];
  categorySlug?: string | null;
};

export function resolveActivityCoverUrl(input: CoverResolveInput): string {
  if (input.id && ACTIVITY_COVER_URLS[input.id]) {
    return ACTIVITY_COVER_URLS[input.id];
  }

  const stored = input.coverUrl?.trim();
  if (stored && isDirectImageUrl(stored)) {
    return stored;
  }

  const haystack = `${input.title ?? ''} ${(input.tags ?? []).join(' ')}`.trim();
  for (const [pattern, url] of KEYWORD_COVERS) {
    if (pattern.test(haystack)) {
      return url;
    }
  }

  if (input.categorySlug && CATEGORY_COVER_URLS[input.categorySlug]) {
    return CATEGORY_COVER_URLS[input.categorySlug];
  }

  return DEFAULT_COVER_URL;
}

export function coverUrlForActivityId(id: string): string | undefined {
  return ACTIVITY_COVER_URLS[id];
}

export function coverUrlForKeyword(text: string): string | undefined {
  const resolved = resolveActivityCoverUrl({ title: text });
  return resolved === DEFAULT_COVER_URL ? undefined : resolved;
}
