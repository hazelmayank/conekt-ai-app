import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface CycleInfoCardProps {
  selectedCycle: 'cycle1' | 'cycle2';
  startDate: string;
  calculatedPlayOrder: number | null;
  colors: any;
}

const CycleInfoCard: React.FC<CycleInfoCardProps> = ({ 
  selectedCycle, 
  startDate, 
  calculatedPlayOrder, 
  colors 
}) => {
  return (
    <View style={styles.section}>
      <Text style={[styles.label, { color: colors.text }]}>Selected Cycle</Text>
      <View style={[styles.cycleInfoContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.cycleInfoText, { color: colors.text }]}>
          {selectedCycle === 'cycle1' ? 'Cycle 1 (1st - 15th)' : 'Cycle 2 (16th - 30th)'}
        </Text>
        <Text style={[styles.cycleInfoSubtext, { color: colors.textSecondary }]}>
          Start Date: {startDate}
        </Text>
        {calculatedPlayOrder && (
          <Text style={[styles.cycleInfoSubtext, { color: colors.primary, fontWeight: 'bold' }]}>
            Play Order: {calculatedPlayOrder}/7
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: tokens.spacing[6],
  },
  label: {
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.regular,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
  },
  cycleInfoContainer: {
    backgroundColor: tokens.colors.surface.white,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[3],
  },
  cycleInfoText: {
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.semibold,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: tokens.spacing[1],
  },
  cycleInfoSubtext: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.regular,
    color: '#6D7E72',
    fontFamily: 'Poppins_600SemiBold',
  },
});

export default CycleInfoCard;
