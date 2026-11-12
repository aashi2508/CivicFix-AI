import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { colors } from '../theme';
import { Icon } from '../components/common/Icon';
import { HomeScreen } from '../screens/home/HomeScreen';
import { MapScreen } from '../screens/map/MapScreen';
import { MyComplaintsScreen } from '../screens/complaints/MyComplaintsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Dummy screen component for the central report tab button
const DummyReportScreen = () => <View style={{ flex: 1, backgroundColor: colors.background }} />;

export const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.cyan,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Icon name="home" size={20} color={color} />,
        }}
      />

      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: 'Radar Map',
          tabBarIcon: ({ color }) => <Icon name="map" size={20} color={color} />,
        }}
      />

      <Tab.Screen
        name="ReportTab"
        component={DummyReportScreen}
        options={({ navigation }) => ({
          tabBarLabel: '',
          tabBarButton: () => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => (navigation as any).navigate('ReportIssue')}
              style={styles.centerButtonWrapper}
            >
              <View style={styles.centerButtonGlow}>
                <Icon name="plus" size={22} color={colors.background} />
              </View>
            </TouchableOpacity>
          ),
        })}
      />

      <Tab.Screen
        name="MyComplaints"
        component={MyComplaintsScreen}
        options={{
          tabBarLabel: 'Complaints',
          tabBarIcon: ({ color }) => <Icon name="list" size={20} color={color} />,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Citizen',
          tabBarIcon: ({ color }) => <Icon name="user" size={20} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#0B1020',
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  centerButtonWrapper: {
    top: -14,
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
  },
  centerButtonGlow: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.cyan,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.cyan,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 3,
    borderColor: '#0B1020',
  },
});
