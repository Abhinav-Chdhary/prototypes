import { useStore } from '@/store/useStore';
import { Redirect } from 'expo-router';

export default function Index() {
    const hasSeenOnboarding = useStore((state) => state.hasSeenOnboarding);

    if (hasSeenOnboarding) {
        return <Redirect href="/(tabs)" />;
    }

    return <Redirect href="/splash" />;
}
