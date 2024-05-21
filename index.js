import 'expo-dev-client';
import 'react-native-get-random-values';
import React, { useState } from 'react';
import {registerRootComponent} from 'expo'
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {enableScreens} from 'react-native-screens';
import Realm from 'realm';
import { UserSchema, ExpenseCategorySchema, IncomeEntrySchema, ExpenseEntrySchema, IncomeCategorySchema, TransactionSchema } from './appv2/UserSchema';
import { RealmProvider, useEffect } from '@realm/react';

import AuthenticationScreen from './appv2/AuthenticationScreen';
import RegisterScreen from './appv2/RegisterScreen';
import HomeScreen from './appv2/HomeScreen';
import OnboardingScreen from './appv2/OnboardingScreen';
import { AuthProvider } from './appv2/AuthContext';
import AppNav from './appv2/Stacks/AppNav';
import { DateFilterProvider } from './appv2/DateFilterContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppLoading from 'expo-app-loading';
import * as Font from 'expo-font';
import { CurrencyProvider } from './appv2/CurrencyContext';
import {AlertNotificationRoot} from 'react-native-alert-notification'


enableScreens();

const loadFonts = async () => {
  await Font.loadAsync({
    'Quicksand': require('./assets/fonts/Quicksand.ttf'),
    'Quicksand-Bold': require('./assets/fonts/Quicksand-Bold.ttf'),
    'Quicksand-Light': require('./assets/fonts/Quicksand-Light.ttf'),
    'Quicksand-Medium': require('./assets/fonts/Quicksand-Medium.ttf'),
    'Quicksand-Regular': require('./assets/fonts/Quicksand-Regular.ttf'),
    'Quicksand-SemiBold': require('./assets/fonts/Quicksand-SemiBold.ttf'),
    'DancingScript-VariableFont_wght': require('./assets/fonts/DancingScript-VariableFont_wght.ttf'),
    'DancingScript-Regular': require('./assets/fonts/DancingScript-Regular.ttf'),
    'DancingScript-Bold': require('./assets/fonts/DancingScript-Bold.ttf'),
  });
};

// Define your Realm configuration
const realmConfig = {
  schema: [UserSchema, IncomeEntrySchema, ExpenseCategorySchema, ExpenseEntrySchema, IncomeCategorySchema, TransactionSchema], // Add all your schemas here
  // You can include other configuration options as needed
  schemaVersion: 26,
  // migration: (oldRealm, newRealm) => {
  //   const oldUsers = oldRealm.objects('User');
  //   newRealm.delete(oldUsers); // Delete all objects of the type 'User'
  // },
};

const realm = new Realm(realmConfig);
console.log('Realm path:', realm.path);

const Stack = createStackNavigator();

const App = () =>
{
  const [fontsLoaded, setFontsLoaded] = useState(false);

  if (!fontsLoaded) {
    return <AppLoading startAsync={loadFonts} onFinish={() => setFontsLoaded(true)} onError={console.warn} />;
  }


  return (
    <SafeAreaProvider>
    <RealmProvider config={realmConfig}>
      <AlertNotificationRoot theme='light'>

        <AuthProvider>
        <DateFilterProvider>
          <CurrencyProvider>
          <AppNav>
          </AppNav>
          </CurrencyProvider>
        </DateFilterProvider>
        </AuthProvider>

      </AlertNotificationRoot>
    </RealmProvider>
    </SafeAreaProvider>
  );
}
registerRootComponent(App);

