export const DEV_LOGIN_BODY_EXAMPLES = {
  mainDemo: {
    summary: 'Main demo user',
    description: 'Full profile with feed data — use token for /users/me',
    value: { email: 'you@incircle.app' },
  },
  onboarding: {
    summary: 'New user (onboarding flow)',
    value: { email: 'new@incircle.app' },
  },
  host: {
    summary: 'Activity host',
    value: { email: 'priya@incircle.app' },
  },
} as const;

export const GOOGLE_LOGIN_BODY_EXAMPLES = {
  default: {
    summary: 'Google ID token',
    description: 'ID token from Google Sign-In on mobile or web',
    value: {
      token: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...',
    },
  },
} as const;
