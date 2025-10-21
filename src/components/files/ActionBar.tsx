import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface ActionBarProps {
  selectedCount: number;
  onDelete: () => void;
  colors: any;
}

const ActionBar: React.FC<ActionBarProps> = ({
  selectedCount,
  onDelete,
  colors,
}) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <View style={[styles.actionBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.selectedCount, { color: colors.text }]}>
        {selectedCount} file{selectedCount > 1 ? 's' : ''} selected
      </Text>
      <TouchableOpacity style={[styles.deleteButton, { backgroundColor: colors.error }]} onPress={onDelete}>
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    backgroundColor: tokens.colors.surface.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
  },
  selectedCount: {
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '500',
    fontSize: 16,
    color: '#083400',
  },
  deleteButton: {
    backgroundColor: '#FF4444',
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[2],
    borderRadius: tokens.radius.md,
  },
  deleteButtonText: {
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '600',
    fontSize: 14,
    color: tokens.colors.surface.white,
  },
});

export default ActionBar;
