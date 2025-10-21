import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface SlotsIndicatorProps {
  availableSlots: number;
  isFullyBooked: boolean;
}

const SlotsIndicator: React.FC<SlotsIndicatorProps> = ({ availableSlots, isFullyBooked }) => {
  return (
    <View style={styles.slotsContainer}>
      <Text style={[
        styles.slotsAvailable, 
        { color: isFullyBooked ? '#A92C0C' : '#3CA90C' }
      ]}>
        {availableSlots} Slots Available
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  slotsContainer: {
    paddingHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[4],
  },
  slotsAvailable: {
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.semibold,
    color: '#3CA90C',
    fontFamily: 'Poppins_600SemiBold',
  },
});

export default SlotsIndicator;
