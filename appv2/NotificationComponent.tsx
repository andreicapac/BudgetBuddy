// NotificationComponent.js
import { useEffect, useRef } from 'react';
import { useNotification } from './NotificationCenter';
import {ALERT_TYPE, Toast} from 'react-native-alert-notification'

export const NotificationComponent = () => {
    const { notification, hideNotification } = useNotification();
  
    useEffect(() => {
        if (notification) {
            console.log('Notification:', notification);

            // Show the toast notification
            Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: notification.title,
                textBody: notification.message,
                autoClose: 5000,
                onHide: () => {
                    hideNotification();
                }
            });

        };
    }, [notification]);
  
    return null; // This component does not render anything itself
  };
  