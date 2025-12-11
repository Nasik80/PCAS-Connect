import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

import TeacherDashboardScreen from '../screens/TeacherDashboardScreen';
import TeacherSubjectsScreen from '../screens/TeacherSubjectsScreen';
import TeacherAttendanceScreen from '../screens/TeacherAttendanceScreen';
import TeacherTimetableScreen from '../screens/TeacherTimetableScreen';
import TeacherProfileScreen from '../screens/TeacherProfileScreen';

const Tab = createBottomTabNavigator();

const TeacherTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'speedometer' : 'speedometer-outline';
                    } else if (route.name === 'Subjects') {
                        iconName = focused ? 'book' : 'book-outline';
                    } else if (route.name === 'Attendance') {
                        iconName = focused ? 'checkmark-done-circle' : 'checkmark-done-circle-outline';
                    } else if (route.name === 'Timetable') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: 'gray',
                tabBarStyle: {
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8
                }
            })}
        >
            <Tab.Screen name="Dashboard" component={TeacherDashboardScreen} />
            <Tab.Screen name="Subjects" component={TeacherSubjectsScreen} />
            <Tab.Screen name="Attendance" component={TeacherAttendanceScreen} />
            <Tab.Screen name="Timetable" component={TeacherTimetableScreen} />
            <Tab.Screen name="Profile" component={TeacherProfileScreen} />
        </Tab.Navigator>
    );
};

export default TeacherTabs;
