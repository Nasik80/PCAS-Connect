import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Users, Search } from 'lucide-react-native';
import { colors } from '../constants/colors';

// Screens
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminClassMonitorScreen from '../screens/AdminClassMonitorScreen';
import AdminStudentFilterScreen from '../screens/AdminStudentFilterScreen';
import AdminTeacherFilterScreen from '../screens/AdminTeacherFilterScreen';

const Tab = createBottomTabNavigator();

const AdminTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { height: 60, paddingBottom: 10, paddingTop: 10 }
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={AdminDashboardScreen}
        options={{
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
          title: "Home"
        }}
      />
      <Tab.Screen
        name="Monitor"
        component={AdminClassMonitorScreen}
        options={{
          tabBarIcon: ({ color }) => <Users color={color} size={24} />,
          title: "Class View"
        }}
      />
      <Tab.Screen
        name="Students"
        component={AdminStudentFilterScreen}
        options={{
          tabBarIcon: ({ color }) => <Users color={color} size={24} />,
          title: "Students"
        }}
      />
      <Tab.Screen
        name="Teachers"
        component={AdminTeacherFilterScreen}
        options={{
          tabBarIcon: ({ color }) => <Users color={color} size={24} />,
          title: "Teachers"
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabs;