import {View,Text, ActivityIndicator, TouchableOpacity} from 'react-native'
import React, {useContext} from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NotificationComponent } from '../NotificationComponent';
import AuthStack from './AuthStack'
import AppStack from './AppStack'
import { AuthContext } from '../AuthContext'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { DateFilterProvider } from '../DateFilterContext'

const AppNav = () => {
    const {isLoading, userToken} = useContext(AuthContext);

    if (isLoading)
    {
        return(
        <View style={{flex:1, justifyContent:'center',alignItems:'center'}}>
            <ActivityIndicator size={'large'} color={'#4DAA57'}/>
        </View>
        )
    }

    return(
            <NavigationContainer >
                { userToken !== null ?
                <AppStack />
                : 
                <AuthStack/>}

            </NavigationContainer>
    )
}

export default AppNav