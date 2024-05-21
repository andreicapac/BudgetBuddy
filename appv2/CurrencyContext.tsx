// CurrencyContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRealm } from '@realm/react';
import {User} from './UserSchema';

export const CurrencyContext = createContext(null);

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {
    const [currency, setCurrency] = useState('EUR');
    const realm = useRealm();

  useEffect(() => {
    const fetchCurrency = async () => {
      const storedCurrency = await AsyncStorage.getItem('currency');
      if (storedCurrency) {
        setCurrency(storedCurrency);
      }
    };

    fetchCurrency();
  }, []);

  const convertAmount = (amount, exchangeRate) => {
    return (amount * exchangeRate);
  };
  
  const fetchExchangeRate = async (fromCurrency, toCurrency) => {
    // Replace with actual API call to fetch exchange rates
    // This is a placeholder for the actual exchange rate
    const exchangeRate = fromCurrency === 'EUR' && toCurrency === 'RON' ? 5 : 0.20;
    return exchangeRate;
  };

  const updateAmountsForNewCurrency = async (currentCurrency, newCurrency) => {
    const exchangeRate = await fetchExchangeRate(currentCurrency, newCurrency);

    const token = await AsyncStorage.getItem('userToken');
    const users = realm.objects<User>('User').filtered(`token == "${token}"`);
    const user = users.length > 0 ? users[0] : null;
  
    if (!user) {
        console.error("User not found");
        return;
      }
    
      try {
        if (user) {
        // Start a write transaction to update the amounts
        realm.write(() => {
            // Update income amounts
            user.incomeCategories.forEach((category) => {
            category.income.forEach((income) => {
                income.amount = convertAmount(income.amount, exchangeRate);
            });
            });
            
            // Update expense amounts
            user.expensesCategories.forEach((category) => {
            category.expenses.forEach((expense) => {
                expense.amount = convertAmount(expense.amount, exchangeRate);
            });
            });
    
            // Update transaction amounts
            user.transactions.forEach((transaction) => {
            transaction.amount = convertAmount(transaction.amount, exchangeRate);
            });
        });
        }
    }
    catch (error) {
        console.error("Error updating amounts", error);
    }
  };



  const toggleCurrency = async () => {
    const currentCurrency = currency; // Get the current currency state
    const newCurrency = currency === 'EUR' ? 'RON' : 'EUR';
  
    await updateAmountsForNewCurrency(currentCurrency, newCurrency); // Make sure update function is awaited
  
    setCurrency(newCurrency); // Update the currency state
    await AsyncStorage.setItem('currency', newCurrency);
  
    // You could return something here to indicate success if needed
    return true;
  };

  return (
    <CurrencyContext.Provider value={{ currency, toggleCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};
