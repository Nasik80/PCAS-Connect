import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Settings } from 'lucide-react-native'; // Icons
import { colors } from '../constants/colors';
import { View } from 'react-native';

// Screens
import AdminDashboardScreen from '../screens/AdminDashboardScreen';

// Placeholder for now
const AdminSettingsScreen = () => <View style={{flex:1, backgroundColor:'white'}} />;

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
        name="Home" 
        component={AdminDashboardScreen} 
        options={{
          tabBarIcon: ({ color }) => <Home color={color} size={24} />
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={AdminSettingsScreen} 
        options={{
          tabBarIcon: ({ color }) => <Settings color={color} size={24} />
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminTabs;
