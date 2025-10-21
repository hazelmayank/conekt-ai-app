import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface SaveButtonProps {
  onPress: () => void;
  colors: any;
}

const SaveButton: React.FC<SaveButtonProps> = ({ onPress, colors }) => {
  return (
    <View style={[styles.saveButtonContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <TouchableOpacity 
        style={[styles.saveButton, { backgroundColor: colors.surface, borderColor: colors.primary }]} 
        onPress={onPress}
      >
        <Text style={[styles.saveButtonText, { color: colors.text }]}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  saveButtonContainer: {
    backgroundColor: tokens.colors.surface.white,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.stroke.soft,
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[4],
  },
  saveButton: {
    backgroundColor: tokens.colors.surface.white,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: tokens.colors.brand.primary,
    paddingVertical: tokens.spacing[3],
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.semibold,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
  },
});

export default SaveButton;
