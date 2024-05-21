import React, { useState, useContext } from 'react';
import { ScrollView, View, TextInput, Button, Text, TouchableOpacity, StyleSheet, Alert, ImageBackground, StatusBar } from 'react-native';
import { useRealm } from '@realm/react';
import { AuthContext } from './AuthContext';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ExpenseCategorySchema, UserSchema, defaultCategories } from './UserSchema';
import { Toast, ALERT_TYPE, AlertNotificationRoot } from 'react-native-alert-notification';

import Realm from 'realm';

const categoryIcons = {
    'Health': 'hospital-box-outline',
    'Personal Care': 'toothbrush-paste',
    'Education': 'book-open-page-variant',
    'Bills': 'checkbook',
    'House': 'home-heart',
    'Utilities': 'water',
    'Clothes': 'tshirt-crew',
    'Transport': 'train',
    'Groceries': 'cart-variant',
    'Rent': 'home-city-outline',
    'Travel': 'airplane-takeoff',
    'Electronics': 'monitor-cellphone',
    'Sports': 'basketball',
    'Gifts': 'gift-outline',
    'Car': 'car',
    'Shopping': 'shopping-outline',
    'Eating Out': 'food',
    'Entertainment': 'gamepad-variant-outline',
    'Pets': 'paw',
    'Beauty': 'content-cut',
    // Add more categories and their corresponding icons here
  };

  const categoryColors = {
    'Health': 'red',
    'Personal Care': '#27C5AD',
    'Education': '#36453B',
    'Bills': '#BA2B05',
    'House': '#313B3B',
    'Utilities': '#00008B',
    'Clothes': '#6622CC',
    'Transport': '#be2596',
    'Groceries': '#9ACD32',
    'Rent': '#847979',
    'Travel': '#8EA604',
    'Electronics': 'black',
    'Sports': '#FF8811',
    'Gifts': '#1DE713',
    'Car': '#40E0D0',
    'Shopping': '#9191E9',
    'Eating Out': '#B49A67',
    'Entertainment': '#301014',
    'Pets': '#F6F930',
    'Beauty': '#B8860B',
    // Add more categories and their corresponding colors here
  };

const RegisterScreen = ({ navigation }) => {
  const realm = useRealm();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const { register } = useContext(AuthContext);

  const handleSelectCategory = (name) => {
      if (selectedCategories.includes(name)) {
          setSelectedCategories(selectedCategories.filter(category => category !== name));
      } else {
          setSelectedCategories([...selectedCategories, name]);
      }
  };

  const handleSelectAll = () => {
      if (selectedCategories.length === defaultCategories.length) {
          setSelectedCategories([]);
      } else {
          setSelectedCategories(defaultCategories.map(category => category.name));
      }
  };

  const handleRegister = () => {
    // Check if required fields are empty
    if (!email.trim() || !password.trim() || !firstName.trim() || !lastName.trim()) {
      //Alert.alert("Missing Information", "Please complete all the fields.");
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Missing Information',
        textBody: 'Please complete all the fields.',
      })
      return;
    }

    // Define a regex pattern for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate the email address against the regex pattern
    if (!emailRegex.test(email)) {
      console.log('Please enter a valid email address.');
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Invalid Email',
        textBody: 'Please enter a valid email address.',
      })
      return;
    }

  // Password validation
  if (password.length < 8) {
    //Alert.alert("Weak Password", "Password must be at least 8 characters.");
    Toast.show({
      type: ALERT_TYPE.WARNING,
      title: 'Weak Password',
      textBody: 'Password must be at least 8 characters.',
    })
    return;
  }

  // Check for at least one special character and one number in the password
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
  const numberRegex = /\d/;  // Checks for any digit

  if (!specialCharRegex.test(password)) {
    //Alert.alert("Weak Password", "Password must contain at least one special character.");
    Toast.show({
      type: ALERT_TYPE.WARNING,
      title: 'Weak Password',
      textBody: 'Password must contain at least one special character.',
    })
    return;
  }

  if (!numberRegex.test(password)) {
    //Alert.alert("Weak Password", "Password must contain at least one number.");
    Toast.show({
      type: ALERT_TYPE.WARNING,
      title: 'Weak Password',
      textBody: 'Password must contain at least one number.',
    })
    return;
  }
    // Check if no categories are selected
    if (selectedCategories.length === 0) {
      //Alert.alert("No Categories Selected", "Please select at least one category.");
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'No Categories Selected',
        textBody: 'Please select at least one category.',
      })
      return;
    }
  
    // Prepare categories for registration
    const categoriesForRegistration = defaultCategories.map(category => ({
      name: category.name,
      isSelected: selectedCategories.includes(category.name),
    }));
  
    register(email, firstName, lastName, password, categoriesForRegistration);
  };
  

// const handleRegister = async () => {
//     // if (!username.trim() || !password.trim()) {
//     //   Alert.alert("Missing Information", "Username and password cannot be empty.");
//     //   return;
//     // }
//     // if (selectedCategories.length === 0) {
//     //   Alert.alert("No Categories Selected", "Please select at least one category.");
//     //   return;
//     // }

//     // const formattedCategories = selectedCategories.map(categoryName => {
//     //     // Find the category object from defaultCategories by name
//     //     const category = defaultCategories.find(cat => cat.name === categoryName);
//     //     return {
//     //       name: category.name,
//     //       expenses: category.expenses, // Assuming this is a default or initial value
//     //       isSelected: true, // Since it's selected
//     //     };
//     //   });
    
//     const realm =  await Realm.open({
//         schema: [UserSchema, ExpenseCategorySchema],
//       });
//       const realmFileLocation = realm.path;
//       console.log(realmFileLocation);
//       console.log(`Realm file is located at: ${realm.path}`);
      
//     // Adjust this call to match your logic for handling selected categories
//     //createNewUser(realm, username);
//   };

//   const categoriesForRegistration = selectedCategories.map(categoryName => {
//     // Find the full category object from defaultCategories by name
//     const category = defaultCategories.find(cat => cat.name === categoryName);
  
//     // Return a structure that matches the ExpenseCategory schema
//     return {
//       name: category.name,
//       expenses: category.expenses, // Assuming a default value or provided by the category object
//       isSelected: true, // Since it's selected
//     };
//   });
  

// Simplified user creation for debugging
// const createNewUser = async (username, password) => {
//     try {
//         realm.write(() => {
//             // Assuming newUser is a User object you've created and want to add categories to
//             const newUser = realm.create('User', {
//               _id: new Realm.BSON.ObjectId(),
//               username: "exampleUser",
//               password: "examplePass",
//               token: "exampleToken",
//               income: 5000,
//               expensesCategories: [], // This will be populated next
//             });
          
//             // Example category data
//             const categoriesData = [
//               { name: "Food", expenses: 100, isSelected: true },
//               { name: "Transportation", expenses: 50, isSelected: true },
//             ];
          
//             // Adding expense categories to the newUser
//             categoriesData.forEach(categoryData => {
//               newUser.expensesCategories.push(categoryData);
//             });
//           });
          
//       console.log("Simplified user created successfully");
//     } catch (error) {
//       console.error("Realm error during simplified creation:", error);
//     }
//   };
  
  // deselected category button = #EBFDFF

  return (
    <AlertNotificationRoot>
      <StatusBar translucent backgroundColor="transparent" />
    <ImageBackground source={require('../assets/background.png')} style={styles.backgroundImage}>
        <ScrollView contentContainerStyle={styles.container}>
        <View style={{borderBottomWidth: 2, borderBottomColor: 'white', marginTop: 30, alignSelf: 'center', width:'100%'}}>
        <Text style={styles.text1}>Register</Text>
       </View>
        <View style={styles.inputs}>
        <View style={styles.iconBoxEmail}>
        <MaterialCommunityIcons name="email-edit-outline" size={30} color={'white'} />
        </View>
          <TextInput
              placeholder="Email address"
              onChangeText={setEmail}
              value={email}
              style={styles.input}
          />
        <View style={styles.iconBoxFirstName}>
        <MaterialCommunityIcons name="account-circle" size={30} color={'white'} />
        </View>
          <TextInput
              placeholder="First Name"
              onChangeText={setFirstName}
              value={firstName}
              style={styles.input}
          />
        <View style={styles.iconBoxLastName}>
        <MaterialCommunityIcons name="account-circle-outline" size={30} color={'white'} />
        </View>
          <TextInput
              placeholder="Last Name"
              onChangeText={setLastName}
              value={lastName}
              style={styles.input}
          />
        <View style={styles.iconBoxPassword}>
        <MaterialCommunityIcons name="lock-outline" size={30} color={'white'} />
        </View>
          <TextInput
              placeholder="Password"
              onChangeText={setPassword}
              value={password}
              secureTextEntry
              style={styles.input}
          />
          </View>
          <View style={{ width:'100%', justifyContent:'center', alignItems:'center', marginTop:15 }}>
        <Text style={styles.customizeText}>Please customize your main expenses: </Text>
        </View>
          <ScrollView style={{flexGrow:1}}>

          <View style={styles.categories}>
          {/* {defaultCategories.map((category, index) => (
              <TouchableOpacity
                  key={index}
                  onPress={() => handleSelectCategory(category.name)}
                  style={styles.categoryItem}
              >
                  <Text style={{ color: selectedCategories.includes(category.name) ? 'blue' : 'white' }}>
                      {category.name}
                  </Text>
              </TouchableOpacity>
          ))} */}
          
          {defaultCategories.map((category, index) => (
                <TouchableOpacity key={index} style={[styles.item, { backgroundColor: selectedCategories.includes(category.name) ? '#57A773' : 'transparent', borderWidth:2, borderColor: selectedCategories.includes(category.name) ? 'white' : '#7ac695', elevation: selectedCategories.includes(category.name) ? 5:0 }]} onPress={() => handleSelectCategory(category.name)}>
                {/* <Image source={icon} style={styles.icon} /> */}
                 <MaterialCommunityIcons name={categoryIcons[category.name]} size={30} left={3} style={styles.icon} color={categoryColors[category.name]} /> 
                <Text style={[styles.titleCategory, ]}>{category.name}</Text>
              </TouchableOpacity>
              ))}
          </View>
          </ScrollView>
        <TouchableOpacity
            onPress={handleSelectAll}
            style={styles.SelectAll}
        >
            <Text style={{color: '#57A773', fontFamily: 'Quicksand-SemiBold', fontSize: 16}}>{selectedCategories.length === defaultCategories.length ? "Deselect All" : "Select All"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.buttonText}>Register</Text>
            <MaterialCommunityIcons name="arrow-right" size={30} color={'white'} style={{position: 'absolute', right: 110, top: 17,}}/>
        </TouchableOpacity>
          
      </ScrollView>
      </ImageBackground>
      </AlertNotificationRoot>
  );
};

const styles = StyleSheet.create({
  container: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  text1: {
    marginTop: 5,
    marginBottom: 10,
    alignSelf: 'center',
    color: '#DFE4DD',
    fontSize: 50,
    fontFamily: 'Quicksand-Bold',
    //fontWeight: '700',
    lineHeight: 91,
  },
  inputs: {
    width: '95%',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  categories: {
    flexDirection: 'column',
    justifyContent: 'center',
    width: '95%',
    marginTop: 20,
    flex: 1,
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
    shadowColor: '#008000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryItem: {
      margin: 5,
      paddingBottom: 20,
  },
  iconBoxEmail: {
    position: 'absolute',
    zIndex: 1,
    backgroundColor: '#57A773', // Adjust the color to match your blue
    padding: 15, // Can adjust to scale the size
    borderRadius: 15, // Can adjust for desired roundness
    //justifyContent: 'center',
    marginLeft: 39,
    marginTop: 12,
    left:0,
    alignItems: 'center',
  },
  iconBoxFirstName: {
    position: 'absolute',
    zIndex: 1,
    backgroundColor: '#57A773', // Adjust the color to match your blue
    padding: 15, // Can adjust to scale the size
    borderRadius: 15, // Can adjust for desired roundness
    //justifyContent: 'center',
    marginLeft: 39,
    marginTop: 96,
    left:0,
    alignItems: 'center',
  },
  iconBoxLastName: {
    position: 'absolute',
    zIndex: 1,
    backgroundColor: '#57A773', // Adjust the color to match your blue
    padding: 15, // Can adjust to scale the size
    borderRadius: 15, // Can adjust for desired roundness
    //justifyContent: 'center',
    marginLeft: 39,
    marginTop: 180,
    left:0,
    alignItems: 'center',
  },
  iconBoxPassword: {
    position: 'absolute',
    zIndex: 1,
    backgroundColor: '#57A773', // Adjust the color to match your blue
    padding: 15, // Can adjust to scale the size
    borderRadius: 15, // Can adjust for desired roundness
    //justifyContent: 'center',
    marginLeft: 39,
    marginTop: 264,
    left:0,
    alignItems: 'center',
  },
  item: {
    borderRadius: 10,
    width: 250,
    height: 56,
    margin: '2%',
    alignItems: 'center',
    justifyContent: 'center',
    //backgroundColor: 'transparent', // Adjust the background color as needed
    // Add shadow and other styles as needed
    borderColor: '#BFCBC2',
    borderBottomWidth: 1,
    borderRightWidth: 1,
    shadowColor: '#000', // Adding shadow for a subtle elevation effect
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Elevation for Android
  },
  SelectAll: {
    borderRadius: 15,

    width: 220,
    height: 56,
    marginTop: -10,
    margin: '1%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent', // Adjust the background color as needed
    // Add shadow and other styles as needed
    borderColor: '#57A773',
    borderWidth: 2,
  },
  icon: {
    marginRight: 200, // Space between the icon and the text
    top: 10,
    // Other styles if needed, like padding...
  },
  titleCategory: {
    color: 'white',
    fontFamily: 'Quicksand-Bold', // Adjust the font family as needed
    //fontWeight: 'bold',
    textAlign: 'left',
    fontSize: 18,
    width: 150,
    bottom: 20,
    right: -5,
    // Add styles for the title text
  },
  customizeText: {
    position: 'absolute',
    color: '#DFE4DD',
    fontSize: 16,
    fontFamily: 'Quicksand-SemiBold',
    top: 20,
    //fontWeight: '700',
    //lineHeight: 91,
  },
  registerButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#57A773', // Adjust the color to match your button color
    padding: 15,
    marginTop: 20,
    marginBottom: 20,
    width: '80%',
    borderRadius: 20,
    shadowColor: 'white',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    color: 'white',
    fontFamily: 'Quicksand-SemiBold',
    fontSize: 18,
    marginRight: 30,
  }
});

export default RegisterScreen;