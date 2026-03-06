import { LinearGradient } from 'expo-linear-gradient';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface GenericErrorProps {
    illustration?: ReactNode;
    title?: string;
    subtitle?: string;
    buttonText: string;
    onButtonPress: () => void;
}

export default function GenericError({
    illustration,
    title = 'Oops!',
    subtitle = 'Something went wrong.\nPlease try again later!',
    buttonText,
    onButtonPress,
}: GenericErrorProps) {
    const insets = useSafeAreaInsets();

    return (
        <LinearGradient
            colors={['#bce6e4', '#f4f0da']}
            style={[styles.container, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom + 24, 40) }]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
        >
            <View style={styles.contentContainer}>
                {illustration !== undefined ? (
                    illustration
                ) : (
                    <View style={styles.placeholderIllustration}>
                        <Text style={styles.placeholderText}>!</Text>
                    </View>
                )}
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={onButtonPress} activeOpacity={0.8}>
                <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        justifyContent: 'space-between',
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 40, // Visual offset to not feel strictly centered but a bit higher
    },
    placeholderIllustration: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#FC4B4E',
        marginBottom: 48,
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0px 4px 10px rgba(252, 75, 78, 0.3)',
        elevation: 8,
    },
    placeholderText: {
        color: '#FFFFFF',
        fontSize: 48,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 32,
        fontWeight: '600',
        color: '#0A3143',
        marginBottom: 16,
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#0A3143',
        textAlign: 'center',
        lineHeight: 24,
        opacity: 0.8,
    },
    button: {
        backgroundColor: '#0A3143',
        height: 56,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '600',
    },
});
