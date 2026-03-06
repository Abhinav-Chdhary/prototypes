import { useStore } from '@/store/useStore';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

export default function SetPasscodeScreen() {
    const router = useRouter();
    const { setPasscode, completeOnboarding } = useStore();

    const [passcode, setPasscodeState] = useState(['', '', '', '']);
    const [confirmPasscode, setConfirmPasscode] = useState(['', '', '', '']);
    const [error, setError] = useState('');

    const passcodeRefs = useRef<(TextInput | null)[]>([]);
    const confirmRefs = useRef<(TextInput | null)[]>([]);

    const handlePasscodeChange = (text: string, index: number, isConfirm = false) => {
        const value = text.replace(/[^0-9]/g, ''); // Ensure only numbers
        const newState = isConfirm ? [...confirmPasscode] : [...passcode];
        newState[index] = value;

        if (isConfirm) {
            setConfirmPasscode(newState);
            if (value && index < 3) {
                confirmRefs.current[index + 1]?.focus();
            }
        } else {
            setPasscodeState(newState);
            if (value && index < 3) {
                passcodeRefs.current[index + 1]?.focus();
            }
        }
    };

    const handleContinue = () => {
        const code = passcode.join('');
        const confirmCode = confirmPasscode.join('');

        if (code !== confirmCode) {
            setError('The passcodes don\'t match');
            return;
        }

        setPasscode(code);
        completeOnboarding();
        router.replace('/(tabs)');
    };

    const handleSkip = () => {
        completeOnboarding();
        router.replace('/(tabs)');
    };

    const isComplete = passcode.every(v => v !== '') && confirmPasscode.every(v => v !== '');

    return (
        <LinearGradient
            colors={['#D0EAEA', '#F6F6EC']}
            style={styles.container}
        >
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Set Passcode</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Enter a 4-Digit Passcode <Text style={styles.required}>*</Text></Text>
                    <Text style={styles.subLabel}>You will need to enter at every app launch</Text>
                    <View style={styles.passcodeContainer}>
                        {passcode.map((digit, index) => (
                            <TextInput
                                key={`passcode-${index}`}
                                ref={(el) => { passcodeRefs.current[index] = el; }}
                                style={[styles.digitInput, error ? styles.inputError : null]}
                                maxLength={1}
                                keyboardType="numeric"
                                value={digit}
                                onChangeText={(text) => handlePasscodeChange(text, index)}
                                secureTextEntry={false}
                                placeholder="x"
                                placeholderTextColor="#CBD5E0"
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Confirm Passcode <Text style={styles.required}>*</Text></Text>
                    <View style={styles.passcodeContainer}>
                        {confirmPasscode.map((digit, index) => (
                            <TextInput
                                key={`confirm-${index}`}
                                ref={(el) => { confirmRefs.current[index] = el; }}
                                style={[styles.digitInput, error ? styles.inputError : null]}
                                maxLength={1}
                                keyboardType="numeric"
                                value={digit}
                                onChangeText={(text) => handlePasscodeChange(text, index, true)}
                                secureTextEntry={false}
                                placeholder="x"
                                placeholderTextColor="#CBD5E0"
                            />
                        ))}
                    </View>
                    {error ? <Text style={styles.errorText}>⚠ {error}</Text> : null}
                </View>

                <TouchableOpacity
                    style={[styles.button, !isComplete ? styles.buttonDisabled : null]}
                    onPress={handleContinue}
                    disabled={!isComplete}
                >
                    <Text style={styles.buttonText}>Continue</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                    <Text style={styles.skipText}>Skip</Text>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        paddingTop: 60,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    backButton: {
        marginBottom: 20,
    },
    backArrow: {
        fontSize: 24,
        color: '#4A5568',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E3A5F',
        marginBottom: 32,
    },
    inputGroup: {
        marginBottom: 32,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E3A5F',
        marginBottom: 4,
    },
    subLabel: {
        fontSize: 12,
        color: '#A0AEC0',
        marginBottom: 16,
    },
    required: {
        color: '#F56565',
    },
    passcodeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    digitInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        width: 60,
        height: 60,
        fontSize: 24,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    inputError: {
        borderColor: '#F56565',
    },
    errorText: {
        color: '#F56565',
        fontSize: 12,
        marginTop: 8,
    },
    button: {
        backgroundColor: '#1E3A5F',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonDisabled: {
        backgroundColor: '#A0AEC0',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    skipButton: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    skipText: {
        color: '#1E3A5F',
        fontSize: 16,
        fontWeight: '600',
    },
});
