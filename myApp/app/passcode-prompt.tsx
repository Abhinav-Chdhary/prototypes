import { useStore } from '@/store/useStore';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

export default function PasscodePromptScreen() {
    const router = useRouter();
    const storedPasscode = useStore((state) => state.passcode);
    const [passcode, setPasscode] = useState(['', '', '', '']);
    const [error, setError] = useState('');
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const handlePasscodeChange = (text: string, index: number) => {
        const value = text.replace(/[^0-9]/g, '');
        const newState = [...passcode];
        newState[index] = value;
        setPasscode(newState);
        setError(''); // Clear error on new input

        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }

        // Check completion
        if (newState.every(v => v !== '')) {
            const enteredCode = newState.join('');
            if (enteredCode === storedPasscode) {
                router.replace('/choose-profile');
            } else {
                setError('Incorrect OTP');
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Welcome back!</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>
                        Enter your 4-Digit Passcode <Text style={styles.required}>*</Text>
                    </Text>
                    <Text style={styles.subLabel}>Just checking it&apos;s really you!</Text>

                    <View style={styles.passcodeContainer}>
                        {passcode.map((digit, index) => (
                            <TextInput
                                key={`passcode-${index}`}
                                ref={(el) => { inputRefs.current[index] = el; }}
                                style={[styles.digitInput, error ? styles.inputError : null]}
                                maxLength={1}
                                keyboardType="numeric"
                                value={digit}
                                onChangeText={(text) => handlePasscodeChange(text, index)}
                                secureTextEntry={true} // Usually passcodes are hidden on entry
                                placeholder="x"
                                placeholderTextColor="#CBD5E0"
                                autoFocus={index === 0}
                            />
                        ))}
                    </View>
                    {error ? <Text style={styles.errorText}>⚠ {error}</Text> : null}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E8F3F1',
    },
    content: {
        paddingTop: 120, // push down as per design
        paddingHorizontal: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1E3A5F',
        marginBottom: 40,
    },
    inputGroup: {
        marginBottom: 32,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E3A5F',
        marginBottom: 4,
    },
    subLabel: {
        fontSize: 12,
        color: '#A0AEC0',
        marginBottom: 24,
    },
    required: {
        color: '#F56565',
    },
    passcodeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
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
        marginTop: 12,
    },
});
