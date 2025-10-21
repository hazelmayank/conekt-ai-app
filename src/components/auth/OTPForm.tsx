import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface OTPFormProps {
  otp: string;
  colors: any;
  onOtpChange: (otp: string) => void;
  onVerifyOTP: () => void;
}

const OTPForm: React.FC<OTPFormProps> = ({
  otp,
  colors,
  onOtpChange,
  onVerifyOTP,
}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.label, { color: colors.text }]}>OTP Code</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        placeholder="Enter 6-digit OTP"
        placeholderTextColor={colors.textSecondary}
        value={otp}
        onChangeText={(text) => {
          console.log('OTP Input changed:', text);
          onOtpChange(text);
        }}
        keyboardType="number-pad"
        maxLength={6}
        editable={true}
        autoFocus={true}
        selectTextOnFocus={true}
        returnKeyType="done"
        onSubmitEditing={onVerifyOTP}
      />
      <Text style={[styles.helpText, { color: colors.textSecondary }]}>
        Check your SMS for the verification code
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: tokens.spacing[6],
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: tokens.spacing[2],
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    height: 56,
    paddingHorizontal: tokens.spacing[4],
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
    textAlign: 'center', // Center the text for better UX
    letterSpacing: 2, // Add spacing between digits for better readability
  },
  helpText: {
    fontSize: 12,
    color: '#6D7E72',
    fontFamily: 'Poppins_600SemiBold',
    marginTop: tokens.spacing[2],
    textAlign: 'center',
  },
});

export default OTPForm;
