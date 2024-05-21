import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import OnboardingScreen from '../OnboardingScreen';
import AuthenticationScreen from '../AuthenticationScreen';
import RegisterScreen from '../RegisterScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator initialRouteName="Onboarding">
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false,  }} />
      <Stack.Screen name="Authentication" component={AuthenticationScreen} options={{ headerShown: false, animation:'slide_from_bottom', animationDuration: 400}}/>
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }}/>
      {/* Select categories screen -> to be implemented */}
    </Stack.Navigator>
  );
};

export default AuthStack;