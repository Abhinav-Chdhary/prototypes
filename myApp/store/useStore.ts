import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const storage = Platform.OS === 'web' ? localStorage : AsyncStorage;

const zustandStorage = createJSONStorage(() =>
    Platform.OS === 'web'
        ? {
              getItem: (key: string) => storage.getItem(key),
              setItem: (key: string, value: string) => storage.setItem(key, value),
              removeItem: (key: string) => storage.removeItem(key),
          }
        : AsyncStorage
);

interface User {
    name: string;
    nickname: string;
    email: string;
}

interface AppState {
    hasSeenOnboarding: boolean;
    user: User | null;
    passcode: string | null;

    setHasSeenOnboarding: (status: boolean) => void;
    setUserDetails: (user: User) => void;
    setPasscode: (code: string) => void;
    completeOnboarding: () => void;
    reset: () => void;
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            hasSeenOnboarding: false,
            user: null,
            passcode: null,

            setHasSeenOnboarding: (status) => set({ hasSeenOnboarding: status }),
            setUserDetails: (user) => set({ user }),
            setPasscode: (code) => set({ passcode: code }),
            completeOnboarding: () => set({ hasSeenOnboarding: true }),
            reset: () => set({ hasSeenOnboarding: false, user: null, passcode: null }),
        }),
        {
            name: 'myapp-storage',
            storage: zustandStorage,
        }
    )
);
