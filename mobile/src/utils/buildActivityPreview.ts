import type { Activity, AuthUser, Category } from '../types/auth';
import { resolveActivityCoverUrl } from './activityCovers';

const PREVIEW_ID = '00000000-0000-4000-8000-000000000099';

function parseStartDatetime(raw: string): Date {
  const trimmed = raw.trim();
  if (trimmed) {
    const parsed = new Date(trimmed.replace(' ', 'T'));
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 1);
  fallback.setHours(9, 0, 0, 0);
  return fallback;
}

export type CreateActivityPreviewInput = {
  title: string;
  locationName: string;
  city: string;
  startDatetime: string;
  category: Category | null;
  tags: string;
  groupType: Activity['groupType'];
  groupSize: string;
  coverUrl?: string | null;
  creator: AuthUser | null;
};

export function buildActivityPreview(input: CreateActivityPreviewInput): Activity {
  const tags = input.tags
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);

  const parsedSize = input.groupSize.trim() ? parseInt(input.groupSize, 10) : null;
  const groupSize = parsedSize != null && !Number.isNaN(parsedSize) ? parsedSize : null;
  const host = input.creator;

  const draft: Activity = {
    id: PREVIEW_ID,
    creatorId: host?.id ?? 'preview-host',
    categoryId: input.category?.id ?? '',
    title: input.title.trim() || 'Your plan title',
    description: '',
    coverUrl: input.coverUrl ?? null,
    startDatetime: parseStartDatetime(input.startDatetime).toISOString(),
    locationName: input.locationName.trim() || `Somewhere in ${input.city}`,
    city: input.city.trim() || 'Ahmedabad',
    latitude: 0,
    longitude: 0,
    groupType: input.groupType,
    groupSize,
    joinedCount: 1,
    status: 'open',
    approvalStatus: 'approved',
    tags,
    vibeTags: tags.length ? tags : undefined,
    featured: false,
    category: input.category ?? undefined,
    creator: {
      id: host?.id ?? 'preview-host',
      fullName: host?.fullName ?? 'You',
      username: host?.username ?? null,
      profilePhoto: host?.profilePhoto ?? '',
    },
    participants: host
      ? [
          {
            id: host.id,
            fullName: host.fullName,
            profilePhoto: host.profilePhoto,
          },
        ]
      : [],
  };

  return {
    ...draft,
    coverUrl: resolveActivityCoverUrl(draft),
  };
}
