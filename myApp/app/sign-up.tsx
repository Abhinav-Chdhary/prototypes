import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SignUpScreen() {
    const router = useRouter();

    const handleSignUp = () => {
        router.push('/create-account' as any);
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoCircle}>
                        <Image
                            source={require('@/assets/images/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>
                    <Text style={styles.logoTitle}>Mileage Tracker</Text>
                </View>

                <Text style={styles.subtitle}>Create an account to get started</Text>

                <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                    <Text style={styles.buttonText}>Sign up</Text>
                </TouchableOpacity>
            </View>

            <Image
                source={require('@/assets/images/sign_up.png')}
                style={styles.illustration}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E8F3F1', // Light teal background
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 60,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    logoText: {
        color: Colors.branding.splashBackground,
        fontSize: 32,
        fontWeight: 'bold',
    },
    logoTitle: {
        color: Colors.branding.splashBackground,
        fontSize: 18,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 16,
        color: '#4A5568',
        marginBottom: 24,
    },
    button: {
        backgroundColor: '#1E3A5F', // Dark blue button
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    footerPlaceholder: {
        width: '100%',
        paddingHorizontal: 24,
        alignItems: 'center',
        paddingTop: 40,
    },
    footerText: {
        fontSize: 14,
        color: '#4A5568',
        textAlign: 'center',
        lineHeight: 20,
    },
    logo: {
        width: 120,
        height: 120,
    },
    illustration: {
        width: '100%',
        height: 300,
    },
    footer: {
        height: 360,
        width: "100%"
    }
});
