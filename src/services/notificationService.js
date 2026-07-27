import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from './supabaseClient';

export const initializePushNotifications = async () => {
  if (!Capacitor.isNativePlatform()) {
    // Push notifications are only available on native Android/iOS devices.
    return false;
  }

  try {
    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      // User denied push notification permissions.
      return false;
    }

    // Register with Apple / Google to receive push via APNS/FCM
    await PushNotifications.register();

    // On success, we should be able to receive notifications
    PushNotifications.addListener('registration', async (token) => {
      // Push registration success
      
      // Store the token in Supabase against the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').update({ fcm_token: token.value }).eq('id', user.id);
      }
    });

    // Some issue with our setup and push will not work
    PushNotifications.addListener('registrationError', (error) => {
      // Error on push registration
    });

    // Show us the notification payload if the app is open on our device
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      // Push received
      // Could trigger a local toast or UI update here
    });

    // Method called when tapping on a notification
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      // Push action performed
      // Could trigger deep link navigation based on notification.data payload
    });

    return true;

  } catch (error) {
    // Push notification initialization failed
    return false;
  }
};
