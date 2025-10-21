import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface PhoneFormProps {
  phone: string;
  name: string;
  mode: 'login' | 'create';
  colors: any;
  onPhoneChange: (phone: string) => void;
  onNameChange: (name: string) => void;
}

const PhoneForm: React.FC<PhoneFormProps> = ({
  phone,
  name,
  mode,
  colors,
  onPhoneChange,
  onNameChange,
}) => {
  return (
    <>
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          placeholder="1234567890"
          placeholderTextColor={colors.textSecondary}
          value={phone}
          onChangeText={onPhoneChange}
          keyboardType="phone-pad"
          autoComplete="tel"
        />
      </View>

      {mode === 'create' && (
        <View style={styles.inputContainer}>
          <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="Enter your full name"
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={onNameChange}
            autoComplete="name"
          />
        </View>
      )}
    </>
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
  },
});

export default PhoneForm;
