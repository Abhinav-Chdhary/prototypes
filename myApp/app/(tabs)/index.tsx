import { Colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const user = useStore((state) => state.user);
  const resetStore = useStore((state) => state.reset);
  const router = useRouter();
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Are you sure you want to logout?',
      '',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            setProfileModalVisible(false);
            resetStore();
            await AsyncStorage.clear();
            router.replace('/sign-up' as any);
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Are you sure you want to delete your account?',
      'Note that all your data will be lost permanently.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            setProfileModalVisible(false);
            resetStore();
            await AsyncStorage.clear();
            router.replace('/sign-up' as any);
          }
        }
      ]
    );
  };

  const handleSwitchProfile = () => {
    setProfileModalVisible(false);
    router.push('/choose-profile');
  };

  return (
    <LinearGradient
      colors={['#D0EAEA', '#F6F6EC']}
      style={styles.container}
    >
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.userIconPlaceholder}
            onPress={() => setProfileModalVisible(true)}
          >
            <Image
              source={require('@/assets/images/profile.png')}
              style={styles.profileImage}
            />
          </TouchableOpacity>
          <Image
            source={require('@/assets/images/logo_illustration.png')}
            style={styles.logo}
          />
          {/* Spacer */}
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Hi {user?.nickname || 'Guest'},</Text>
          <Text style={styles.subGreeting}>Track your miles towards a prosperous{`\n`}financial journey!</Text>
        </View>

        <View style={styles.emptyStateContainer}>
          <View style={styles.illustrationPlaceholder}>
            {/* Mountain/Road illustration placeholder */}
            <View style={styles.circleGraphic} >
              <Image
                source={require('@/assets/images/milestone.png')}
                style={styles.milestone}
                resizeMode="contain"
              />
            </View>
          </View>
          <Text style={styles.emptyStateText}>Add a vehicle to start tracking its{`\n`}fuelling & performance</Text>
          <TouchableOpacity style={styles.addVehicleButton}>
            <Text style={styles.addVehicleText}>Add Vehicle →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Profile Modal */}
      <Modal
        visible={isProfileModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setProfileModalVisible(false)}
        >
          <View style={styles.profileDrawer}>
            <View style={styles.drawerHeader}>
              <View style={styles.drawerUserIcon}>
                <Image
                  source={require('@/assets/images/profile.png')}
                  style={styles.drawerProfileImage}
                />
              </View>
              <Text style={styles.drawerUserName}>{user?.nickname || 'Guest'}</Text>
            </View>

            <View style={styles.drawerOptions}>
              <TouchableOpacity style={styles.drawerOptionItem} onPress={handleSwitchProfile}>
                <Ionicons name="person-outline" size={20} color="#4A5568" style={styles.drawerOptionIcon} />
                <Text style={styles.drawerOptionText}>Switch Profile</Text>
                <Ionicons name="chevron-forward" size={20} color="#A0AEC0" />
              </TouchableOpacity>

              <View style={styles.drawerDivider} />

              <TouchableOpacity style={styles.drawerOptionItem} onPress={handleDeleteAccount}>
                <Ionicons name="trash-outline" size={20} color="#4A5568" style={styles.drawerOptionIcon} />
                <Text style={styles.drawerOptionText}>Delete Account</Text>
                <Ionicons name="chevron-forward" size={20} color="#A0AEC0" />
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }} />

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>

            <View style={styles.versionContainer}>
              <Text style={styles.versionText}>Current Version: 1.0</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </LinearGradient >
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
    alignItems: 'center',
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 32,
  },
  userIconPlaceholder: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: 28,
    height: 28,
  },
  logoCircleSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTextSmall: {
    color: Colors.branding.splashBackground,
    fontSize: 16,
    fontWeight: 'bold',
  },
  greetingContainer: {
    alignItems: 'center',
    marginBottom: 64,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F56565',
    marginBottom: 8,
  },
  subGreeting: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyStateContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  illustrationPlaceholder: {
    marginBottom: 24,
  },
  circleGraphic: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#CBD5E0', // Gray placeholder
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#4A5568',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  addVehicleButton: {
    backgroundColor: '#1E3A5F',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  addVehicleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  logo: {
    width: 28,
    backgroundColor: 'transparent',
  },
  milestone: {
    width: "100%",
    height: "100%",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
  },
  profileDrawer: {
    width: '75%',
    height: '100%',
    backgroundColor: '#F8F9FA',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  drawerHeader: {
    marginBottom: 40,
  },
  drawerUserIcon: {
    marginBottom: 16,
  },
  drawerProfileImage: {
    width: 28,
    height: 28,
  },
  drawerUserName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A5F',
  },
  drawerOptions: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  drawerOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  drawerOptionIcon: {
    marginRight: 12,
  },
  drawerOptionText: {
    flex: 1,
    fontSize: 14,
    color: '#4A5568',
    fontWeight: '500',
  },
  drawerDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginLeft: 48, // Aligns with text
  },
  logoutButton: {
    backgroundColor: '#F56565',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(88, 121, 140, 1)',
    width: '100%',
  },
  versionText: {
    textAlign: 'center',
    color: '#A0AEC0',
    fontSize: 12,
  }
});
