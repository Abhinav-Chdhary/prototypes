import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm } from '../types';
import uuid from 'react-native-uuid';
import { scheduleAlarmNotification, cancelAlarmNotification } from './notificationService';

const ALARMS_STORAGE_KEY = '@alarminator_alarms';

export const getAlarms = async (): Promise<Alarm[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(ALARMS_STORAGE_KEY);
    if (jsonValue != null) {
      const parsedAlarms = JSON.parse(jsonValue);
      // Revive Date objects
      return parsedAlarms.map((a: any) => ({
        ...a,
        time: new Date(a.time),
      }));
    }
    return [];
  } catch (e) {
    console.error('Error reading alarms', e);
    return [];
  }
};

export const saveAlarms = async (alarms: Alarm[]) => {
  try {
    const jsonValue = JSON.stringify(alarms);
    await AsyncStorage.setItem(ALARMS_STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving alarms', e);
  }
};

export const addAlarm = async (time: Date, label: string = 'Alarm', task: string = 'math'): Promise<Alarm> => {
  const alarms = await getAlarms();
  const newAlarm: Alarm = {
    id: uuid.v4().toString(),
    time,
    isEnabled: true,
    label,
    task,
  };
  alarms.push(newAlarm);
  await saveAlarms(alarms);
  await scheduleAlarmNotification(newAlarm);
  return newAlarm;
};

export const updateAlarm = async (updatedAlarm: Alarm): Promise<Alarm[]> => {
  const alarms = await getAlarms();
  const index = alarms.findIndex(a => a.id === updatedAlarm.id);
  if (index > -1) {
    alarms[index] = updatedAlarm;
    await saveAlarms(alarms);
    
    // Reschedule
    await cancelAlarmNotification(updatedAlarm.id);
    if (updatedAlarm.isEnabled) {
      await scheduleAlarmNotification(updatedAlarm);
    }
  }
  return alarms;
};

export const deleteAlarm = async (id: string): Promise<Alarm[]> => {
  const alarms = await getAlarms();
  const filtered = alarms.filter(a => a.id !== id);
  await saveAlarms(filtered);
  await cancelAlarmNotification(id);
  return filtered;
};

export const toggleAlarm = async (id: string, isEnabled: boolean): Promise<Alarm[]> => {
  const alarms = await getAlarms();
  const index = alarms.findIndex(a => a.id === id);
  if (index > -1) {
    alarms[index].isEnabled = isEnabled;
    await saveAlarms(alarms);
    
    if (isEnabled) {
      await scheduleAlarmNotification(alarms[index]);
    } else {
      await cancelAlarmNotification(id);
    }
  }
  return alarms;
};
