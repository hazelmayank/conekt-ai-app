import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface CompanyInputProps {
  value: string;
  onChangeText: (text: string) => void;
  colors: any;
}

const CompanyInput: React.FC<CompanyInputProps> = ({ value, onChangeText, colors }) => {
  return (
    <View style={styles.section}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Company</Text>
        <Text style={styles.required}>*</Text>
      </View>
      <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
          value={value}
          onChangeText={onChangeText}
          placeholder="Enter company name"
          placeholderTextColor={colors.textSecondary}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: tokens.spacing[6],
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing[3],
  },
  label: {
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.regular,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
  },
  required: {
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.regular,
    color: '#FF0000',
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: tokens.spacing[1],
  },
  inputContainer: {
    backgroundColor: tokens.colors.surface.white,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    height: 54,
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing[3],
  },
  input: {
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.semibold,
    color: '#083400', // Fixed: Changed from placeholder color to proper text color
    fontFamily: 'Poppins_600SemiBold',
  },
});

export default CompanyInput;
