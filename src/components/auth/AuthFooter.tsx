import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

const AuthFooter: React.FC = () => {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        By continuing, you agree to our Terms of Service and Privacy Policy
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6D7E72',
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default AuthFooter;
