import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../HomeScreen';
import CustomDrawer from '../components/CustomDrawer';
import UpdateCategoriesScreen from '../UpdateCategories';
import AddExpenseScreen from '../AddExpenseScreen';
import AddIncomeScreen from '../AddIncomeScreen';
import { TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Drawer } from 'react-native-drawer-layout'
import { DateFilterContext } from '../DateFilterContext';
import DateFilterDrawer from '../components/DateFilterDrawer';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import BalanceOverview from '../BalanceOverview';

const RightDrawer = createDrawerNavigator();

function LeftDrawerScreen() {
  //const [leftDrawerOpen, setLeftDrawerOpen] = React.useState(false);
  const { leftDrawerOpen, setLeftDrawerOpen } = React.useContext(DateFilterContext);

  const value = React.useMemo(
    () => ({
      openLeftDrawer: () => setLeftDrawerOpen(true),
      closeLeftDrawer: () => setLeftDrawerOpen(false),
    }),
    []
  );

  return (
    <Drawer
      open={leftDrawerOpen}
      onOpen={() => setLeftDrawerOpen(true)}
      onClose={() => setLeftDrawerOpen(false)}
      drawerPosition="left"
      drawerStyle={{ width: 180 }}
      renderDrawerContent={() => <DateFilterDrawer />}
    >
      <DateFilterContext.Provider value={value} >
        <RightStack/>
      </DateFilterContext.Provider>
    </Drawer>
  );
}

const RightStack = () => {
  return (
    <RightDrawer.Navigator 
      drawerContent = {props => <CustomDrawer {...props} />}
      screenOptions = {({navigation}) => ({ swipeEdgeWidth: 50, drawerLabelStyle: { marginLeft: -20, fontSize: 15, fontFamily: 'Quicksand-Bold' } ,drawerActiveBackgroundColor: '#4CAF50', drawerActiveTintColor:'white', drawerStyle: {width: 240}, drawerPosition: "right", headerLeft: () => null, headerRight: () => (
        <TouchableOpacity  onPress={() => navigation.toggleDrawer()}>
            {/* Replace "menu" with the icon you want for the drawer */}
            <MaterialCommunityIcons name="menu" size={30} color={'black'} />
          </TouchableOpacity>
    )})}
    >
      <RightDrawer.Screen
       name="Home"
       component={HomeScreen}
       options={{ headerShown: false, drawerIcon: ({color}) => (<MaterialCommunityIcons name="home-outline" size={22} color={color}/>) }}
      />
      <RightDrawer.Screen
       name="Update Categories"
       component={UpdateCategoriesScreen}
       options={{ headerShown: false, drawerIcon: ({color}) => (<Ionicons name="duplicate-outline" size={22} color={color}/>) }}
      />
      <RightDrawer.Screen
       name="Add Income"
       component={AddIncomeScreen}
       options={{ headerShown: false, drawerIcon: ({color}) => (<MaterialCommunityIcons name="cash-plus" size={22} color={color}/>) }}
       initialParams={{ currentPeriod: new Date().toISOString() }}
      />
      <RightDrawer.Screen
       name="Add Expense"
       component={AddExpenseScreen}
       options={{ headerShown: false, drawerIcon: ({color}) => (<MaterialCommunityIcons name="cash-minus" size={22} color={color}/>) }}
       initialParams={{ currentPeriod: new Date().toISOString() }}
      />

      {/* You can add more screens here that should be accessible via the drawer */}
    </RightDrawer.Navigator>
  );
};


//export default AppStack;

export default function AppStack() {
  return (
    
      <LeftDrawerScreen />
    
  );
}