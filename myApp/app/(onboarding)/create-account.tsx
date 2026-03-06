import { useStore } from '@/store/useStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

export default function CreateAccountScreen() {
    const router = useRouter();
    const setUserDetails = useStore((state) => state.setUserDetails);

    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    const [email, setEmail] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);

    // Basic Validation States
    const [nameError, setNameError] = useState('');
    const [nicknameError, setNicknameError] = useState('');
    const [emailError, setEmailError] = useState('');

    const validate = () => {
        let isValid = true;

        if (name.includes('!') || name.includes('1') || name.includes('&') || name.includes('#')) {
            setNameError('You cannot include symbols or numbers');
            isValid = false;
        } else {
            setNameError('');
        }

        if (nickname.includes('!') || nickname.includes('1') || nickname.includes('&') || nickname.includes('#')) {
            setNicknameError('You cannot include symbols or numbers');
            isValid = false;
        } else {
            setNicknameError('');
        }

        if (email.length > 0 && !email.includes('@')) {
            setEmailError('Invalid email');
            isValid = false;
        } else {
            setEmailError('');
        }

        if (!name || !nickname || !email || !termsAccepted) {
            isValid = false;
        }

        return isValid;
    };

    const handleContinue = () => {
        if (validate()) {
            setUserDetails({ name, nickname, email });
            router.push('/set-passcode');
        }
    };

    return (
        <LinearGradient
            colors={['#D0EAEA', '#F6F6EC']}
            style={styles.container}
        >
            <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Create Account</Text>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Name<Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={[styles.input, nameError ? styles.inputError : null]}
                        value={name}
                        onChangeText={(text) => {
                            setName(text);
                            if (nameError) setNameError('');
                        }}
                        placeholder="E.g. Shubham Chakraborty"
                        placeholderTextColor="#A0AEC0"
                    />
                    {nameError ? <Text style={styles.errorText}>⚠ {nameError}</Text> : null}
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nickname</Text>
                    <TextInput
                        style={[styles.input, nicknameError ? styles.inputError : null]}
                        value={nickname}
                        onChangeText={(text) => {
                            setNickname(text);
                            if (nicknameError) setNicknameError('');
                        }}
                        placeholder="E.g. Snack Muncher"
                        placeholderTextColor="#A0AEC0"
                    />
                    {nicknameError ? <Text style={styles.errorText}>⚠ {nicknameError}</Text> : null}
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Email Address<Text style={styles.required}>*</Text></Text>
                    <TextInput
                        style={[styles.input, emailError ? styles.inputError : null]}
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            if (emailError) setEmailError('');
                        }}
                        placeholder="E.g. ouyang@gmail.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor="#A0AEC0"
                    />
                    {emailError ? <Text style={styles.errorText}>⚠ {emailError}</Text> : null}
                </View>

                <View style={styles.checkboxContainer}>
                    <Switch
                        value={termsAccepted}
                        onValueChange={setTermsAccepted}
                        trackColor={{ false: "#CBD5E0", true: "#F56565" }}
                        thumbColor={"#f4f3f4"}
                    />
                    <Text style={styles.checkboxText}>
                        Tick this box to confirm you are at least 18 years old and agree to our <Text style={styles.linkText}>terms & conditions</Text>
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.button, (!name || !nickname || !email || !termsAccepted) ? styles.buttonDisabled : null]}
                    onPress={handleContinue}
                    disabled={!name || !nickname || !email || !termsAccepted}
                >
                    <Text style={styles.buttonText}>Continue</Text>
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
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E3A5F',
        marginBottom: 8,
    },
    required: {
        color: '#F56565',
    },
    input: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    inputError: {
        borderColor: '#F56565',
    },
    errorText: {
        color: '#F56565',
        fontSize: 12,
        marginTop: 4,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 32,
        paddingRight: 16,
    },
    checkboxText: {
        marginLeft: 12,
        fontSize: 12,
        color: '#4A5568',
        lineHeight: 18,
    },
    linkText: {
        color: '#F56565',
    },
    button: {
        backgroundColor: '#1E3A5F',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#A0AEC0',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});
