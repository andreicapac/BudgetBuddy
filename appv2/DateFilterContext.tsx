import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useContext, useEffect } from 'react';


export const DateFilterContext = createContext(null);

export const DateFilterProvider = ({ children }) => {
  const [dateFilter, setDateFilter] = useState('');
  const [leftDrawerOpen, setLeftDrawerOpen] = React.useState(false);

  useEffect(() => {
    // Initialize dateFilter from asyncStorage when app loads
    const initDateFilter = async () => {
      const storedFilter = await AsyncStorage.getItem('dateFilter');
      if (storedFilter) {
        setDateFilter(storedFilter);
      }
    };
    initDateFilter();
  }, []);

  const updateDateFilter = async (filter) => {
    try {
      await AsyncStorage.setItem('dateFilter', filter);
      setDateFilter(filter); // This triggers re-render in consuming components
    } catch (error) {
      console.error('Failed to update the date filter', error);
    }
  };

  return (
    <DateFilterContext.Provider value={{ dateFilter, leftDrawerOpen, updateDateFilter, setLeftDrawerOpen }}>
      {children}
    </DateFilterContext.Provider>
  );
};


export const useDateFilter = () => useContext(DateFilterContext);
