import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface EmptyStateProps {
  onAddTruck: () => void;
  colors: any;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onAddTruck, colors }) => {
  return (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No trucks found for this city</Text>
      <TouchableOpacity style={styles.emptyStateButton} onPress={onAddTruck}>
        <Text style={[styles.emptyStateButtonText, { color: colors.text }]}>Add Your First Truck</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingVertical: tokens.spacing[8] 
  },
  emptyStateText: { 
    fontSize: 16, 
    color: '#6D7E72', 
    fontFamily: 'Poppins_400Regular', 
    marginBottom: tokens.spacing[4] 
  },
  emptyStateButton: {
    backgroundColor: '#87EA5C',
    borderRadius: tokens.radius.lg,
    paddingHorizontal: tokens.spacing[6],
    paddingVertical: tokens.spacing[3],
  },
  emptyStateButtonText: { 
    fontSize: 16, 
    fontFamily: 'Poppins_600SemiBold', 
    color: '#083400' 
  },
});

export default EmptyState;
