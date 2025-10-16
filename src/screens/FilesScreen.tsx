import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '../theme/tokens';
import { useTheme } from '../context/ThemeContext';
import { videosService } from '../services/services';
import { useAlert } from '../context/AlertContext';
import { Video } from '../types/api';
import LoadingScreen from '../components/LoadingScreen';

interface FilesScreenProps {
  navigation?: any;
  onVideoSelected?: (video: Video) => void;
  selectionMode?: boolean;
}

const FilesScreen: React.FC<FilesScreenProps> = ({ navigation, onVideoSelected, selectionMode = false }) => {
  const { colors, isDark } = useTheme();
  const { showAlert } = useAlert();
  const [files, setFiles] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async (forceRefresh = false) => {
    try {
      setLoading(true);
      console.log('🔄 Loading files...', forceRefresh ? '(force refresh)' : '');
      
      const response = await videosService.getAllVideos(1, 20, undefined, forceRefresh);
      console.log('Videos API response:', response);
      
      if (response && response.videos && Array.isArray(response.videos)) {
        setFiles(response.videos);
        console.log('✅ Loaded videos:', response.videos.length);
        
        // Debug: Check the structure of the first video
        if (response.videos.length > 0) {
          console.log('📋 First video structure:', Object.keys(response.videos[0]));
          console.log('📅 First video date fields:', {
            createdAt: response.videos[0].createdAt,
            created_at: response.videos[0].created_at,
            uploadDate: response.videos[0].uploadDate,
            upload_date: response.videos[0].upload_date,
            date: response.videos[0].date,
            timestamp: response.videos[0].timestamp
          });
          
          // Debug: Test ObjectId date extraction
          const firstVideo = response.videos[0];
          if (firstVideo._id && firstVideo._id.length === 24) {
            try {
              const timestampHex = firstVideo._id.substring(0, 8);
              const timestamp = parseInt(timestampHex, 16) * 1000;
              const date = new Date(timestamp);
              console.log('🔍 ObjectId date extraction test:', {
                videoId: firstVideo._id,
                timestampHex,
                timestamp,
                extractedDate: date.toISOString(),
                formatted: date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              });
            } catch (error) {
              console.log('❌ ObjectId date extraction failed:', error);
            }
          }
        }
      } else {
        console.log('⚠️ No videos found in response');
        setFiles([]);
      }
    } catch (error) {
      console.error('Error loading files:', error);
      showAlert({
        message: 'Failed to load files. Please try again.',
        type: 'error',
        title: 'Error'
      });
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation?.goBack();
  };

const handleUploadVideo = async () => {
  try {
    // Request permissions and pick video file
    const result = await DocumentPicker.getDocumentAsync({
      type: 'video/*',
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) {
      console.log('Video selection cancelled');
      return;
    }

    const videoFile = result.assets[0];
    console.log('Selected video:', videoFile);

    // Validate file size (max 100MB)
    const maxSizeMB = 100;
    const fileSizeMB = videoFile.size ? videoFile.size / (1024 * 1024) : 0;
    
    if (fileSizeMB > maxSizeMB) {
      showAlert({
        message: `Video size (${fileSizeMB.toFixed(1)}MB) exceeds maximum allowed size of ${maxSizeMB}MB`,
        type: 'error',
        title: 'File Too Large'
      });
      return;
    }

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/mkv'];
    if (videoFile.mimeType && !allowedTypes.includes(videoFile.mimeType)) {
      showAlert({
        message: 'Please select a valid video file (MP4, MOV, AVI, MKV)',
        type: 'error',
        title: 'Invalid File Type'
      });
      return;
    }

    setUploading(true);

    // Show upload progress
    showAlert({
      title: 'Uploading Video',
      message: `Uploading ${videoFile.name}...\nThis may take a few minutes.`,
      type: 'info',
      buttons: [{ text: 'OK' }]
    });

    // Upload video using the video-assets endpoint
    const uploadResult = await videosService.uploadVideo({
      uri: videoFile.uri,
      type: videoFile.mimeType || 'video/mp4',
      name: videoFile.name,
      size: videoFile.size,
    });

    console.log('Video uploaded successfully:', uploadResult);

    // Refresh the files list to show the new video
    await loadFiles();

    // Debug: Log the full response to understand the structure
    console.log('Full upload response:', uploadResult);
    console.log('Upload result type:', typeof uploadResult);
    console.log('Upload result keys:', uploadResult ? Object.keys(uploadResult) : 'null/undefined');
    
    // Check if uploadResult is null/undefined
    if (!uploadResult) {
      throw new Error('Upload response is null or undefined');
    }
    
    // Safe property access with fallbacks and type checking
    const filename = uploadResult?.filename || videoFile.name || 'Unknown';
    const duration = uploadResult?.duration_sec || 0;
    const fileSize = uploadResult?.file_size_mb;
    const resolution = uploadResult?.resolution || { width: 0, height: 0 };
    
    // Additional safety check for fileSize with detailed logging
    console.log('File size value:', fileSize);
    console.log('File size type:', typeof fileSize);
    
    let safeFileSize = 0;
    if (typeof fileSize === 'number' && !isNaN(fileSize)) {
      safeFileSize = fileSize;
    } else if (typeof fileSize === 'string') {
      const parsed = parseFloat(fileSize);
      safeFileSize = isNaN(parsed) ? 0 : parsed;
    }
    
    console.log('Safe file size:', safeFileSize);
    
    showAlert({
      title: 'Upload Successful',
      message: `Video "${filename}" uploaded successfully!\n\nDuration: ${duration}s\nSize: ${safeFileSize.toFixed(1)}MB\nResolution: ${resolution.width}x${resolution.height}`,
      type: 'success',
      buttons: [{ text: 'OK' }]
    });

  } catch (error) {
    console.error('Error uploading video:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      error: error
    });
    
    // Handle specific error cases
    let errorMessage = 'Please try again.';
    if (error instanceof Error) {
      if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('413')) {
        errorMessage = 'File too large. Please select a smaller video file.';
      } else if (error.message.includes('415')) {
        errorMessage = 'Unsupported file type. Please select a valid video file.';
      } else if (error.message.includes('401')) {
        errorMessage = 'Authentication failed. Please log in again.';
      } else if (error.message.includes('toFixed')) {
        errorMessage = 'Invalid response format from server. Please try again.';
      } else {
        errorMessage = error.message;
      }
    }
    
    showAlert({
      message: `Failed to upload video: ${errorMessage}`,
      type: 'error',
      title: 'Upload Failed'
    });
  } finally {
    setUploading(false);
  }
};

  const toggleFileSelection = (fileId: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  const handleDeleteSelected = async () => {
    if (selectedFiles.size === 0) {
      showAlert({
        message: 'Please select files to delete.',
        type: 'warning',
        title: 'No Selection'
      });
      return;
    }

    showAlert({
      title: 'Delete Files',
      message: `Are you sure you want to delete ${selectedFiles.size} file(s)?`,
      type: 'warning',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ Deleting videos:', Array.from(selectedFiles));
              const deletePromises = Array.from(selectedFiles).map(fileId =>
                videosService.deleteVideo(fileId)
              );
              await Promise.all(deletePromises);
              
              console.log('✅ Videos deleted successfully, reloading files...');
              setSelectedFiles(new Set());
              await loadFiles(true); // Force refresh after deletion
              console.log('🔄 Files reloaded after deletion');
              
              showAlert({
                message: 'Files deleted successfully.',
                type: 'success',
                title: 'Success'
              });
            } catch (error) {
              console.error('Error deleting files:', error);
              showAlert({
                message: 'Failed to delete files. Please try again.',
                type: 'error',
                title: 'Error'
              });
            }
          },
        },
      ],
    });
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(0)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string | undefined | null, videoId?: string) => {
    // If we have a date string, use it
    if (dateString) {
      console.log('📅 Formatting date:', dateString, 'Type:', typeof dateString);
      
      // Try different date parsing approaches
      let date: Date;
      
      // Handle ISO string
      if (typeof dateString === 'string' && dateString.includes('T')) {
        date = new Date(dateString);
      }
      // Handle timestamp (number or string)
      else if (typeof dateString === 'number' || /^\d+$/.test(dateString)) {
        // Try both seconds and milliseconds
        const timestamp = parseInt(dateString.toString());
        date = new Date(timestamp > 1000000000000 ? timestamp : timestamp * 1000);
      }
      // Handle other string formats
      else {
        date = new Date(dateString);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.log('❌ Invalid date:', dateString);
        return 'Date unavailable';
      }
      
      const formatted = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      
      console.log('✅ Formatted date:', formatted);
      return formatted;
    }
    
    // Fallback: Try to extract date from MongoDB ObjectId
    if (videoId && videoId.length === 24) {
      try {
        // Extract timestamp from MongoDB ObjectId (first 8 characters are timestamp in hex)
        const timestampHex = videoId.substring(0, 8);
        const timestamp = parseInt(timestampHex, 16) * 1000; // Convert to milliseconds
        const date = new Date(timestamp);
        
        if (!isNaN(date.getTime())) {
          const formatted = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });
          console.log('📅 Extracted date from ObjectId:', formatted);
          return formatted;
        }
      } catch (error) {
        console.log('❌ Failed to extract date from ObjectId:', error);
      }
    }
    
    console.log('⚠️ No date available');
    return 'Recently uploaded';
  };

  if (loading) {
    return <LoadingScreen message="Loading files..." />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image 
              source={require('../../assets/ui/back_icon.png')} 
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>{selectionMode ? 'Select Video' : 'Files'}</Text>
          
          {/* Upload Button */}
          {!selectionMode && (
            <TouchableOpacity 
              style={[styles.uploadButton, { backgroundColor: colors.primary }]} 
              onPress={handleUploadVideo}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <Image 
                  source={require('../../assets/ui/upload.png')} 
                  style={styles.uploadIcon}
                  resizeMode="contain"
                />
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Action Bar */}
        {!selectionMode && selectedFiles.size > 0 && (
          <View style={[styles.actionBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.selectedCount, { color: colors.text }]}>
              {selectedFiles.size} file{selectedFiles.size > 1 ? 's' : ''} selected
            </Text>
            <TouchableOpacity style={[styles.deleteButton, { backgroundColor: colors.error }]} onPress={handleDeleteSelected}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Files List */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {files.length === 0 ? (
            <View style={styles.emptyState}>
              <Image 
                source={require('../../assets/ui/file.png')} 
                style={[styles.emptyIcon, { tintColor: colors.textSecondary }]}
                resizeMode="contain"
              />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Videos</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Tap the upload button to add videos from your device
              </Text>
              
              {/* Upload Button in Empty State */}
              <TouchableOpacity 
                style={[styles.emptyStateUploadButton, { backgroundColor: colors.primary }]} 
                onPress={handleUploadVideo}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <>
                    <Image 
                      source={require('../../assets/ui/upload.png')} 
                      style={styles.emptyStateUploadIcon}
                      resizeMode="contain"
                    />
                    <Text style={[styles.emptyStateUploadText, { color: colors.text }]}>Upload Video</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            files.map((file) => (
              <TouchableOpacity
                key={file._id}
                style={[
                  styles.fileItem,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  selectedFiles.has(file._id) && styles.fileItemSelected
                ]}
                onPress={() => {
                  if (selectionMode && onVideoSelected) {
                    // In selection mode, select the video and go back
                    onVideoSelected(file);
                    navigation?.goBack();
                  } else {
                    // In normal mode, toggle selection
                    toggleFileSelection(file._id);
                  }
                }}
              >
                <View style={styles.fileIconContainer}>
                  <Image 
                    source={require('../../assets/ui/file.png')} 
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
                  {selectedFiles.has(file._id) && (
                    <View style={[styles.selectedIndicator, { backgroundColor: colors.primary }]}>
                      <Text style={styles.selectedText}>✓</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
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
  // Upload Button Styles
  uploadButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#87EA5C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIcon: {
    width: 20,
    height: 20,
  },
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
  content: {
    flex: 1,
    paddingHorizontal: tokens.spacing[4],
  },
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
  // Empty State Upload Button
  emptyStateUploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#87EA5C',
    borderRadius: tokens.radius.lg,
    paddingHorizontal: tokens.spacing[6],
    paddingVertical: tokens.spacing[3],
  },
  emptyStateUploadIcon: {
    width: 20,
    height: 20,
    marginRight: tokens.spacing[2],
  },
  emptyStateUploadText: {
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '600',
    fontSize: 16,
    color: '#083400',
  },
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

export default FilesScreen;
