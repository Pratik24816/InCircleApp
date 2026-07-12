export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  Otp: { hint?: string } | undefined;
  ProfileSetup: undefined;
  InterestSelection: undefined;
  Main:
    | undefined
    | {
        screen?: keyof MainStackParamList;
        params?: MainStackParamList[keyof MainStackParamList];
      };
};

export type MainStackParamList = {
  Tabs: undefined;
  ActivityDetails: { id: string };
  Report: { activityId?: string; userId?: string };
  Notifications: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  MyEventsTab: { screen?: 'MyEvents'; params?: MyEventsStackList['MyEvents'] } | undefined;
  CreateTab: undefined;
  ChatsTab: undefined;
  ProfileTab: undefined;
};

export type HomeStackList = { HomeFeed: undefined };
export type MyEventsStackList = { MyEvents: { initialTab?: 'joined' | 'created' | 'done' } | undefined };
export type CreateStackList = { CreateActivity: undefined };
export type ChatsStackList = { ChatList: undefined; ChatDetail: { chatId: string } };
export type ProfileStackList = { ProfileMain: undefined; Settings: undefined };
