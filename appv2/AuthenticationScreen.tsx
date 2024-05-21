import React, {useState} from 'react';
import {View, TextInput, Button, StyleSheet, TouchableOpacity, Text, Image, ImageBackground, KeyboardAvoidingView, Platform, StatusBar} from 'react-native';
import { useRealm } from '@realm/react';
import SvgImage from 'react-native-svg/lib/typescript/elements/Image';
import { AuthContext } from './AuthContext';
import { UserSchema, ExpenseCategorySchema } from './UserSchema';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Icon from 'react-native-vector-icons/FontAwesome'; // Use appropriate icon set
import { SafeAreaView } from 'react-native-safe-area-context';
import {AlertNotificationRoot} from 'react-native-alert-notification'

const AuthenticationScreen = ({navigation}) => {
    const realm = useRealm();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const {login} = React.useContext(AuthContext);

  //console.log('Realm DB Path:', realm.path);
// // Inside AuthenticationScreen component
// const handleLogin = () => {
//   if (username.trim() === '' || password.trim() === '') {
//     console.log('Username and password are required.');
//     return; // Exit the function early if validation fails
//   }

//     const user = realm.objects('User').filtered(`username == "${username}" AND password == "${password}"`);

//     if (user.length > 0) {
//       console.log('Login successful');
//       //navigation.navigate('Home');
//     } else {
//       console.log('Invalid username or password');
//     }
//   };
  

  // return (
  //   <View style={styles.container}>
  //     <TextInput placeholder="Email" onChangeText={setEmail} value={email} />
  //     <TextInput placeholder="Password" onChangeText={setPassword} value={password} secureTextEntry />
  //     <Button title="Login" onPress={() => login(email, password)} />

  //     <Button title="Register" onPress={() => navigation.navigate('Register')} />
  //   </View>
  // );

  return (
    <AlertNotificationRoot>
    <View style={styles.container}>
    <StatusBar translucent backgroundColor="transparent" />
       <ImageBackground source={require('../assets/background.png')} style={styles.backgroundImage}>
        <View style={{borderBottomWidth: 2, borderBottomColor: 'white', top: 70, position: 'absolute', alignSelf: 'center', width:'100%'}}>
       <Text style={styles.text1}>Hello</Text>
       </View>
      <Text
          style={{
            position: 'absolute',
            top: 190,
            justifyContent: 'center',
            alignSelf: 'center',
            fontFamily: 'Quicksand-Regular',
            fontSize: 22,
            //fontWeight: '400',
            color: 'white',
            marginBottom: 30,
          }}>
          Log In to your account
        </Text>
    <View style={styles.emailPass}>
      <View style={styles.inputContainer}>
        <View style={styles.iconBox}>
        <MaterialCommunityIcons name="email-edit-outline" size={30} color={'white'} />
        </View>
        <TextInput 
          style={styles.input} 
          placeholder="Email address"
          keyboardType="email-address"
          onChangeText={setEmail}
          value={email}
        />
      </View>
      <View style={styles.inputContainer2}>
      <View style={styles.iconBox}>
        <MaterialCommunityIcons name="lock-outline" size={30} color={'white'} />
        </View>
        <TextInput 
          style={styles.input} 
          placeholder="Password" 
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />
      </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={() => {login(email, password)
        setEmail('');
        setPassword('');
      }}>
        <Text style={styles.buttonText}>Log In</Text>
        <MaterialCommunityIcons name="arrow-right" size={30} color={'white'} style={{position: 'absolute', right: 115, top: 16,}}/>
      </TouchableOpacity>
      <Text style={styles.orSeparator}>New to the app?</Text>
      <TouchableOpacity style={styles.button2} onPress={() => {navigation.navigate('Register')
        setEmail('');
        setPassword('');
      }}>
        <Text style={styles.signUp}>Register</Text>
        <MaterialCommunityIcons name="arrow-right" size={30} color={'#57A773'} style={{position: 'absolute', right: 108, top: 10,}}/>
      </TouchableOpacity>
      </ImageBackground>
    </View>
    </AlertNotificationRoot>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // You might want to adjust the color to match the exact shade
  },
  logo: {
    position: 'absolute',
    top: 90,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    //width: '80%',
    height: 150,
    borderBottomWidth: 2,
    borderBottomColor: 'white',
    paddingBottom: 40,
    marginBottom: 20,
  },
  text1: {
    top: -20,
    alignSelf: 'center',
    color: '#DFE4DD',
    fontSize: 50,
    fontFamily: 'Quicksand-Bold',
    //fontWeight: '700',
    lineHeight: 91,
  },
  iconBox: {
    position: 'absolute',
    zIndex: 1,
    backgroundColor: '#57A773', // Adjust the color to match your blue
    padding: 15, // Can adjust to scale the size
    borderRadius: 15, // Can adjust for desired roundness
    //justifyContent: 'center',
    marginLeft: 20,
    alignItems: 'center',
  },
  emailPass: {
    flexDirection: 'column',
    margin: '1%',
    top: 280,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    //position: 'absolute',
  },
  input: {
    height: 60,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    flex: 1,
    paddingRight: 20,
    borderRadius: 15,
    borderColor: '#e7e7e7', // Adjust the color as needed
    backgroundColor: '#e7e7e7',
    paddingHorizontal: 70,
    width: '80%', // Adjust the width as needed
    fontFamily: 'Quicksand-Medium',
    shadowColor: 'white',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    top: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    padding: 10,
    margin: 12,
    width: '95%',
    paddingLeft: 10,

  },
  inputContainer2: {
    bottom: 35,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    padding: 10,
    margin: 12,
    width: '95%',
    paddingLeft: 10,
  },
  inputIcon: {
    //marginRight: 2,
  },
  button: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#57A773', // Adjust the color to match your button color
    padding: 15,
    width: '80%',
    borderRadius: 20,
    top: 245,
    shadowColor: 'white',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button2: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'transparent', // Adjust the color to match your button color
    padding: 10,
    width: '80%',
    borderRadius: 15,
    top: 350,
    borderWidth: 2,
    borderColor: '#57A773',
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 18,
    marginRight: 30,
    //fontWeight: '500',
  },
  forgotPassword: {
    color: '#0000FF', // Adjust the color as needed
    marginTop: 15,
  },
  signUp: {
    color: '#57A773', // Adjust the color as needed
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 18,
    bottom: 2,
    marginRight: 30,
    //fontWeight: '400',
  },
  orSeparator: {
    alignContent: 'center',
    alignSelf: 'center',
    marginTop: 20,
    top: 340,
    color: 'white', // Adjust the color as needed
    fontFamily:'Quicksand-Light',
  }
});

export default AuthenticationScreen;
