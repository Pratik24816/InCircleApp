export const UPDATE_PROFILE_BODY_EXAMPLES = {
  updateAll: {
    summary: 'Update all profile fields',
    description: 'Full profile update for PATCH /users/profile',
    value: {
      username: 'you_ahm',
      fullName: 'You (Demo)',
      bio: 'Building habits & meeting people IRL.',
      city: 'Ahmedabad',
    },
  },
  setUsername: {
    summary: 'Complete onboarding (username only)',
    description: 'First-time username sets isProfileCompleted to true',
    value: {
      username: 'you_ahm',
    },
  },
  updateBio: {
    summary: 'Update bio only',
    value: {
      bio: 'Weekend walker & coffee enthusiast.',
    },
  },
} as const;
