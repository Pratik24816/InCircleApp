import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { ActivityDetailsScreen } from '../screens/ActivityDetailsScreen';
import { ChatDetailScreen } from '../screens/ChatDetailScreen';
import { ChatListScreen } from '../screens/ChatListScreen';
import { CreateActivityScreen } from '../screens/CreateActivityScreen';
import { HomeFeedScreen } from '../screens/HomeFeedScreen';
import { MyEventsScreen } from '../screens/MyEventsScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ReportScreen } from '../screens/ReportScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import type {
  ChatsStackList,
  HomeStackList,
  MainStackParamList,
  MyEventsStackList,
  ProfileStackList,
  TabParamList,
} from './types';

const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackList>();
const MyStack = createNativeStackNavigator<MyEventsStackList>();
const CreateStack = createNativeStackNavigator<{ CreateActivity: undefined }>();
const ChatStack = createNativeStackNavigator<ChatsStackList>();
const ProfStack = createNativeStackNavigator<ProfileStackList>();

function TabIconHome() {
  return <Text>🏠</Text>;
}
function TabIconEvents() {
  return <Text>📅</Text>;
}
function TabIconCreate() {
  return <Text>➕</Text>;
}
function TabIconChats() {
  return <Text>💬</Text>;
}
function TabIconProfile() {
  return <Text>👤</Text>;
}

function HomeStackNav() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeFeed" component={HomeFeedScreen} />
    </HomeStack.Navigator>
  );
}

function MyEventsStackNav() {
  return (
    <MyStack.Navigator screenOptions={{ headerShown: false }}>
      <MyStack.Screen name="MyEvents" component={MyEventsScreen} />
    </MyStack.Navigator>
  );
}

function CreateStackNav() {
  return (
    <CreateStack.Navigator screenOptions={{ headerShown: false }}>
      <CreateStack.Screen name="CreateActivity" component={CreateActivityScreen} />
    </CreateStack.Navigator>
  );
}

function ChatsStackNav() {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="ChatList" component={ChatListScreen} />
      <ChatStack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </ChatStack.Navigator>
  );
}

function ProfileStackNav() {
  return (
    <ProfStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfStack.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfStack.Screen name="Settings" component={SettingsScreen} />
    </ProfStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0B1224',
          borderTopColor: 'rgba(255,255,255,0.08)',
        },
        tabBarActiveTintColor: '#8CFF4F',
        tabBarInactiveTintColor: '#8A94A7',
      }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNav}
        options={{ title: 'Home', tabBarIcon: TabIconHome }}
      />
      <Tab.Screen
        name="MyEventsTab"
        component={MyEventsStackNav}
        options={{ title: 'My Events', tabBarIcon: TabIconEvents }}
      />
      <Tab.Screen
        name="CreateTab"
        component={CreateStackNav}
        options={{ title: 'Create', tabBarIcon: TabIconCreate }}
      />
      <Tab.Screen
        name="ChatsTab"
        component={ChatsStackNav}
        options={{ title: 'Chats', tabBarIcon: TabIconChats }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNav}
        options={{ title: 'Profile', tabBarIcon: TabIconProfile }}
      />
    </Tab.Navigator>
  );
}

export function MainNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Tabs" component={MainTabs} />
      <MainStack.Screen name="ActivityDetails" component={ActivityDetailsScreen} />
      <MainStack.Screen name="Report" component={ReportScreen} />
      <MainStack.Screen name="Notifications" component={NotificationsScreen} />
    </MainStack.Navigator>
  );
}
