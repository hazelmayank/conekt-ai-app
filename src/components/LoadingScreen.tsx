import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '@/theme/tokens';
import { useTheme } from '@/context/ThemeContext';

const { width, height } = Dimensions.get('window');

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading..." 
}) => {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/logo.jpg')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          
          {/* Loading Indicator */}
          <View style={styles.loadingContainer}>
            <ActivityIndicator 
              size="large" 
              color={colors.primary} 
              style={styles.spinner}
            />
            <Text style={[styles.loadingText, { color: colors.text }]}>{message}</Text>
          </View>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[6],
  },
  logoContainer: {
    marginBottom: tokens.spacing[8],
    alignItems: 'center',
  },
  logo: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: tokens.radius.lg,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  spinner: {
    marginBottom: tokens.spacing[4],
  },
  loadingText: {
    fontSize: tokens.typography.sizes.lg,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
});

export default LoadingScreen;
