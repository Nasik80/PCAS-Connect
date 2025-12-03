import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import SplashScreen from '../screens/SplashScreen';
import RoleSelectScreen from '../screens/RoleSelectScreen';
import StudentLoginScreen from '../screens/StudentLoginScreen';
import TeacherLoginScreen from '../screens/TeacherLoginScreen';
import AdminLoginScreen from '../screens/AdminLoginScreen';

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
        
        {/* 👇 Points to the Tab Navigator now 👇 */}
        <Stack.Screen name="StudentDashboard" component={StudentTabs} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;