import GenericError from '@/components/shared/GenericError';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function DemoErrorScreen() {
    // You can pass ?type=restart to show the restart version
    const { type } = useLocalSearchParams();
    const isRestart = type === 'restart';

    return (
        <GenericError
            buttonText={isRestart ? "Restart App" : "Go Back"}
            onButtonPress={() => {
                if (isRestart) {
                    // Logic to restart app (e.g. navigation to home/splash)
                    router.replace('/splash');
                } else {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.replace('/');
                    }
                }
            }}
        />
    );
}
