import { useState, useEffect, useRef } from 'react';
import { Dimensions, Animated } from 'react-native';
import { apiService } from '@/services/apiService';
import { User } from '@/types/api';
import { useTheme } from '@/context/ThemeContext';
import { useAlert } from '@/context/AlertContext';

const { height } = Dimensions.get('window');

interface UseProfileProps {
  navigation?: any;
  onLogout?: () => void;
  user?: User | null;
}

export const useProfile = ({ navigation, onLogout, user: propUser }: UseProfileProps) => {
  const { theme, colors, setTheme } = useTheme();
  const { showAlert } = useAlert();
  
  // State
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
  }, [showAppearanceModal, slideAnim]);

  // Actions
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

  return {
    // State
    state: {
      user,
      isLoading,
      showAppearanceModal,
      theme,
      colors,
      slideAnim,
    },
    // Actions
    actions: {
      handleBack,
      handleLogout,
      handleMenuPress,
      handleThemeChange,
      handleCloseModal,
    },
  };
};
