import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface AddVideoCardProps {
  onPress: () => void;
  colors: any;
}

const AddVideoCard: React.FC<AddVideoCardProps> = ({ onPress, colors }) => {
  return (
    <TouchableOpacity 
      style={[styles.addVideoCard, { backgroundColor: colors.surface, borderColor: colors.border }]} 
      onPress={onPress}
    >
      <View style={styles.addVideoIcon}>
        <Text style={styles.addVideoIconText}>+</Text>
      </View>
      <Text style={[styles.addVideoText, { color: colors.text }]}>Add Video</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  addVideoCard: {
    backgroundColor: tokens.colors.surface.white,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing[4],
    marginHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.stroke.soft,
  },
  addVideoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing[3],
  },
  addVideoIconText: {
    fontSize: tokens.typography.sizes.xl,
    fontWeight: tokens.typography.weights.bold,
    color: tokens.colors.text.primary,
    fontFamily: 'Poppins_600SemiBold',
  },
  addVideoText: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.semibold,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
  },
});

export default AddVideoCard;
