import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '@/theme/tokens';
import { User } from '@/types/api';
import LoadingScreen from '@/components/LoadingScreen';

// Profile components
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileAvatar from '@/components/profile/ProfileAvatar';
import ActionCards from '@/components/profile/ActionCards';
import MenuList from '@/components/profile/MenuList';
import AppearanceModal from '@/components/profile/AppearanceModal';
import BottomIndicator from '@/components/profile/BottomIndicator';

// Custom hook
import { useProfile } from '@/hooks/useProfile';

const ProfileScreen: React.FC<{ navigation?: any; onLogout?: () => void; user?: User | null }> = ({ 
  navigation, 
  onLogout, 
  user: propUser 
}) => {
  const {
    // State
    state: { user, isLoading, showAppearanceModal, theme, colors, slideAnim },
    // Actions
    actions: { handleBack, handleLogout, handleMenuPress, handleThemeChange, handleCloseModal },
  } = useProfile({ navigation, onLogout, user: propUser });

  if (isLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <ProfileHeader colors={colors} onBack={handleBack} />

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Avatar Section */}
          <ProfileAvatar user={user} colors={colors} />

          {/* Action Cards */}
          <ActionCards 
            colors={colors}
            onFilesPress={() => handleMenuPress('Files')}
            onNotificationPress={() => handleMenuPress('Notification')}
          />

          {/* Menu Section */}
          <MenuList 
            colors={colors}
            onMenuPress={handleMenuPress}
            onLogout={handleLogout}
          />
        </ScrollView>

        {/* Appearance Modal */}
        <AppearanceModal
          visible={showAppearanceModal}
          colors={colors}
          theme={theme}
          slideAnim={slideAnim}
          onThemeChange={handleThemeChange}
          onClose={handleCloseModal}
        />

        {/* Bottom Navigation Indicator */}
        <BottomIndicator />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  scrollView: {
    flex: 1,
  },
});

export default ProfileScreen;
