import { Colors } from '@/constants/theme';
import { useStore } from '@/store/useStore';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const user = useStore((state) => state.user);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.userIconPlaceholder}>
          <Text style={styles.userIconText}>👤</Text>
        </View>
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F3F1',
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
  userIconText: {
    fontSize: 20,
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
  }
});
