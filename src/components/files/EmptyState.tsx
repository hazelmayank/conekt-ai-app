import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';
import UploadButton from './UploadButton';

interface EmptyStateProps {
  uploading: boolean;
  onUpload: () => void;
  colors: any;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  uploading,
  onUpload,
  colors,
}) => {
  return (
    <View style={styles.emptyState}>
      <Image 
        source={require('../../../assets/ui/file.png')} 
        style={[styles.emptyIcon, { tintColor: colors.textSecondary }]}
        resizeMode="contain"
      />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Videos</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Tap the upload button to add videos from your device
      </Text>
      
      {/* Upload Button in Empty State */}
      <UploadButton
        uploading={uploading}
        onUpload={onUpload}
        colors={colors}
        size="large"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: tokens.spacing[8],
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: tokens.spacing[4],
    opacity: 0.5,
  },
  emptyTitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '600',
    fontSize: 18,
    color: '#083400',
    marginBottom: tokens.spacing[2],
  },
  emptySubtitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '400',
    fontSize: 14,
    color: '#6D7E72',
    textAlign: 'center',
    marginBottom: tokens.spacing[6],
  },
});

export default EmptyState;
