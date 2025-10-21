import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface SkipAuthButtonProps {
  colors: any;
  onPress: () => void;
}

const SkipAuthButton: React.FC<SkipAuthButtonProps> = ({ colors, onPress }) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>Don't have a verified number?</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={onPress}
      >
        <Text style={[styles.buttonText, { color: colors.text }]}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: tokens.spacing[4],
    marginBottom: tokens.spacing[2],
  },
  hint: {
    fontSize: 14,
    color: '#6D7E72',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: tokens.spacing[2],
  },
  button: {
    backgroundColor: 'transparent',
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: '#87EA5C',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[6],
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#87EA5C',
    fontFamily: 'Poppins_600SemiBold',
  },
});

export default SkipAuthButton;
