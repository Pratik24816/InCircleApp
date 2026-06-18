export type UserRole = 'user' | 'admin' | 'moderator' | 'super_admin';
export type UserStatus = 'active' | 'suspended' | 'deleted' | 'pending';
export type ActivityStatus =
  | 'open'
  | 'almost_full'
  | 'full'
  | 'done'
  | 'cancelled'
  | 'closed';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type GroupType = 'need_one_person' | 'fixed_group' | 'open_join';

export type MockUser = {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  fullName: string;
  username: string;
  bio?: string;
  city: string;
  avatarUrl?: string;
  joinedAt: string;
};

export type MockInterest = {
  id: string;
  name: string;
  slug: string;
};

export type MockCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
};

export type MockActivity = {
  id: string;
  creatorId: string;
  categoryId: string;
  title: string;
  description: string;
  coverPlaceholder: string;
  startDatetime: string;
  endDatetime?: string;
  locationName: string;
  city: string;
  latitude: number;
  longitude: number;
  distanceKm: number;
  groupType: GroupType;
  groupSize: number | null;
  joinedCount: number;
  status: ActivityStatus;
  approvalStatus: ApprovalStatus;
  tags: string[];
  featured?: boolean;
};

export type MockParticipant = {
  id: string;
  activityId: string;
  userId: string;
  status: 'joined' | 'maybe' | 'left' | 'removed';
};

export type MockChat = {
  id: string;
  activityId: string;
  activityTitle: string;
  lastMessage: string;
  lastAt: string;
  unread: number;
};

export type MockMessage = {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  messageType: 'text' | 'image' | 'system';
  message?: string;
  systemEventType?: string;
  createdAt: string;
  isMine?: boolean;
};

export type MockNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  activityId?: string;
};

export type MockReport = {
  id: string;
  reporterId: string;
  reporterName: string;
  reportType: string;
  reason: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  createdAt: string;
  activityId?: string;
  reportedUserId?: string;
};
