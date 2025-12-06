import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminTabs from './AdminTabs';
import HODTabs from './HODTabs';
import HODPromotionScreen from '../screens/HODPromotionScreen';
import HODAnnouncementScreen from '../screens/HODAnnouncementScreen';
import HODAssignTeacherScreen from '../screens/HODAssignTeacherScreen';

import SplashScreen from '../screens/SplashScreen';
import RoleSelectScreen from '../screens/RoleSelectScreen';
import StudentLoginScreen from '../screens/StudentLoginScreen';
import TeacherLoginScreen from '../screens/TeacherLoginScreen';
import AdminLoginScreen from '../screens/AdminLoginScreen';


// Import New Admin Screens
import AddStudentScreen from '../screens/AddStudentScreen';
import AddTeacherScreen from '../screens/AddTeacherScreen';
import AddDepartmentScreen from '../screens/AddDepartmentScreen';
import AddSubjectScreen from '../screens/AddSubjectScreen';
import AdminPromotionScreen from '../screens/AdminPromotionScreen';
// Admin Student Management
import AdminStudentFilterScreen from '../screens/AdminStudentFilterScreen';
import AdminStudentListScreen from '../screens/AdminStudentListScreen';
import AdminStudentViewScreen from '../screens/AdminStudentViewScreen';
import AdminStudentEditScreen from '../screens/AdminStudentEditScreen';

// Import the Tab Navigator
import StudentTabs from './StudentTabs';

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
        <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
        <Stack.Screen name="StudentDashboard" component={StudentTabs} />
        <Stack.Screen name="AdminDashboard" component={AdminTabs} />

        <Stack.Screen name="AddStudent" component={AddStudentScreen} />
        <Stack.Screen name="AddTeacher" component={AddTeacherScreen} />
        <Stack.Screen name="AddDepartment" component={AddDepartmentScreen} />
        <Stack.Screen name="AddSubject" component={AddSubjectScreen} />
        <Stack.Screen name="AdminPromotion" component={AdminPromotionScreen} />

        {/* HOD Screens */}
        <Stack.Screen name="HODDashboard" component={HODTabs} />
        <Stack.Screen name="hod-promote" component={HODPromotionScreen} />
        <Stack.Screen name="hod-announcement" component={HODAnnouncementScreen} />
        <Stack.Screen name="hod-assign-teacher" component={HODAssignTeacherScreen} />

        {/* Admin Student Management */}
        <Stack.Screen name="AdminStudentFilter" component={AdminStudentFilterScreen} />
        <Stack.Screen name="AdminStudentList" component={AdminStudentListScreen} />
        <Stack.Screen name="AdminStudentView" component={AdminStudentViewScreen} />
        <Stack.Screen name="AdminStudentEdit" component={AdminStudentEditScreen} />

        {/* We will add other HOD action screens here later */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
