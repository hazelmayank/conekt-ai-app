import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface CreateCampaignButtonProps {
  uploading: boolean;
  onPress: () => void;
  colors: any;
}

const CreateCampaignButton: React.FC<CreateCampaignButtonProps> = ({ uploading, onPress, colors }) => {
  return (
    <View style={[styles.uploadButtonContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
      <TouchableOpacity 
        style={[styles.uploadButton, { backgroundColor: colors.surface, borderColor: colors.primary }, uploading && styles.uploadButtonDisabled]} 
        onPress={onPress}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <Text style={[styles.uploadButtonText, { color: colors.text }]}>Create Campaign</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  uploadButtonContainer: {
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[4],
    backgroundColor: tokens.colors.surface.white,
    borderTopWidth: 1,
    borderTopColor: '#E2E2E2',
  },
  uploadButton: {
    backgroundColor: tokens.colors.surface.white,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: '#53C920',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.semibold,
    color: '#083400',
    fontFamily: 'Poppins_400Regular',
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
});

export default CreateCampaignButton;
