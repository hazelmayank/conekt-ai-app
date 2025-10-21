import { useState, useEffect } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { videosService } from '@/services/services';
import { Video } from '@/types/api';
import { useAlert } from '@/context/AlertContext';

export const useFiles = () => {
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

  return {
    // State
    state: {
      files,
      loading,
      uploading,
      selectedFiles,
    },
    // Actions
    actions: {
      loadFiles,
      handleUploadVideo,
      handleDeleteSelected,
      toggleFileSelection,
      formatFileSize,
      formatDuration,
      formatDate,
    },
  };
};
