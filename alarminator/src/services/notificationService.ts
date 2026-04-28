import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Alarm } from '../types';
import { addDays, isBefore } from 'date-fns';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  } as any),
});

export const requestPermissionsAsync = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alarms', {
      name: 'Alarms',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    });
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
};

export const scheduleAlarmNotification = async (alarm: Alarm) => {
  let triggerTime = alarm.time;
  
  // If the time is in the past, schedule for tomorrow
  if (isBefore(triggerTime, new Date())) {
    triggerTime = addDays(triggerTime, 1);
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time to wake up!',
      body: alarm.label || 'Complete your task to dismiss.',
      data: { alarmId: alarm.id, task: alarm.task },
      sound: 'default', // Using default sound for now
    },
    trigger: triggerTime as any, // For Expo SDK 50+, Date works. Or we can use { type: 'date', timestamp: triggerTime.getTime() } in older versions, but Date is fine.
    identifier: alarm.id, // Use alarm ID as identifier so we can cancel it easily
  });
};

export const cancelAlarmNotification = async (alarmId: string) => {
  await Notifications.cancelScheduledNotificationAsync(alarmId);
};

export const snoozeAlarm = async (alarmId: string, minutes: number = 5) => {
  const snoozeTime = new Date();
  snoozeTime.setMinutes(snoozeTime.getMinutes() + minutes);
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Snooze is over!',
      body: 'Time to get up for real.',
      data: { alarmId: alarmId },
      sound: 'default',
    },
    trigger: snoozeTime as any,
    identifier: `${alarmId}_snooze`,
  });
};
