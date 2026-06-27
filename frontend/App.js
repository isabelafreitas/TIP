import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS } from './src/theme';

import SplashScreen from './src/screens/auth/SplashScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import CompleteProfileScreen from './src/screens/auth/CompleteProfileScreen';

import HomeScreen from './src/screens/requester/HomeScreen';
import ProvidersListScreen from './src/screens/requester/ProvidersListScreen';
import ProviderProfileScreen from './src/screens/requester/ProviderProfileScreen';
import RequestServiceScreen from './src/screens/requester/RequestServiceScreen';
import PublishAnnouncementScreen from './src/screens/requester/PublishAnnouncementScreen';
import MyAnnouncementsScreen from './src/screens/requester/MyAnnouncementsScreen';
import ServiceTrackingScreen from './src/screens/requester/ServiceTrackingScreen';
import ConfirmServiceScreen from './src/screens/requester/ConfirmServiceScreen';
import DisputeScreen from './src/screens/requester/DisputeScreen';
import CancelServiceRequesterScreen from './src/screens/requester/CancelServiceRequesterScreen';
import CancelServiceRequesterLateScreen from './src/screens/requester/CancelServiceRequesterLateScreen';
import ProfileScreen from './src/screens/requester/ProfileScreen';

import ProviderHomeScreen from './src/screens/provider/ProviderHomeScreen';
import MyServiceScreen from './src/screens/provider/MyServiceScreen';
import AwaitingConfirmationScreen from './src/screens/provider/AwaitingConfirmationScreen';
import CancelServiceProviderScreen from './src/screens/provider/CancelServiceProviderScreen';
import AgendaScreen from './src/screens/provider/AgendaScreen';
import ProviderProfileSettingsScreen from './src/screens/provider/ProviderProfileSettingsScreen';

import ChatScreen from './src/screens/shared/ChatScreen';
import ServiceHistoryScreen from './src/screens/shared/ServiceHistoryScreen';
import SavedProvidersScreen from './src/screens/shared/SavedProvidersScreen';

const Stack = createStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
    </Stack.Navigator>
  );
}

function RequesterStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="ProvidersList" component={ProvidersListScreen} />
      <Stack.Screen name="ProviderProfile" component={ProviderProfileScreen} />
      <Stack.Screen name="RequestService" component={RequestServiceScreen} />
      <Stack.Screen name="PublishAnnouncement" component={PublishAnnouncementScreen} />
      <Stack.Screen name="MyAnnouncements" component={MyAnnouncementsScreen} />
      <Stack.Screen name="ServiceTracking" component={ServiceTrackingScreen} />
      <Stack.Screen name="ConfirmService" component={ConfirmServiceScreen} />
      <Stack.Screen name="Dispute" component={DisputeScreen} />
      <Stack.Screen name="CancelServiceRequester" component={CancelServiceRequesterScreen} />
      <Stack.Screen name="CancelServiceRequesterLate" component={CancelServiceRequesterLateScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="ServiceHistory" component={ServiceHistoryScreen} />
      <Stack.Screen name="SavedProviders" component={SavedProvidersScreen} />
    </Stack.Navigator>
  );
}

function ProviderStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProviderHome" component={ProviderHomeScreen} />
      <Stack.Screen name="MyService" component={MyServiceScreen} />
      <Stack.Screen name="AwaitingConfirmation" component={AwaitingConfirmationScreen} />
      <Stack.Screen name="CancelServiceProvider" component={CancelServiceProviderScreen} />
      <Stack.Screen name="Agenda" component={AgendaScreen} />
      <Stack.Screen name="ProviderProfileSettings" component={ProviderProfileSettingsScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="ServiceHistory" component={ServiceHistoryScreen} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.cream }}>
        <ActivityIndicator size="large" color={COLORS.petrol} />
      </View>
    );
  }
  if (!user) return <AuthStack />;
  if (user.is_provider) return <ProviderStack />;
  return <RequesterStack />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.cream }}>
        <ActivityIndicator size="large" color={COLORS.petrol} />
      </View>
    );
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
