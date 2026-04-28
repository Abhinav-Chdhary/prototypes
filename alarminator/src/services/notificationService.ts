import { Platform, Alert } from 'react-native';
import { Alarm } from '../types';
import { addDays, isBefore } from 'date-fns';
import { router } from 'expo-router';

// MOCKING expo-notifications for Expo Go compatibility in SDK 53+
// Real push notifications require a development build (`npx expo run:android` / `npx expo run:ios`)
const activeTimers: Record<string, NodeJS.Timeout> = {};

export const requestPermissionsAsync = async () => {
  console.log('[Mock] Requested notification permissions.');
  return true;
};

export const scheduleAlarmNotification = async (alarm: Alarm) => {
  let triggerTime = alarm.time;
  if (isBefore(triggerTime, new Date())) {
    triggerTime = addDays(triggerTime, 1);
  }

  const delay = triggerTime.getTime() - Date.now();
  console.log(`[Mock] Alarm scheduled in ${Math.round(delay / 1000)} seconds.`);

  if (activeTimers[alarm.id]) clearTimeout(activeTimers[alarm.id]);
  
  // Only works if app is foregrounded!
  activeTimers[alarm.id] = setTimeout(() => {
    router.push(`/alarm-active?alarmId=${alarm.id}&task=${encodeURIComponent(alarm.task || '')}`);
  }, delay);
};

export const cancelAlarmNotification = async (alarmId: string) => {
  console.log(`[Mock] Alarm ${alarmId} cancelled.`);
  if (activeTimers[alarmId]) {
    clearTimeout(activeTimers[alarmId]);
    delete activeTimers[alarmId];
  }
};

export const snoozeAlarm = async (alarmId: string, minutes: number = 5) => {
  console.log(`[Mock] Alarm ${alarmId} snoozed for ${minutes} minutes.`);
  const delay = minutes * 60 * 1000;

  if (activeTimers[alarmId]) clearTimeout(activeTimers[alarmId]);

  activeTimers[alarmId] = setTimeout(() => {
    router.push(`/alarm-active?alarmId=${alarmId}&task=SnoozeEnded`);
  }, delay);
};
