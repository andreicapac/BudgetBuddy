// Error: [@RNC/AsyncStorage]: NativeModule: AsyncStorage is null. -> fix it
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {createContext, useEffect, useState, useContext} from 'react'
import { useRealm, Realm } from '@realm/react';
//import Realm from "realm";
import { BSON } from 'realm';
Realm.flags.THROW_ON_GLOBAL_REALM = true;
import { IncomeCategories } from './UserSchema';
import { v4 as uuidv4 } from 'uuid';
import { User } from './UserSchema';
import { Alert } from 'react-native';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';

export const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const realm = useRealm();
    const [isLoading, setIsLoading] = useState(true);
    const [userToken, setUserToken] = useState(null);

    const login = async(email, password) =>{
        // userToken must be generated and stored in AsyncStorage (or realm) -- maybe using the current date as a token

        setIsLoading(true);
        
        // Define a regex pattern for email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (email.trim() === '' || password.trim() === '') {
          setIsLoading(false);
          console.log('Email and password are required.');
          Dialog.show({
            type: ALERT_TYPE.WARNING,
            title: 'Email and password are required.',
            textBody: 'Please enter your email and password.',
            button: 'Close',

          })
          //Alert.alert('Email and password are required.', 'Please enter your email and password.', [{ text: 'OK' }], { cancelable: false });
          return; // Exit the function early if validation fails
      }

      // Validate the email address against the regex pattern
      if (!emailRegex.test(email)) {
        console.log('Please enter a valid email address.');
        //Alert.alert('Invalid Email', 'Please enter a valid email address.', [{ text: 'OK' }], { cancelable: false });
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: 'Invalid Email',
          textBody: 'Please enter a valid email address.',
          button: 'Close',
        })
        setIsLoading(false);
        return;
      }
        
            const user = realm.objects('User').filtered(`email == "${email}" AND password == "${password}"`);
        
            if (user.length > 0) {
              const token = uuidv4(); // Generates a UUID (v4)
             await AsyncStorage.setItem('userToken', token);
             setUserToken(token);
              Dialog.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Login successful',
                textBody: 'You have successfully logged in.',
                button: 'Close',
              })
             // Update the token in the Realm database
                try {
                  realm.write(() => {
                      // Assuming `user[0]` is the user you want to update
                      user[0].token = token;
                      console.log('Token updated in Realm for user:', email);
                  });
              } catch (error) {
                  console.error('Error updating token in Realm:', error);
              }
            } else {
              console.log('Invalid email or password');
              //Alert.alert('Wrong email or password.', 'Please try again.', [{ text: 'OK' }], { cancelable: false });
              Dialog.show({
                type: ALERT_TYPE.DANGER,
                title: 'Wrong email or password',
                textBody: 'Please try again.',
                button: 'Close',
              })
            }
            setIsLoading(false);
    };

    // const register = async (email, password, categoriesForRegistration) => {
    //   setIsLoading(true);
    
    //   // Check if the username already exists
    //   const existingUsers = realm.objects('User').filtered(`username == "${username}"`);
    //   if (existingUsers.length > 0) {
    //     console.log("Username already exists.");
    //     setIsLoading(false);
    //     return;
    //   }
    
    //   let newUserToken = uuidv4(); // Prepare token to be set in AsyncStorage
      
    //   //console.log(id);
    //   try {
    //     realm.write(() => {
    //       const newUser = realm.create('User', {
    //         username,
    //         password,
    //         token: newUserToken,
    //         income: 0.0,
    //         expensesCategories: [], // This will be populated shortly
    //       });
        
    //       // Assuming categoriesForRegistration is correctly structured for embedded objects
    //       const categories = categoriesForRegistration.map(cat => ({
    //         name: cat.name,
    //         expenses: cat.expenses,
    //         isSelected: cat.isSelected,
    //       }));
        
    //       // Directly assign the prepared categories to the newUser
    //       newUser.expensesCategories = categories;
    //     });
        
    
    //     // AsyncStorage operation
    //     await AsyncStorage.setItem('userToken', newUserToken);
    //     setUserToken(newUserToken); // Update state with the new token
    //     console.log("User registered successfully with categories.");
    //   } catch (error) {
    //     console.error("Realm error:", error);
    //   } finally {
    //     setIsLoading(false); // Ensure loading state is updated last
    //   }
    // };

    const register = async (email, firstName, lastName, password, categoriesForRegistration) => {
      setIsLoading(true);
    
      // Check if email already exists
      const existingUsers = realm.objects('User').filtered(`email == "${email}"`);
      if (existingUsers.length > 0) {
        console.log("Email already exists.");
        setIsLoading(false);
        return;
      }
    
      try {
        let newUserToken = uuidv4();
    
        realm.write(() => {
          const newUser = realm.create('User', {
            _id: new BSON.ObjectId(),
            email: email,
            firstName: firstName,
            lastName: lastName,
            password: password,
            token: newUserToken,
            incomeCategories: [],
            expensesCategories: [],
            transactions: [],
          });
    
          categoriesForRegistration.forEach(categoryData => {
            const newExpenseCategory = {
              name: categoryData.name,
              isSelected: categoryData.isSelected,
              expenses: [], // This aligns with your schema expecting a list of ExpenseEntry objects
            };
            newUser.expensesCategories.push(newExpenseCategory);
          });
          
          IncomeCategories.forEach(categoryData => {
            const newIncomeCategory = {
              name: categoryData.name,
              isSelected: categoryData.isSelected,
              income: [], // This aligns with your schema expecting a list of IncomeEntry objects
            };
            newUser.incomeCategories.push(newIncomeCategory);
          });


        });
    
        try {
          await AsyncStorage.setItem('userToken', newUserToken);
          setUserToken(newUserToken);
          console.log("User registered successfully.");
        } catch (e) {
          console.error("AsyncStorage error:", e);
        } finally {
          setIsLoading(false);
        }
      } catch (e) {
        console.error("Realm error:", e);
        setIsLoading(false);
      }
    };
    
    

    const logout = () =>
    {
         setIsLoading(true);
         
         AsyncStorage.removeItem('userToken');
         setUserToken(null);

        // Implement log-off logic here
        // This might involve clearing session tokens, user data, or other sign-out procedures
        console.log('User logged off');
        
        setIsLoading(false);
    }

    const isLoggedIn = async () => {
        try {
          const token = await AsyncStorage.getItem('userToken');
          setUserToken(token); // Directly set the user token, whether it's found or null
        } catch (err) {
          console.log(`isLoggedIn error: ${err}`);
        } finally {
          setIsLoading(false); // Ensure loading is set to false here, after token check
        }
      };
      
      const resetDataForCurrentUser = async () => {
        setIsLoading(true);
        const token = await AsyncStorage.getItem('userToken');
        const users = realm.objects<User>('User').filtered(`token == "${token}"`);
        const user = users.length > 0 ? users[0] : null;
      
        if (user) {
          realm.write(() => {

            // user.incomeCategories.forEach(category => {
            //   category.isSelected = false;
            //   category.income.forEach(incomeEntry => {
            //     incomeEntry.amount = 0;
            //   });
            // });
      
            // // Reset each category's isSelected properties to false
            // // and set each expense entry's amount within each category to 0
            // user.expensesCategories.forEach(category => {
            //   category.isSelected = false;
            //   category.expenses.forEach(expenseEntry => {
            //     expenseEntry.amount = 0;
            //   });
            // });

            user.incomeCategories.forEach(category => {
              category.isSelected = false;
              while (category.income.length > 0) {
                realm.delete(category.income[0]); // Delete each income entry
              }
            });
      
            // Clear all expense entries within each expense category
            user.expensesCategories.forEach(category => {
              category.isSelected = false;
              while (category.expenses.length > 0) {
                realm.delete(category.expenses[0]); // Delete each expense entry
              }
            });
    
            // Optionally clear transactions if you want to reset those as well
            while (user.transactions.length > 0) {
              realm.delete(user.transactions[0]); // Delete each transaction
            }

          });
          console.log('User data reset successfully.');
        } else {
          console.log('User not found for data reset.');
        }
        setIsLoading(false);
      };
      
      

    useEffect(() => {
        isLoggedIn();
    }, []);

    return (
        <AuthContext.Provider value = {{login, logout, register, resetDataForCurrentUser, isLoading, userToken}}>
            {children}
        </AuthContext.Provider>
    )
};

export const useAuth = () => useContext(AuthContext);