export type AdminUser = {
  id: string
  email: string
  fullName: string
  city: string
  status: 'active' | 'suspended'
  joinedAt: string
}

export type AdminActivity = {
  id: string
  title: string
  hostName: string
  category: string
  startsAt: string
  status: 'published' | 'draft' | 'flagged'
}

export type AdminReport = {
  id: string
  targetType: 'user' | 'activity' | 'message'
  targetLabel: string
  reason: string
  createdAt: string
  status: 'open' | 'reviewing' | 'closed'
}

export type AdminCategory = {
  id: string
  name: string
  slug: string
  activityCount: number
}

export const DASHBOARD_STATS = {
  totalUsers: 1284,
  activeUsers7d: 312,
  publishedActivities: 89,
  openReports: 7,
  newSignups24h: 14,
}

export const MOCK_ADMIN_USERS: AdminUser[] = [
  {
    id: 'u-me',
    email: 'you@incircle.app',
    fullName: 'You',
    city: 'Ahmedabad',
    status: 'active',
    joinedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'u1',
    email: 'priya@example.com',
    fullName: 'Priya Shah',
    city: 'Ahmedabad',
    status: 'active',
    joinedAt: '2025-11-02T10:00:00Z',
  },
  {
    id: 'u2',
    email: 'dev@example.com',
    fullName: 'Dev Patel',
    city: 'Ahmedabad',
    status: 'suspended',
    joinedAt: '2025-12-15T10:00:00Z',
  },
]

export const MOCK_ADMIN_ACTIVITIES: AdminActivity[] = [
  {
    id: 'a0',
    title: 'Weekend Riverfront Walk',
    hostName: 'You',
    category: 'Fitness',
    startsAt: '2026-06-15T06:30:00',
    status: 'published',
  },
  {
    id: 'a1',
    title: 'Morning Walk — Sabarmati',
    hostName: 'Priya Shah',
    category: 'Fitness',
    startsAt: '2026-06-15T06:00:00',
    status: 'published',
  },
  {
    id: 'a8',
    title: 'Board Games Night',
    hostName: 'Dev Patel',
    category: 'Social',
    startsAt: '2026-06-18T19:00:00',
    status: 'flagged',
  },
]

export const MOCK_ADMIN_REPORTS: AdminReport[] = [
  {
    id: 'r1',
    targetType: 'activity',
    targetLabel: 'Board Games Night',
    reason: 'Spam / misleading details',
    createdAt: '2026-05-28T14:22:00Z',
    status: 'open',
  },
  {
    id: 'r2',
    targetType: 'user',
    targetLabel: 'dev_cricket',
    reason: 'Harassment',
    createdAt: '2026-05-27T09:10:00Z',
    status: 'reviewing',
  },
  {
    id: 'r3',
    targetType: 'message',
    targetLabel: 'Chat #c1',
    reason: 'Off-platform contact',
    createdAt: '2026-05-20T18:00:00Z',
    status: 'closed',
  },
]

export const MOCK_ADMIN_CATEGORIES: AdminCategory[] = [
  { id: 'c1', name: 'Fitness', slug: 'fitness', activityCount: 34 },
  { id: 'c2', name: 'Sports', slug: 'sports', activityCount: 22 },
  { id: 'c3', name: 'Social', slug: 'social', activityCount: 18 },
  { id: 'c4', name: 'Culture', slug: 'culture', activityCount: 9 },
  { id: 'c5', name: 'Outdoor', slug: 'outdoor', activityCount: 6 },
]
