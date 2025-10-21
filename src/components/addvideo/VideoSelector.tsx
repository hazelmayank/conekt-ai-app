import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface VideoSelectorProps {
  selectedVideo: any;
  onSelectVideo: () => void;
  colors: any;
}

const VideoSelector: React.FC<VideoSelectorProps> = ({ selectedVideo, onSelectVideo, colors }) => {
  return (
    <View style={styles.section}>
      <Text style={[styles.label, { color: colors.text }]}>Attach Video</Text>
      <TouchableOpacity 
        style={[styles.uploadContainer, { backgroundColor: colors.surface, borderColor: colors.border }]} 
        onPress={onSelectVideo}
      >
        {selectedVideo ? (
          <View style={styles.selectedVideoCard}>
            <View style={styles.videoInfoHeader}>
              <Image 
                source={require('../../../assets/ui/upload.png')} 
                style={[styles.videoFileIcon, { tintColor: colors.success }]}
                resizeMode="contain"
              />
              <Text style={[styles.selectedVideoText, { color: colors.success }]}>✓ Video Selected</Text>
            </View>
            <Text style={[styles.selectedVideoName, { color: colors.text }]} numberOfLines={2} ellipsizeMode="middle">
              {selectedVideo.filename}
            </Text>
            <View style={styles.videoDetailsRow}>
              <Text style={[styles.selectedVideoSize, { color: colors.textSecondary }]}>
                {selectedVideo.file_size_mb ? `${selectedVideo.file_size_mb.toFixed(1)} MB` : 'Size unknown'}
              </Text>
              <Text style={[styles.selectedVideoDuration, { color: colors.textSecondary }]}>
                Duration: {Math.floor(selectedVideo.duration_sec / 60)}:{(selectedVideo.duration_sec % 60).toString().padStart(2, '0')}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.uploadPrompt}>
            <Image 
              source={require('../../../assets/ui/upload.png')} 
              style={styles.uploadIcon}
              resizeMode="contain"
            />
            <Text style={[styles.uploadText, { color: colors.textSecondary }]}>Choose from Library{'\n'}or upload new video</Text>
          </View>
        )}
      </TouchableOpacity>
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
  uploadContainer: {
    backgroundColor: tokens.colors.surface.white,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    minHeight: 120,
    maxHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    width: '100%',
    maxWidth: '100%',
  },
  uploadIcon: {
    width: 50,
    height: 50,
    marginBottom: tokens.spacing[2],
  },
  uploadText: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.regular,
    color: '#083400',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  selectedVideoCard: {
    width: '100%',
    maxWidth: '100%',
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: tokens.spacing[2],
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  videoInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing[2],
  },
  videoFileIcon: {
    width: 24,
    height: 24,
    marginRight: tokens.spacing[2],
    tintColor: '#53C920',
  },
  videoDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: tokens.spacing[1],
    width: '100%',
    flexWrap: 'wrap',
  },
  uploadPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedVideoText: {
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.semibold,
    color: '#53C920',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: tokens.spacing[1],
  },
  selectedVideoName: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.regular,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'left',
    marginBottom: tokens.spacing[1],
    flexWrap: 'wrap',
    maxWidth: '100%',
    width: '100%',
    paddingHorizontal: 0,
  },
  selectedVideoSize: {
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.regular,
    color: '#6D7E72',
    fontFamily: 'Poppins_600SemiBold',
  },
  selectedVideoDuration: {
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.regular,
    color: '#6D7E72',
    fontFamily: 'Poppins_600SemiBold',
    marginTop: 2,
  },
});

export default VideoSelector;
