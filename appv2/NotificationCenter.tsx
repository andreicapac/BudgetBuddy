// NotificationContext.js
import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext(null);

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);

  const showNotification = (title, message) => {
    setNotification({ title, message });
    console.log('Notification set:  ', { title, message });
    // Add any logic here to auto-dismiss the notification if needed
  };

  const hideNotification = () => {
    setNotification(null);
    console.log('Notification hidden');
  };

  return (
    <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};
