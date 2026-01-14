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




        {/* HOD Screens */}
        <Stack.Screen name="HODDashboard" component={HODTabs} />
        <Stack.Screen name="HODPromote" component={HODPromotionScreen} />
        <Stack.Screen name="HODAnnouncement" component={HODAnnouncementScreen} />
        <Stack.Screen name="HODAssignTeacher" component={HODAssignTeacherScreen} />
        <Stack.Screen name="HODInternalMarks" component={HODInternalMarksScreen} />



        {/* We will add other HOD action screens here later */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
