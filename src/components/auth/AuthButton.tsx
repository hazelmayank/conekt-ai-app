import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface AuthButtonProps {
  loading: boolean;
  mode: 'login' | 'create';
  step: 'phone' | 'otp';
  colors: any;
  onPress: () => void;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  loading,
  mode,
  step,
  colors,
  onPress,
}) => {
  const getButtonText = () => {
    if (step === 'otp') {
      return 'Verify OTP';
    }
    return mode === 'create' ? 'Create Account' : 'Send OTP';
  };

  return (
    <TouchableOpacity 
      style={[styles.button, loading && styles.buttonDisabled]} 
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={[styles.buttonText, { color: colors.text }]}>
          {getButtonText()}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#87EA5C',
    borderRadius: tokens.radius.lg,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing[4],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
  },
});

export default AuthButton;
