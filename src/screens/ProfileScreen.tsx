import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '../theme/tokens';
import { apiService } from '../services/apiService';
import { User } from '../types/api';
import LoadingScreen from '../components/LoadingScreen';
import { useTheme } from '../context/ThemeContext';
import { useAlert } from '../context/AlertContext';

const { width, height } = Dimensions.get('window');

const ProfileScreen: React.FC<{ navigation?: any; onLogout?: () => void; user?: User | null }> = ({ 
  navigation, 
  onLogout, 
  user: propUser 
}) => {
  const { theme, colors, setTheme, isDark } = useTheme();
  const { showAlert } = useAlert();
  const [user, setUser] = useState<User | null>(propUser || null);
  const [isLoading, setIsLoading] = useState(!propUser);
  const [showAppearanceModal, setShowAppearanceModal] = useState(false);
  const slideAnim = useRef(new Animated.Value(height)).current;

  useEffect(() => {
    if (!propUser) {
      loadUserProfile();
    }
  }, [propUser]);

  useEffect(() => {
    if (!showAppearanceModal) {
      // Reset animation value when modal is closed
      slideAnim.setValue(height);
    }
  }, [showAppearanceModal, slideAnim, height]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      
      // Get user from stored data
      const userData = await apiService.getStoredUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation?.goBack();
  };

  const handleLogout = () => {
    showAlert({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      type: 'warning',
      buttons: [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.logout();
              onLogout?.();
            } catch (error) {
              console.error('Error logging out:', error);
              showAlert({
                message: 'Failed to logout',
                type: 'error',
                title: 'Error'
              });
            }
          },
        },
      ],
    });
  };

  const handleMenuPress = (menuItem: string) => {
    console.log(`Pressed: ${menuItem}`);
    
    if (menuItem === 'Files') {
      // Navigate to FilesScreen
      navigation?.navigate?.('FilesScreen') || console.log('Navigation not available');
    } else if (menuItem === 'Appearance') {
      setShowAppearanceModal(true);
      // Animate modal sliding up from bottom
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Handle other menu items
      showAlert({
        message: `${menuItem} feature will be available soon!`,
        type: 'info',
        title: 'Coming Soon'
      });
    }
  };

  const handleThemeChange = (selectedTheme: 'device' | 'light' | 'dark') => {
    setTheme(selectedTheme);
    // Animate modal sliding down
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowAppearanceModal(false);
    });
  };

  const handleCloseModal = () => {
    // Animate modal sliding down
    Animated.timing(slideAnim, {
      toValue: height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowAppearanceModal(false);
    });
  };

  if (isLoading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image 
              source={require('../../assets/ui/back_icon.png')} 
              style={styles.backIcon} 
              resizeMode="contain" 
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Profile Avatar Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <Image 
                source={require('../../assets/avatar/image.png')} 
                style={styles.avatar}
                resizeMode="cover"
              />
              <View style={styles.editIconContainer}>
                <Text style={styles.editIcon}>✎</Text>
              </View>
            </View>
            
            <View style={styles.greetingContainer}>
              <Text style={[styles.greeting, { color: colors.text }]}>Hi 👋, {user?.name || 'User'}</Text>
            </View>
          </View>

          {/* Action Cards */}
          <View style={styles.cardsContainer}>
            {/* Files Card */}
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.surface }]} onPress={() => handleMenuPress('Files')}>
              <View style={styles.cardContent}>
                <Image 
                  source={require('../../assets/ui/file.png')} 
                  style={styles.cardIcon}
                  resizeMode="contain"
                />
                <Text style={[styles.cardText, { color: colors.text }]}>Files</Text>
              </View>
            </TouchableOpacity>

            {/* Notification Card */}
            <TouchableOpacity style={[styles.actionCard, { backgroundColor: colors.surface }]} onPress={() => handleMenuPress('Notification')}>
              <View style={styles.cardContent}>
                <Image 
                  source={require('../../assets/ui/notification.png')} 
                  style={styles.cardIcon}
                  resizeMode="contain"
                />
                <Text style={[styles.cardText, { color: colors.text }]}>Notification</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Menu Section */}
          <View style={styles.menuSection}>
            <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('Help & Support')}>
                <Text style={[styles.menuText, { color: colors.text }]}>Help & Support</Text>
                <Text style={[styles.arrowIcon, { color: colors.text }]}>›</Text>
              </TouchableOpacity>
              
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
              
              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('Payment Management')}>
                <Text style={[styles.menuText, { color: colors.text }]}>Payment Management</Text>
                <Text style={[styles.arrowIcon, { color: colors.text }]}>›</Text>
              </TouchableOpacity>
              
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
              
              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('General Info')}>
                <Text style={[styles.menuText, { color: colors.text }]}>General Info</Text>
                <Text style={[styles.arrowIcon, { color: colors.text }]}>›</Text>
              </TouchableOpacity>
              
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
              
              <TouchableOpacity style={styles.menuItem} onPress={() => handleMenuPress('Appearance')}>
                <Text style={[styles.menuText, { color: colors.text }]}>Appearance</Text>
                <Text style={[styles.arrowIcon, { color: colors.text }]}>›</Text>
              </TouchableOpacity>
              
              <View style={[styles.separator, { backgroundColor: colors.border }]} />
              
              {/* Logout */}
              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <Text style={[styles.menuText, styles.logoutText, { color: colors.error }]}>Logout</Text>
                <Text style={[styles.arrowIcon, { color: colors.text }]}>›</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Appearance Modal */}
        {showAppearanceModal && (
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={handleCloseModal}
          >
            <TouchableOpacity 
              activeOpacity={1}
              onPress={() => {}} // Prevent closing when tapping the modal itself
            >
              <Animated.View style={[
                styles.appearanceModal,
                { backgroundColor: colors.surface, transform: [{ translateY: slideAnim }] }
              ]}>
                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Appearance</Text>
                  <TouchableOpacity 
                    style={styles.closeButton}
                    onPress={handleCloseModal}
                  >
                    <Image 
                      source={require('../../assets/ui/cross_icon.png')} 
                      style={styles.closeButtonIcon}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.themeOptions}>
                  <TouchableOpacity 
                    style={styles.themeOption}
                    onPress={() => handleThemeChange('device')}
                  >
                    <View style={styles.radioContainer}>
                      <View style={[
                        styles.radioCircle,
                        { borderColor: colors.border },
                        theme === 'device' && styles.radioCircleSelected
                      ]}>
                        {theme === 'device' && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                      </View>
                      <Text style={[styles.themeOptionText, { color: colors.text }]}>Same as device</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.themeOption}
                    onPress={() => handleThemeChange('light')}
                  >
                    <View style={styles.radioContainer}>
                      <View style={[
                        styles.radioCircle,
                        { borderColor: colors.border },
                        theme === 'light' && styles.radioCircleSelected
                      ]}>
                        {theme === 'light' && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                      </View>
                      <Text style={[styles.themeOptionText, { color: colors.text }]}>Light</Text>
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.themeOption}
                    onPress={() => handleThemeChange('dark')}
                  >
                    <View style={styles.radioContainer}>
                      <View style={[
                        styles.radioCircle,
                        { borderColor: colors.border },
                        theme === 'dark' && styles.radioCircleSelected
                      ]}>
                        {theme === 'dark' && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                      </View>
                      <Text style={[styles.themeOptionText, { color: colors.text }]}>Dark</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </TouchableOpacity>
        )}

        {/* Bottom Navigation Indicator */}
        <View style={styles.bottomIndicator} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    marginTop: tokens.spacing[2],
    position: 'relative',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#87EA5C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing[3],
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
    position: 'absolute',
    left: '50%',
    marginLeft: -32, // Half of title width to center it
    top: '50%',
    marginTop: -15, // Half of title height to center it vertically
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: tokens.spacing[6],
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: tokens.spacing[4],
  },
  avatar: {
    width: 88,
    height: 80,
    borderRadius: 44,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#53C920',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[6],
    gap: tokens.spacing[4],
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    height: 120,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardIcon: {
    width: 60,
    height: 60,
    marginBottom: tokens.spacing[3],
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Poppins_600SemiBold',
  },
  menuSection: {
    paddingHorizontal: tokens.spacing[4],
    paddingBottom: tokens.spacing[6],
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: tokens.radius.lg,
    paddingVertical: tokens.spacing[2],
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
  },
  menuText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
  },
  arrowIcon: {
    fontSize: 18,
    color: '#083400',
    fontWeight: 'bold',
  },
  logoutText: {
    color: '#FF5A5A',
  },
  separator: {
    height: 1,
    backgroundColor: '#E2E2E2',
    marginHorizontal: tokens.spacing[2],
    marginVertical: tokens.spacing[1],
  },
  bottomIndicator: {
    width: 140,
    height: 5,
    backgroundColor: '#000000',
    borderRadius: 100,
    alignSelf: 'center',
    marginBottom: tokens.spacing[3],
  },

  // Appearance Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(68, 68, 68, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  appearanceModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    width: width,
    maxHeight: height * 0.4,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderTopWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#083400',
    fontFamily: 'Inter_700Bold',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonIcon: {
    width: 20,
    height: 20,
  },
  themeOptions: {
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[4],
  },
  themeOption: {
    paddingVertical: tokens.spacing[3],
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#083400',
    marginRight: tokens.spacing[3],
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#083400',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#083400',
  },
  themeOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#083400',
    fontFamily: 'Poppins_500Medium',
  },
});

export default ProfileScreen;
