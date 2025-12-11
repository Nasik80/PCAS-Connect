import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

import HODTabs from './HODTabs';
import HODPromotionScreen from '../screens/HODPromotionScreen';
import HODAssignTeacherScreen from '../screens/HODAssignTeacherScreen';
import HODAnnouncementScreen from '../screens/HODAnnouncementScreen';
import HODReportsScreen from '../screens/HODReportsScreen';
import HODTimeTableEditorScreen from '../screens/HODTimeTableEditorScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';

const Drawer = createDrawerNavigator();

const HODDrawer = () => {
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
                component={HODTabs}
                options={{
                    title: 'Dashboard',
                    drawerIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />
                }}
            />

            <Drawer.Screen
                name="PromoteStudents"
                component={HODPromotionScreen}
                options={{
                    title: 'Promote Students',
                    drawerIcon: ({ color, size }) => <Ionicons name="arrow-up-circle-outline" size={size} color={color} />
                }}
            />
            <Drawer.Screen
                name="AssignTeacher"
                component={HODAssignTeacherScreen}
                options={{
                    title: 'Assign Teacher',
                    drawerIcon: ({ color, size }) => <Ionicons name="person-add-outline" size={size} color={color} />
                }}
            />
            <Drawer.Screen
                name="DeptAnnouncements"
                component={HODAnnouncementScreen}
                options={{
                    title: 'Dept Announcements',
                    drawerIcon: ({ color, size }) => <Ionicons name="megaphone-outline" size={size} color={color} />
                }}
            />
            <Drawer.Screen
                name="DeptReports"
                component={HODReportsScreen}
                options={{
                    title: 'Department Reports',
                    drawerIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} />
                }}
            />
            <Drawer.Screen
                name="ManageTimetable"
                component={HODTimeTableEditorScreen}
                options={{
                    title: 'Manage Timetable',
                    drawerIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />
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

        </Drawer.Navigator>
    );
};

export default HODDrawer;
