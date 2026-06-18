import { create } from 'zustand';

type AppState = {
  onboardingComplete: boolean;
  isAuthenticated: boolean;
  profileComplete: boolean;
  interestsComplete: boolean;
  selectedInterestIds: string[];
  selectedCity: string;
  setOnboardingComplete: (v: boolean) => void;
  setAuthenticated: (v: boolean) => void;
  setProfileComplete: (v: boolean) => void;
  setInterestsComplete: (v: boolean) => void;
  setSelectedInterests: (ids: string[]) => void;
  setSelectedCity: (city: string) => void;
  resetDemo: () => void;
};

export const useAppStore = create<AppState>(set => ({
  onboardingComplete: false,
  isAuthenticated: false,
  profileComplete: false,
  interestsComplete: false,
  selectedInterestIds: [],
  selectedCity: 'Ahmedabad',
  setOnboardingComplete: v => set({ onboardingComplete: v }),
  setAuthenticated: v => set({ isAuthenticated: v }),
  setProfileComplete: v => set({ profileComplete: v }),
  setInterestsComplete: v => set({ interestsComplete: v }),
  setSelectedInterests: ids => set({ selectedInterestIds: ids }),
  setSelectedCity: city => set({ selectedCity: city }),
  resetDemo: () =>
    set({
      onboardingComplete: false,
      isAuthenticated: false,
      profileComplete: false,
      interestsComplete: false,
      selectedInterestIds: [],
      selectedCity: 'Ahmedabad',
    }),
}));
