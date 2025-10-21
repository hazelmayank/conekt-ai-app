import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface EmptyStateProps {
  colors: any;
}

const EmptyState: React.FC<EmptyStateProps> = ({ colors }) => {
  return (
    <View style={styles.emptyState}>
      <Text style={[styles.emptyStateText, { color: colors.text }]}>
        No campaigns found for this cycle
      </Text>
      <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
        Tap "Add Video" to create your first campaign
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[8],
  },
  emptyStateText: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.semibold,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    marginBottom: tokens.spacing[2],
  },
  emptyStateSubtext: {
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.regular,
    color: '#083400',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
  },
});

export default EmptyState;
