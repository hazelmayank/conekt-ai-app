import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface PackageTypeSelectorProps {
  packageType: 'half_month' | 'full_month';
  onPackageTypeChange: (type: 'half_month' | 'full_month') => void;
  colors: any;
}

const PackageTypeSelector: React.FC<PackageTypeSelectorProps> = ({ 
  packageType, 
  onPackageTypeChange, 
  colors 
}) => {
  return (
    <View style={styles.section}>
      <Text style={[styles.label, { color: colors.text }]}>Package Type</Text>
      <View style={styles.packageContainer}>
        <TouchableOpacity 
          style={[
            styles.packageOption, 
            { backgroundColor: colors.surface, borderColor: colors.border },
            packageType === 'half_month' && styles.packageOptionSelected
          ]}
          onPress={() => onPackageTypeChange('half_month')}
        >
          <Text style={[
            styles.packageText,
            { color: colors.text },
            packageType === 'half_month' && styles.packageTextSelected
          ]}>
            Half Month (15 days)
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.packageOption, 
            { backgroundColor: colors.surface, borderColor: colors.border },
            packageType === 'full_month' && styles.packageOptionSelected
          ]}
          onPress={() => onPackageTypeChange('full_month')}
        >
          <Text style={[
            styles.packageText,
            { color: colors.text },
            packageType === 'full_month' && styles.packageTextSelected
          ]}>
            Full Month (30 days)
          </Text>
        </TouchableOpacity>
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
  packageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  packageOption: {
    flex: 1,
    backgroundColor: tokens.colors.surface.white,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[3],
    marginRight: tokens.spacing[2],
    alignItems: 'center',
  },
  packageOptionSelected: {
    borderColor: '#53C920',
    backgroundColor: '#F0F9E8',
  },
  packageText: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.regular,
    color: '#6D7E72',
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
  packageTextSelected: {
    color: '#083400',
    fontWeight: tokens.typography.weights.semibold,
  },
});

export default PackageTypeSelector;
