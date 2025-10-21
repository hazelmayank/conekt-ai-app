import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface ResendButtonProps {
  colors: any;
  onPress: () => void;
  disabled?: boolean;
}

const ResendButton: React.FC<ResendButtonProps> = ({
  colors,
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, { color: colors.text }]}>Resend OTP</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    paddingVertical: tokens.spacing[2],
  },
  buttonText: {
    fontSize: 14,
    color: '#87EA5C',
    fontFamily: 'Poppins_600SemiBold',
    textDecorationLine: 'underline',
  },
});

export default ResendButton;
