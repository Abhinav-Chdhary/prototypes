import { Colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ChooseProfileScreen() {
    const router = useRouter();
    const user = useStore((state) => state.user);

    const handleProfileSelect = (profileName: string) => {
        // In a real app, this would switch the active user profile in the store
        // For now, we just route them into the app
        router.replace('/(tabs)');
    };

    const handleAddUser = () => {
        Alert.alert('Add User', 'This would start the new user flow.');
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.logoContainer}>
                <Image
                    source={require('@/assets/images/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.logoTitle}>Mileage Tracker</Text>
            </View>

            <View style={styles.profilesSection}>
                <Text style={styles.title}>Who are you?</Text>

                <View style={styles.profilesGrid}>
                    {/* Row 1 */}
                    <TouchableOpacity style={styles.profileItem} onPress={() => handleProfileSelect(user?.nickname || 'Snack Muncher')}>
                        <View style={[styles.profileCircle, { backgroundColor: '#48BB78' }]}>
                            <Text style={styles.profileInitial}>{(user?.nickname || 'Snack Muncher').charAt(0).toUpperCase()}</Text>
                        </View>
                        <Text style={styles.profileName} numberOfLines={1}>{user?.nickname || 'Snack Muncher'}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.profileItem} onPress={() => handleProfileSelect('Moonlight')}>
                        <View style={[styles.profileCircle, { backgroundColor: '#ECC94B' }]}>
                            <Text style={styles.profileInitial}>M</Text>
                        </View>
                        <Text style={styles.profileName} numberOfLines={1}>Moonlight</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.profileItem} onPress={() => handleProfileSelect('Knight Rider')}>
                        <View style={[styles.profileCircle, { backgroundColor: '#805AD5' }]}>
                            <Text style={styles.profileInitial}>K</Text>
                        </View>
                        <Text style={styles.profileName} numberOfLines={1}>Knight Rider</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.profilesGridCentered}>
                    {/* Row 2 */}
                    <TouchableOpacity style={styles.profileItem} onPress={() => handleProfileSelect('Ross Geller')}>
                        <View style={[styles.profileCircle, { backgroundColor: '#F56565' }]}>
                            <Text style={styles.profileInitial}>R</Text>
                        </View>
                        <Text style={styles.profileName} numberOfLines={1}>Ross Geller</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.profileItem} onPress={handleAddUser}>
                        <View style={[styles.profileCircle, { backgroundColor: '#1E3A5F' }]}>
                            <Text style={styles.addIcon}>+</Text>
                        </View>
                        <Text style={styles.profileName} numberOfLines={1}>Add User</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E8F3F1',
    },
    content: {
        alignItems: 'center',
        paddingTop: 80,
        paddingHorizontal: 24,
        paddingBottom: 40,
        minHeight: '100%',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 80,
    },
    logo: {
        width: 120,
        height: 120,
        marginBottom: 16,
    },
    logoTitle: {
        color: Colors.branding.splashBackground,
        fontSize: 18,
        fontWeight: '600',
    },
    profilesSection: {
        width: '100%',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1E3A5F',
        marginBottom: 32,
    },
    profilesGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 24,
    },
    profilesGridCentered: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 32,
        width: '100%',
    },
    profileItem: {
        alignItems: 'center',
        width: 80,
    },
    profileImage: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: '#FFFFFF',
        marginBottom: 8,
    },
    profileCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    profileInitial: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    addIcon: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: '300',
    },
    profileName: {
        fontSize: 12,
        color: '#4A5568',
        textAlign: 'center',
    },
});
