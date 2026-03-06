import { useStore } from '@/store/useStore';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
    const router = useRouter();
    const hasSeenOnboarding = useStore(state => state.hasSeenOnboarding);
    const passcode = useStore(state => state.passcode);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (hasSeenOnboarding && passcode) {
                router.replace('/passcode-prompt');
            } else {
                router.replace('/sign-up' as any);
            }
        }, 2000); // 2 second mock delay

        return () => clearTimeout(timer);
    }, [router, hasSeenOnboarding, passcode]);

    return (
        <LinearGradient
            colors={['#D0EAEA', '#F6F6EC']}
            style={styles.container}
        >
            <Image
                source={require('@/assets/images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: 120,
        height: 120,
    },
});
