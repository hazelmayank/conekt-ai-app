import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface CycleSelectorProps {
  selectedCycle: 'cycle1' | 'cycle2';
  cyclePeriod: string;
  onCycleChange: (cycle: 'cycle1' | 'cycle2') => void;
  colors: any;
}

const CycleSelector: React.FC<CycleSelectorProps> = ({ 
  selectedCycle, 
  cyclePeriod, 
  onCycleChange, 
  colors 
}) => {
  return (
    <View style={styles.cycleInfo}>
      <Text style={[styles.cycleTitle, { color: colors.text }]}>
        {selectedCycle === 'cycle1' ? 'Cycle 1' : 'Cycle 2'}
      </Text>
      <View style={styles.cycleHeaderRight}>
        <Text style={[styles.cyclePeriod, { color: colors.textSecondary }]}>{cyclePeriod}</Text>
        <TouchableOpacity 
          style={styles.dropdownButton}
          onPress={() => {
            // Toggle between cycle1 and cycle2
            onCycleChange(selectedCycle === 'cycle1' ? 'cycle2' : 'cycle1');
          }}
        >
          <Text style={[styles.dropdownArrow, { color: colors.text }]}>▼</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cycleInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[2],
  },
  cycleTitle: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.semibold,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
  },
  cycleHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cyclePeriod: {
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.regular,
    color: '#083400',
    fontFamily: 'Poppins_400Regular',
    marginRight: tokens.spacing[2],
  },
  dropdownButton: {
    padding: tokens.spacing[1],
  },
  dropdownArrow: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.bold,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
  },
});

export default CycleSelector;
