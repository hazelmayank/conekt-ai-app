import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface LoadingCardProps {
  colors: any;
}

const LoadingCard: React.FC<LoadingCardProps> = ({ colors }) => {
  return (
    <View style={styles.loadingContainer}>
      <View style={[styles.loadingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
          style={styles.loadingSpinner}
        />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading campaign data...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: tokens.spacing[8],
  },
  loadingCard: {
    backgroundColor: tokens.colors.surface.white,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing[8],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tokens.colors.stroke.soft,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  loadingSpinner: {
    marginBottom: tokens.spacing[4],
  },
  loadingText: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.semibold,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
});

export default LoadingCard;
