import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import LoadingScreen from '@/components/LoadingScreen';
import { Video } from '@/types/api';

// Files components
import FilesHeader from '@/components/files/FilesHeader';
import ActionBar from '@/components/files/ActionBar';
import FileList from '@/components/files/FileList';

// Custom hook
import { useFiles } from '@/hooks/useFiles';

interface FilesScreenProps {
  navigation?: any;
  onVideoSelected?: (video: Video) => void;
  selectionMode?: boolean;
}

const FilesScreen: React.FC<FilesScreenProps> = ({ navigation, onVideoSelected, selectionMode = false }) => {
  const { colors } = useTheme();
  
  const {
    state: { files, loading, uploading, selectedFiles },
    actions: { 
      handleUploadVideo, 
      handleDeleteSelected, 
      toggleFileSelection, 
      formatFileSize, 
      formatDuration, 
      formatDate 
    },
  } = useFiles();

  const handleBack = () => {
    navigation?.goBack();
  };

  if (loading) {
    return <LoadingScreen message="Loading files..." />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <FilesHeader
          selectionMode={selectionMode}
          uploading={uploading}
          onBack={handleBack}
          onUpload={handleUploadVideo}
          colors={colors}
        />

        {/* Action Bar */}
        <ActionBar
          selectedCount={selectedFiles.size}
          onDelete={handleDeleteSelected}
          colors={colors}
        />

        {/* Files List */}
        <FileList
          files={files}
          selectedFiles={selectedFiles}
          uploading={uploading}
          selectionMode={selectionMode}
          onVideoSelected={onVideoSelected}
          onFilePress={toggleFileSelection}
          onUpload={handleUploadVideo}
          colors={colors}
          formatFileSize={formatFileSize}
          formatDuration={formatDuration}
          formatDate={formatDate}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
});

export default FilesScreen;