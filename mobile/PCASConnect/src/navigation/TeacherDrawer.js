import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

import TeacherTabs from './TeacherTabs';
import TeacherAnnouncementsScreen from '../screens/TeacherAnnouncementsScreen';
import TeacherPastAttendanceScreen from '../screens/TeacherPastAttendanceScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import RoleSelectScreen from '../screens/RoleSelectScreen'; // For Logout

const Drawer = createDrawerNavigator();

const TeacherDrawer = () => {
    return (
        <Drawer.Navigator
            screenOptions={{
                headerShown: false,
                drawerActiveTintColor: colors.primary,
                drawerInactiveTintColor: colors.textSecondary,
                drawerLabelStyle: {
                    fontSize: 15,
                    fontWeight: '500'
                }
            }}
        >
            <Drawer.Screen
                name="DashboardHome"
                component={TeacherTabs}
                options={{
                    title: 'Dashboard',
                    drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />
                }}
            />
            <Drawer.Screen
                name="Announcements"
                component={TeacherAnnouncementsScreen}
                options={{
                    drawerIcon: ({ color, size }) => <Ionicons name="megaphone-outline" size={size} color={color} />
                }}
            />
            <Drawer.Screen
                name="PastAttendance"
                component={TeacherPastAttendanceScreen}
                options={{
                    title: 'Past Attendance',
                    drawerIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} />
                }}
            />
            <Drawer.Screen
                name="HelpSupport"
                component={HelpSupportScreen}
                options={{
                    title: 'Help & Support',
                    drawerIcon: ({ color, size }) => <Ionicons name="help-circle-outline" size={size} color={color} />
                }}
            />
            {/* Usually Logout would be a custom drawer item, but for now we can add it here or rely on Profile tab */}
            {/* 
      <Drawer.Screen 
        name="Logout" 
        component={RoleSelectScreen}
         options={{
            headerShown: false, // Ensure no header
            drawerIcon: ({ color, size }) => <Ionicons name="log-out-outline" size={size} color={color} />
        }}
      /> 
      */}
        </Drawer.Navigator>
    );
};

export default TeacherDrawer;
