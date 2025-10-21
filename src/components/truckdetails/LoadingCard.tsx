import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

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
    paddingVertical: 40,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
    textAlign: 'center',
  },
});

export default LoadingCard;
