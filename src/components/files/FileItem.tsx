import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';
import { Video } from '@/types/api';

interface FileItemProps {
  file: Video;
  isSelected: boolean;
  onPress: () => void;
  colors: any;
  formatFileSize: (sizeInMB: number) => string;
  formatDuration: (seconds: number) => string;
  formatDate: (dateString: string | undefined | null, videoId?: string) => string;
}

const FileItem: React.FC<FileItemProps> = ({
  file,
  isSelected,
  onPress,
  colors,
  formatFileSize,
  formatDuration,
  formatDate,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.fileItem,
        { backgroundColor: colors.surface, borderColor: colors.border },
        isSelected && styles.fileItemSelected
      ]}
      onPress={onPress}
    >
      <View style={styles.fileIconContainer}>
        <Image 
          source={require('../../../assets/ui/file.png')} 
          style={styles.fileIcon}
          resizeMode="contain"
        />
      </View>
      
      <View style={styles.fileInfo}>
        <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
          {file.filename}
        </Text>
        
        <View style={styles.fileDetails}>
          <Text style={[styles.fileDetail, { color: colors.textSecondary }]}>
            {formatDuration(file.duration_sec)} • {formatFileSize(file.file_size_mb)}
          </Text>
          <Text style={[styles.fileDetail, { color: colors.textSecondary }]}>
            {file.resolution.width}x{file.resolution.height} • {file.format.toUpperCase()}
          </Text>
          <Text style={[styles.fileDate, { color: colors.textSecondary }]}>
            {formatDate(file.createdAt, file._id)}
          </Text>
        </View>
      </View>

      <View style={styles.selectionIndicator}>
        {isSelected && (
          <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]}>
            <Text style={styles.selectedText}>✓</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.surface.white,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[3],
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  fileItemSelected: {
    borderColor: tokens.colors.brand.primary,
    backgroundColor: '#F0F9E8',
  },
  fileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: tokens.radius.md,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing[3],
  },
  fileIcon: {
    width: 24,
    height: 24,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '600',
    fontSize: 16,
    color: '#083400',
    marginBottom: tokens.spacing[1],
  },
  fileDetails: {
    gap: 2,
  },
  fileDetail: {
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '400',
    fontSize: 12,
    color: '#6D7E72',
  },
  fileDate: {
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '400',
    fontSize: 12,
    color: '#6D7E72',
    marginTop: tokens.spacing[1],
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: tokens.colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '600',
    fontSize: 12,
    color: tokens.colors.surface.white,
  },
});

export default FileItem;
