import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface SwitchModeButtonProps {
  mode: 'login' | 'create';
  colors: any;
  onPress: () => void;
  disabled?: boolean;
}

const SwitchModeButton: React.FC<SwitchModeButtonProps> = ({
  mode,
  colors,
  onPress,
  disabled = false,
}) => {
  const getButtonText = () => {
    return mode === 'create' 
      ? 'Already have an account? Login' 
      : 'Don\'t have an account? Create one';
  };

  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
        {getButtonText()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    paddingVertical: tokens.spacing[3],
  },
  buttonText: {
    fontSize: 16,
    color: '#6D7E72',
    fontFamily: 'Poppins_600SemiBold',
    textDecorationLine: 'underline',
  },
});

export default SwitchModeButton;
