export type AuthUser = {
  id: string;
  email: string;
  username: string | null;
  fullName: string;
  bio: string | null;
  profilePhoto: string;
  isProfileCompleted: boolean;
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
};
