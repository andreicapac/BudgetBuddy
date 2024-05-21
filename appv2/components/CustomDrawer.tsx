import React from 'react';
import {
  View,
  Text,
  ImageBackground,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';

import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { AuthContext } from '../AuthContext';
import { User } from '../UserSchema';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRealm } from '@realm/react';

const CustomDrawer = props => {
    const {logout} = React.useContext(AuthContext);
    const {resetDataForCurrentUser} = React.useContext(AuthContext);
    const realm = useRealm();
    const [username, setUsername] = React.useState('');

    React.useEffect(() => {
        const fetchUsername = async () => {
          const token = await AsyncStorage.getItem('userToken');
          const users = realm.objects<User>('User').filtered(`token == "${token}"`);
          const user = users.length > 0 ? users[0] : null;
        
          if (user) {
            setUsername(user.firstName + ' ' + user.lastName);
          }
        }
        fetchUsername();
    }, []);


  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{backgroundColor: '#57A773', paddingTop: 95}}>

        <MaterialCommunityIcons name="account-circle" size={30} color="white" style={{position: 'absolute', top: 60, left: 10}} />
        <Text style={{position: 'absolute', top: 65, left: 50, color:'white', fontSize: 16, fontFamily: 'Quicksand-SemiBold'}}>{username}</Text>
        <View style={{flex: 1, backgroundColor: 'white', paddingTop: 20}}>
          <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>
      <View style={{padding: 20, borderTopWidth: 1, borderTopColor: '#ccc'}}>
            <TouchableOpacity onPress={() => props.navigation.navigate('Update Categories')} style={{paddingVertical: 15}}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Ionicons name="duplicate-outline" size={22} />
          <Text
            style={{
              fontSize: 15,
              fontFamily: 'Quicksand-SemiBold',
              marginLeft: 5,
            }}>
            Update Categories
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={resetDataForCurrentUser} style={{paddingVertical: 15}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <MaterialCommunityIcons name="lock-reset" size={22} />
            <Text
              style={{
                fontSize: 15,
                fontFamily: 'Quicksand-SemiBold',
                marginLeft: 5,
              }}>
              Reset Data
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={logout} style={{paddingVertical: 15}}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Ionicons name="exit-outline" size={22} />
            <Text
              style={{
                fontSize: 15,
                fontFamily: 'Quicksand-SemiBold',
                marginLeft: 5,
              }}>
              Sign Out
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomDrawer;
