export type AuthUser = {
  id: string;
  email: string;
  username: string | null;
  fullName: string;
  bio: string | null;
  city: string;
  profilePhoto: string;
  isProfileCompleted: boolean;
  interestIds?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type GoogleLoginResponse = {
  tokens: AuthTokens;
  user: AuthUser;
};

export type UpdateProfilePayload = {
  fullName?: string;
  username?: string;
  bio?: string;
  city?: string;
};

export type Interest = {
  id: string;
  name: string;
  slug: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
};

export type Activity = {
  id: string;
  creatorId: string;
  categoryId: string;
  title: string;
  description: string;
  coverUrl?: string | null;
  startDatetime: string;
  endDatetime?: string | null;
  locationName: string;
  city: string;
  latitude: number;
  longitude: number;
  groupType: 'need_one_person' | 'fixed_group' | 'open_join';
  groupSize: number | null;
  joinedCount: number;
  status: string;
  approvalStatus: string;
  tags: string[];
  vibeTags?: string[];
  featured?: boolean;
  distanceKm?: number;
  category?: Category;
  creator?: {
    id: string;
    fullName: string;
    username: string | null;
    profilePhoto?: string;
  };
  participants?: {
    id: string;
    fullName: string;
    profilePhoto?: string;
  }[];
};

export type CreateActivityPayload = {
  title: string;
  description: string;
  categoryId: string;
  startDatetime: string;
  endDatetime?: string | null;
  locationName: string;
  city: string;
  groupType: Activity['groupType'];
  groupSize?: number | null;
  tags?: string[];
  coverUrl?: string | null;
  latitude?: number;
  longitude?: number;
};

export type CreateReportPayload = {
  reportType: string;
  reason: string;
  description?: string;
  activityId?: string;
  reportedUserId?: string;
};
