import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { colors } from '../theme';

import { SplashScreen } from '../screens/auth/SplashScreen';
import { OnboardingScreen } from '../screens/auth/OnboardingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { BottomTabNavigator } from './BottomTabNavigator';
import { ReportIssueScreen } from '../screens/report/ReportIssueScreen';
import { AIAnalysisPreviewScreen } from '../screens/report/AIAnalysisPreviewScreen';
import { ReviewSubmitScreen } from '../screens/report/ReviewSubmitScreen';
import { ComplaintDetailsScreen } from '../screens/complaints/ComplaintDetailsScreen';
import { NotificationsScreen } from '../screens/home/NotificationsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const CivicFixTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.backgroundSecondary,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.cyan,
  },
};

export const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer theme={CivicFixTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
        <Stack.Screen
          name="ReportIssue"
          component={ReportIssueScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="AIAnalysisPreview"
          component={AIAnalysisPreviewScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ReviewSubmit"
          component={ReviewSubmitScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="ComplaintDetails"
          component={ComplaintDetailsScreen}
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="Notifications"
          component={NotificationsScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
