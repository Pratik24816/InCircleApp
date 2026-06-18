import type {
  MockActivity,
  MockCategory,
  MockChat,
  MockInterest,
  MockMessage,
  MockNotification,
  MockParticipant,
  MockUser,
} from '../types/models';

export const MOCK_ME: MockUser = {
  id: 'u-me',
  email: 'you@incircle.app',
  phone: '+919876543210',
  role: 'user',
  status: 'active',
  fullName: 'You',
  username: 'you_ahm',
  bio: 'Building habits & meeting people IRL.',
  city: 'Ahmedabad',
  joinedAt: '2026-01-10T10:00:00Z',
};

export const MOCK_USERS: MockUser[] = [
  MOCK_ME,
  {
    id: 'u1',
    email: 'priya@example.com',
    role: 'user',
    status: 'active',
    fullName: 'Priya Shah',
    username: 'priya_walks',
    bio: 'Riverfront regular.',
    city: 'Ahmedabad',
    joinedAt: '2025-11-02T10:00:00Z',
  },
  {
    id: 'u2',
    email: 'dev@example.com',
    role: 'user',
    status: 'active',
    fullName: 'Dev Patel',
    username: 'dev_cricket',
    city: 'Ahmedabad',
    joinedAt: '2025-12-15T10:00:00Z',
  },
];

export const MOCK_INTERESTS: MockInterest[] = [
  { id: 'i1', name: 'Walking', slug: 'walking' },
  { id: 'i2', name: 'Cricket', slug: 'cricket' },
  { id: 'i3', name: 'Coffee', slug: 'coffee' },
  { id: 'i4', name: 'Chai', slug: 'chai' },
  { id: 'i5', name: 'Study', slug: 'study' },
  { id: 'i6', name: 'Sightseeing', slug: 'sightseeing' },
  { id: 'i7', name: 'Pickleball', slug: 'pickleball' },
  { id: 'i8', name: 'Cycling', slug: 'cycling' },
  { id: 'i9', name: 'Gym', slug: 'gym' },
  { id: 'i10', name: 'Books', slug: 'books' },
  { id: 'i11', name: 'Music', slug: 'music' },
  { id: 'i12', name: 'Nature', slug: 'nature' },
  { id: 'i13', name: 'Football', slug: 'football' },
  { id: 'i14', name: 'Photography', slug: 'photography' },
  { id: 'i15', name: 'Coding', slug: 'coding' },
];

export const MOCK_CATEGORIES: MockCategory[] = [
  { id: 'c1', name: 'Fitness', slug: 'fitness', icon: '🏃', color: '#8CFF4F' },
  { id: 'c2', name: 'Sports', slug: 'sports', icon: '🏏', color: '#4DB5FF' },
  { id: 'c3', name: 'Social', slug: 'social', icon: '☕', color: '#FFB020' },
  { id: 'c4', name: 'Culture', slug: 'culture', icon: '🎭', color: '#A78BFA' },
  { id: 'c5', name: 'Outdoor', slug: 'outdoor', icon: '🌿', color: '#22C55E' },
];

const base = '2026-06-15T';

export const MOCK_ACTIVITIES: MockActivity[] = [
  {
    id: 'a0',
    creatorId: 'u-me',
    categoryId: 'c3',
    title: 'Coffee Connect (hosted by you)',
    description: 'Founders & builders casual meet.',
    coverPlaceholder: 'coffee',
    startDatetime: `${base}17:30:00Z`,
    locationName: 'Navrangpura',
    city: 'Ahmedabad',
    latitude: 23.028,
    longitude: 72.565,
    distanceKm: 2.4,
    groupType: 'fixed_group',
    groupSize: 10,
    joinedCount: 7,
    status: 'open',
    approvalStatus: 'approved',
    tags: ['coffee', 'networking'],
  },
  {
    id: 'a1',
    creatorId: 'u1',
    categoryId: 'c1',
    title: 'Morning Walk',
    description: 'Easy pace along the riverfront. All levels welcome.',
    coverPlaceholder: 'walk',
    startDatetime: `${base}06:30:00Z`,
    locationName: 'Sabarmati Riverfront',
    city: 'Ahmedabad',
    latitude: 23.0225,
    longitude: 72.5714,
    distanceKm: 2.1,
    groupType: 'open_join',
    groupSize: null,
    joinedCount: 12,
    status: 'open',
    approvalStatus: 'approved',
    tags: ['walk', 'morning'],
    featured: true,
  },
  {
    id: 'a2',
    creatorId: 'u2',
    categoryId: 'c2',
    title: 'Sunday Cricket Match',
    description: 'Friendly match, bring your own gear if possible.',
    coverPlaceholder: 'cricket',
    startDatetime: `${base}07:00:00Z`,
    locationName: 'Law Garden',
    city: 'Ahmedabad',
    latitude: 23.03,
    longitude: 72.56,
    distanceKm: 4.5,
    groupType: 'fixed_group',
    groupSize: 14,
    joinedCount: 11,
    status: 'almost_full',
    approvalStatus: 'approved',
    tags: ['cricket', 'sunday'],
  },
  {
    id: 'a3',
    creatorId: 'u1',
    categoryId: 'c3',
    title: 'Chai Meetup',
    description: 'Slow Sunday chai and conversation.',
    coverPlaceholder: 'chai',
    startDatetime: `${base}16:00:00Z`,
    locationName: 'CG Road',
    city: 'Ahmedabad',
    latitude: 23.025,
    longitude: 72.575,
    distanceKm: 1.2,
    groupType: 'need_one_person',
    groupSize: 2,
    joinedCount: 1,
    status: 'open',
    approvalStatus: 'approved',
    tags: ['chai', 'conversation'],
  },
  {
    id: 'a4',
    creatorId: 'u2',
    categoryId: 'c4',
    title: 'City Sightseeing',
    description: 'Heritage walk through old city.',
    coverPlaceholder: 'city',
    startDatetime: `${base}09:00:00Z`,
    locationName: 'Bhadra Fort',
    city: 'Ahmedabad',
    latitude: 23.024,
    longitude: 72.58,
    distanceKm: 3.0,
    groupType: 'fixed_group',
    groupSize: 8,
    joinedCount: 8,
    status: 'full',
    approvalStatus: 'approved',
    tags: ['heritage', 'walk'],
  },
  {
    id: 'a5',
    creatorId: 'u1',
    categoryId: 'c2',
    title: 'Pickleball Session',
    description: 'Beginners welcome. Courts booked.',
    coverPlaceholder: 'pickle',
    startDatetime: `${base}18:00:00Z`,
    locationName: 'Satellite',
    city: 'Ahmedabad',
    latitude: 23.01,
    longitude: 72.52,
    distanceKm: 8.2,
    groupType: 'open_join',
    groupSize: null,
    joinedCount: 5,
    status: 'open',
    approvalStatus: 'approved',
    tags: ['pickleball'],
  },
  {
    id: 'a6',
    creatorId: 'u2',
    categoryId: 'c3',
    title: 'Study Circle',
    description: 'Deep work + breaks. Library nearby.',
    coverPlaceholder: 'study',
    startDatetime: `${base}11:00:00Z`,
    locationName: 'IIM Road',
    city: 'Ahmedabad',
    latitude: 23.035,
    longitude: 72.55,
    distanceKm: 6.1,
    groupType: 'fixed_group',
    groupSize: 6,
    joinedCount: 4,
    status: 'open',
    approvalStatus: 'approved',
    tags: ['study', 'focus'],
  },
  {
    id: 'a7',
    creatorId: 'u1',
    categoryId: 'c5',
    title: 'Cycling Ride',
    description: '25km loop, moderate pace.',
    coverPlaceholder: 'cycle',
    startDatetime: `${base}05:30:00Z`,
    locationName: 'SG Highway',
    city: 'Ahmedabad',
    latitude: 23.05,
    longitude: 72.5,
    distanceKm: 10,
    groupType: 'open_join',
    groupSize: null,
    joinedCount: 9,
    status: 'open',
    approvalStatus: 'approved',
    tags: ['cycling'],
  },
  {
    id: 'a8',
    creatorId: 'u2',
    categoryId: 'c3',
    title: 'Board Games Night',
    description: 'Light strategy games, snacks on us.',
    coverPlaceholder: 'coffee',
    startDatetime: `${base}17:30:00Z`,
    locationName: 'Navrangpura',
    city: 'Ahmedabad',
    latitude: 23.028,
    longitude: 72.565,
    distanceKm: 2.4,
    groupType: 'fixed_group',
    groupSize: 10,
    joinedCount: 7,
    status: 'open',
    approvalStatus: 'approved',
    tags: ['boardgames', 'social'],
  },
];

export const MOCK_PARTICIPANTS: MockParticipant[] = [
  { id: 'p1', activityId: 'a1', userId: 'u-me', status: 'joined' },
  { id: 'p2', activityId: 'a1', userId: 'u1', status: 'joined' },
  { id: 'p3', activityId: 'a2', userId: 'u-me', status: 'joined' },
  { id: 'p4', activityId: 'a3', userId: 'u1', status: 'joined' },
];

export const MOCK_CHATS: MockChat[] = [
  {
    id: 'ch1',
    activityId: 'a1',
    activityTitle: 'Morning Walk',
    lastMessage: 'See you at gate 3!',
    lastAt: '2026-06-14T19:20:00Z',
    unread: 2,
  },
  {
    id: 'ch2',
    activityId: 'a2',
    activityTitle: 'Sunday Cricket Match',
    lastMessage: 'Bringing stumps.',
    lastAt: '2026-06-14T12:00:00Z',
    unread: 0,
  },
];

export const MOCK_MESSAGES: MockMessage[] = [
  {
    id: 'm1',
    chatId: 'ch1',
    senderId: 'u1',
    senderName: 'Priya Shah',
    messageType: 'system',
    systemEventType: 'user_joined',
    createdAt: '2026-06-13T10:00:00Z',
  },
  {
    id: 'm2',
    chatId: 'ch1',
    senderId: 'u1',
    senderName: 'Priya Shah',
    messageType: 'text',
    message: 'Starting near the water steps.',
    createdAt: '2026-06-14T18:00:00Z',
  },
  {
    id: 'm3',
    chatId: 'ch1',
    senderId: 'u-me',
    senderName: 'You',
    messageType: 'text',
    message: 'See you at gate 3!',
    createdAt: '2026-06-14T19:20:00Z',
    isMine: true,
  },
];

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: 'n1',
    type: 'activity_almost_full',
    title: 'Almost full',
    body: 'Sunday Cricket is filling up fast.',
    read: false,
    createdAt: '2026-06-14T08:00:00Z',
    activityId: 'a2',
  },
  {
    id: 'n2',
    type: 'chat_message',
    title: 'New message',
    body: 'Priya in Morning Walk chat.',
    read: false,
    createdAt: '2026-06-14T19:21:00Z',
    activityId: 'a1',
  },
  {
    id: 'n3',
    type: 'nearby_activity',
    title: 'Nearby',
    body: 'New Chai Meetup in CG Road area.',
    read: true,
    createdAt: '2026-06-13T12:00:00Z',
    activityId: 'a3',
  },
];

export function getActivityById(id: string): MockActivity | undefined {
  return MOCK_ACTIVITIES.find(a => a.id === id);
}

export function getUserById(id: string): MockUser | undefined {
  return MOCK_USERS.find(u => u.id === id);
}

export function getCategoryById(id: string): MockCategory | undefined {
  return MOCK_CATEGORIES.find(c => c.id === id);
}

export function getMessagesForChat(chatId: string): MockMessage[] {
  return MOCK_MESSAGES.filter(m => m.chatId === chatId);
}

export function myJoinedActivities(userId: string): MockActivity[] {
  const ids = new Set(
    MOCK_PARTICIPANTS.filter(p => p.userId === userId).map(p => p.activityId),
  );
  return MOCK_ACTIVITIES.filter(a => ids.has(a.id));
}

export function myCreatedActivities(userId: string): MockActivity[] {
  return MOCK_ACTIVITIES.filter(a => a.creatorId === userId);
}
