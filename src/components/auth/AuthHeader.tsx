import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface AuthHeaderProps {
  step: 'phone' | 'otp';
  mode: 'login' | 'create';
  colors: any;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ step, mode, colors }) => {
  const getSubtitle = () => {
    if (step === 'phone') {
      return mode === 'create' 
        ? 'Create your admin account' 
        : 'Login to your account';
    }
    return 'Enter the OTP sent to your phone';
  };

  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color: colors.text }]}>Welcome to Conekt</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        {getSubtitle()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: tokens.spacing[8],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: tokens.spacing[2],
  },
  subtitle: {
    fontSize: 16,
    color: '#6D7E72',
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default AuthHeader;
