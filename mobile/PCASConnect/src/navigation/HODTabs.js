import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Placeholder Imports (Will be created next)
import HODDashboardScreen from '../screens/HODDashboardScreen';
import HODStudentListScreen from '../screens/HODStudentListScreen';
import HODTeacherListScreen from '../screens/HODTeacherListScreen';
import HODTimeTableEditorScreen from '../screens/HODTimeTableEditorScreen';
import HODAttendanceOverviewScreen from '../screens/HODAttendanceOverviewScreen';

const Tab = createBottomTabNavigator();

const HODTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'speedometer' : 'speedometer-outline';
                    } else if (route.name === 'Students') {
                        iconName = focused ? 'people' : 'people-outline';
                    } else if (route.name === 'Teachers') {
                        iconName = focused ? 'briefcase' : 'briefcase-outline';
                    } else if (route.name === 'Timetable') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Attendance') {
                        iconName = focused ? 'checkmark-done-circle' : 'checkmark-done-circle-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#6200ea',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="Dashboard" component={HODDashboardScreen} />
            <Tab.Screen name="Students" component={HODStudentListScreen} />
            <Tab.Screen name="Teachers" component={HODTeacherListScreen} />
            <Tab.Screen name="Timetable" component={HODTimeTableEditorScreen} />
            <Tab.Screen name="Attendance" component={HODAttendanceOverviewScreen} />
        </Tab.Navigator>
    );
};

export default HODTabs;
