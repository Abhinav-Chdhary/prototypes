import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AlarmProvider } from '../src/store/AlarmContext';
import { requestPermissionsAsync } from '../src/services/notificationService';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    requestPermissionsAsync();

    // Foreground notification listener
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      // When notification arrives while app is open
      const data = notification.request.content.data;
      if (data && typeof data.alarmId === 'string') {
        const taskParam = typeof data.task === 'string' ? data.task : '';
        router.push(`/alarm-active?alarmId=${data.alarmId}&task=${encodeURIComponent(taskParam)}`);
      }
    });

    // Background/Killed notification tap listener
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data && typeof data.alarmId === 'string') {
        const taskParam = typeof data.task === 'string' ? data.task : '';
        router.push(`/alarm-active?alarmId=${data.alarmId}&task=${encodeURIComponent(taskParam)}`);
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return (
    <AlarmProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="alarm-active" options={{ presentation: 'fullScreenModal', headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AlarmProvider>
  );
}
