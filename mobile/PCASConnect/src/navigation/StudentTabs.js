import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { Home, Calendar, Bell, User, BookOpen } from 'lucide-react-native';
import { colors } from '../constants/colors';

// Screens
import StudentDashboardScreen from '../screens/StudentDashboardScreen';
import StudentTimeTableScreen from '../screens/StudentTimeTableScreen';
import StudentSubjectsScreen from '../screens/StudentSubjectsScreen';

// Dummy Screens for now
const DummyScreen = ({ name }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' }}>
    <Text style={{ color: '#64748B' }}>{name} Feature Coming Soon</Text>
  </View>
);

const Tab = createBottomTabNavigator();

const StudentTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          elevation: 10,
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        }
      }}
    >
      <Tab.Screen
        name="Home"
        component={StudentDashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={24} />,
        }}
      />

      <Tab.Screen
        name="TimeTable"
        component={StudentTimeTableScreen}
        options={{
          tabBarLabel: 'TimeTable',
          tabBarIcon: ({ color, size }) => <Calendar color={color} size={24} />,
        }}
      />

      <Tab.Screen
        name="Subjects"
        component={StudentSubjectsScreen}
        options={{
          tabBarLabel: 'Subjects',
          tabBarIcon: ({ color, size }) => <BookOpen color={color} size={24} />,
        }}
      />

      <Tab.Screen
        name="Notifications"
        children={() => <DummyScreen name="Notifications" />}
        options={{
          tabBarLabel: 'Notices',
          tabBarIcon: ({ color, size }) => <Bell color={color} size={24} />,
        }}
      />

      <Tab.Screen
        name="Profile"
        children={() => <DummyScreen name="Profile" />}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User color={color} size={24} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default StudentTabs;