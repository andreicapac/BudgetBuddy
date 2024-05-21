import React, { useEffect, useState } from 'react';
import { View, Image, Text, StyleSheet,TouchableOpacity, ViewStyle, ImageBackground, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { useRealm } from '@realm/react';
import * as Font from 'expo-font';

const useFonts = async () => {
  await Font.loadAsync({
    'Quicksand': require('../assets/fonts/Quicksand.ttf'),
    'Quicksand-Bold': require('../assets/fonts/Quicksand-Bold.ttf'),
    'Quicksand-Light': require('../assets/fonts/Quicksand-Light.ttf'),
    'Quicksand-Medium': require('../assets/fonts/Quicksand-Medium.ttf'),
    'Quicksand-Regular': require('../assets/fonts/Quicksand-Regular.ttf'),
    'Quicksand-SemiBold': require('../assets/fonts/Quicksand-SemiBold.ttf'),
    'DancingScript-VariableFont_wght': require('../assets/fonts/DancingScript-VariableFont_wght.ttf'),
    'DancingScript-Regular': require('../assets/fonts/DancingScript-Regular.ttf'),
    'DancingScript-Bold': require('../assets/fonts/DancingScript-Bold.ttf'),
  });
};

const OnboardingScreen = ({navigation}) => {
  const realm = useRealm();

  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    useFonts()
      .then(() => setFontsLoaded(true))
      .catch(console.warn);
  }, []);

  if (!fontsLoaded) {
    return <View><Text>Loading...</Text></View>; // Or a custom loading component
  }
  
  // useEffect(() => {
  //   async function loadFonts() {
  //     await Font.loadAsync({
  //       'Quicksand-Regular': require('../assets/fonts/Quicksand-Regular.ttf'),
  //       'Quicksand-Bold': require('../assets/fonts/Quicksand-Bold.ttf'),
  //       'Quicksand-Medium': require('../assets/fonts/Quicksand-Medium.ttf'),
  //       'Quicksand-SemiBold': require('../assets/fonts/Quicksand-SemiBold.ttf'),
  //       'Quicksand-Light': require('../assets/fonts/Quicksand-Light.ttf'),
  //       'Quicksand': require('../assets/fonts/Quicksand.ttf'),
  //     });
  //   }

  //   loadFonts();
  // });

  const deleteAllUsers = async () => {
  

    // Begin a write transaction
    realm.write(() => {
      // Retrieve all users
      const allUsers = realm.objects('User');
      
      // Delete all users
      realm.delete(allUsers);
      console.log('All users deleted successfully');
    });
  
    realm.close(); // Remember to close your realm
  };
  

    return (
      <View style={styles.container}>
        <StatusBar translucent backgroundColor="transparent" />
      <ImageBackground source={require('../assets/background.png')} style={styles.backgroundImage}>
        {/* Text Content */}
        <View style={styles.textContainer}>
          <Text style={styles.text1}>BudgetBuddy</Text>
          <Text style={styles.text2}>SAVE MORE. SPEND LESS</Text>
        </View>
        <View style={styles.logo}>
        <Image source={require('../assets/logo2.png')} tintColor={'white'} resizeMode='stretch' style={{ width: 350, height: 350 }}/>
      </View>
        {/* Updated button using TouchableOpacity */}
        <TouchableOpacity
          style={{
            width: '100%',
            position: 'relative',
            top: 600,
            alignItems: 'center',
            justifyContent: 'center',
          }}

          onPress={() => {
            navigation.navigate('Authentication');
          }} // Navigate to 'ThirdScreen'
        >
          <View style={{ padding: 20, backgroundColor: '#D9D9D9', borderRadius: 157 }}>
          {/* color: '#3E4631' */}
            <Text style={{ color: '#3E4631', fontSize: 25, fontFamily: 'Quicksand-SemiBold' }}>Get Started </Text>
          </View>
        </TouchableOpacity>
        </ImageBackground>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      width: '100%',
      height: '100%',
      position: 'relative',
      backgroundColor: 'transparent',
      overflow: 'hidden',
      borderRadius: 0,
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
  
  
      // Include other properties like width and height, depending on the size of your logo
    },
    backgroundImage: {
      width: '100%',
      height: '120%',
      position: 'absolute',
    },
    image: {
      width: 138,
      height: 150,
      left: 146,
      top: 82,
      position: 'absolute',
      borderRadius: 25,
    },
    textContainer: {
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      width: 400,
      height: 100,
      left: 0,
      top: 100,
    },
    text1: {
      color: '#DFE4DD',
      fontSize: 50,
      fontFamily: 'Quicksand-Bold',
      //fontWeight: '700',
      lineHeight: 91,
      top: 250,
    },
    text2: {
      color: '#DFE4DD',
      fontSize: 25,
      fontFamily: 'Quicksand',
      //fontWeight: '700',
      lineHeight: 31,
      top: 250,
      left: 5,
    },
  });
  
  export default OnboardingScreen;
  