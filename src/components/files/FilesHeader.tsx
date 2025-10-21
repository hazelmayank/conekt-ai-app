import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';
import UploadButton from '@/components/files/UploadButton';

interface FilesHeaderProps {
  selectionMode: boolean;
  uploading: boolean;
  onBack: () => void;
  onUpload: () => void;
  colors: any;
}

const FilesHeader: React.FC<FilesHeaderProps> = ({
  selectionMode,
  uploading,
  onBack,
  onUpload,
  colors,
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Image 
          source={require('../../../assets/ui/back_icon.png')} 
          style={styles.backIcon}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <Text style={[styles.title, { color: colors.text }]}>
        {selectionMode ? 'Select Video' : 'Files'}
      </Text>
      
      {/* Upload Button */}
      {!selectionMode && (
        <UploadButton
          uploading={uploading}
          onUpload={onUpload}
          colors={colors}
          size="small"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    marginTop: tokens.spacing[2],
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing[3],
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 20,
    letterSpacing: 0,
    color: '#083400',
    textAlign: 'center',
    flex: 1,
  },
});

export default FilesHeader;
