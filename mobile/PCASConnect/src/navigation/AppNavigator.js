import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HODTabs from './HODTabs';
import HODPromotionScreen from '../screens/HODPromotionScreen';
import HODAnnouncementScreen from '../screens/HODAnnouncementScreen';
import HODAssignTeacherScreen from '../screens/HODAssignTeacherScreen';
import HODInternalMarksScreen from '../screens/HODInternalMarksScreen';

import SplashScreen from '../screens/SplashScreen';
import RoleSelectScreen from '../screens/RoleSelectScreen';
import StudentLoginScreen from '../screens/StudentLoginScreen';
import TeacherLoginScreen from '../screens/TeacherLoginScreen';
import TeacherSubjectsScreen from '../screens/TeacherSubjectsScreen';
import InternalMarkEntryScreen from '../screens/InternalMarkEntryScreen';
import TeacherAnnouncementsScreen from '../screens/TeacherAnnouncementsScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import StudentProfileScreen from '../screens/StudentProfileScreen';
import ForcedPasswordChangeScreen from '../screens/ForcedPasswordChangeScreen';
import TeacherStudyNotesScreen from '../screens/TeacherStudyNotesScreen';
import StudentAnnouncementsScreen from '../screens/StudentAnnouncementsScreen';
import StudentInternalMarksScreen from '../screens/StudentInternalMarksScreen';

// Import the Tab Navigator
import StudentTabs from './StudentTabs';
import TeacherTabs from './TeacherTabs';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="RoleSelect" component={RoleSelectScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="StudentLogin" component={StudentLoginScreen} />
        <Stack.Screen name="TeacherLogin" component={TeacherLoginScreen} />

        <Stack.Screen name="StudentDashboard" component={StudentTabs} />
        <Stack.Screen name="TeacherDashboard" component={TeacherTabs} />
        <Stack.Screen name="Subjects" component={TeacherSubjectsScreen} />
        <Stack.Screen name="Announcements" component={TeacherAnnouncementsScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="ForcedPasswordChange" component={ForcedPasswordChangeScreen} />
        <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
        <Stack.Screen name="TeacherStudyNotes" component={TeacherStudyNotesScreen} />
        <Stack.Screen name="StudentAnnouncements" component={StudentAnnouncementsScreen} />
        <Stack.Screen name="StudentInternalMarks" component={StudentInternalMarksScreen} />

        {/* HOD Screens */}
        <Stack.Screen name="HODDashboard" component={HODTabs} />
        <Stack.Screen name="HODPromote" component={HODPromotionScreen} />
        <Stack.Screen name="HODAnnouncement" component={HODAnnouncementScreen} />
        <Stack.Screen name="HODAssignTeacher" component={HODAssignTeacherScreen} />
        <Stack.Screen name="HODInternalMarks" component={HODInternalMarksScreen} />
        <Stack.Screen name="InternalMarkEntry" component={InternalMarkEntryScreen} />

        {/* We will add other HOD action screens here later */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
