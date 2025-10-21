import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface SecondaryButtonProps {
  text: string;
  onPress: () => void;
  disabled?: boolean;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  text,
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: 'transparent',
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: '#87EA5C',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing[4],
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#87EA5C',
    fontFamily: 'Poppins_600SemiBold',
  },
});

export default SecondaryButton;
