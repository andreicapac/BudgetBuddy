import Realm from 'realm';
import {UserSchema, ExpenseCategorySchema} from './UserSchema';
import { useRealm } from '@realm/react';

// Initialize Realm with your schemas
const realm = useRealm();

export const createNewUser = (username, password, token, income, expensesCategories) => {
    try {
      realm.write(() => {
        const newUser = {
          username,
          password,
          token,
          // Ensure income has a valid number value, or use a default value (e.g., 0.0)
          income: typeof income === 'number' ? income : 0.0,
          expensesCategories,
        };
  
        console.log('Creating new user with:', newUser);
        realm.create('User', newUser);
      });
    } catch (error) {
      console.error("Realm error:", error);
    }
  };
  
