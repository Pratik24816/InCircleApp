import type { CircleAvatarId, FeedbackCategoryId } from '../constants/circleAvatars';

export type CircleMember = {
  id: string;
  avatarId: CircleAvatarId;
  name: string;
  message: string;
  category: FeedbackCategoryId;
  fireCount: number;
  memberNumber?: number;
  createdAt: number;
};

export function getCategoryLabel(id: FeedbackCategoryId): string {
  const labels: Record<FeedbackCategoryId, string> = {
    concept: 'Love the concept',
    suggestion: 'Suggestion',
    feature: 'Feature request',
    feedback: 'General feedback',
    hype: 'Launch hype',
    other: 'Other',
  };
  return labels[id];
}
