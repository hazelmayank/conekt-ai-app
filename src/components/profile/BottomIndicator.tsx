import React from 'react';
import { View, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

const BottomIndicator: React.FC = () => {
  return (
    <View style={styles.bottomIndicator} />
  );
};

const styles = StyleSheet.create({
  bottomIndicator: {
    width: 140,
    height: 5,
    backgroundColor: '#000000',
    borderRadius: 100,
    alignSelf: 'center',
    marginBottom: tokens.spacing[3],
  },
});

export default BottomIndicator;
