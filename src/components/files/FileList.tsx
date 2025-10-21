import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';
import { Video } from '@/types/api';
import FileItem from './FileItem';
import EmptyState from './EmptyState';

interface FileListProps {
  files: Video[];
  selectedFiles: Set<string>;
  uploading: boolean;
  selectionMode: boolean;
  onVideoSelected?: (video: Video) => void;
  onFilePress: (fileId: string) => void;
  onUpload: () => void;
  colors: any;
  formatFileSize: (sizeInMB: number) => string;
  formatDuration: (seconds: number) => string;
  formatDate: (dateString: string | undefined | null, videoId?: string) => string;
}

const FileList: React.FC<FileListProps> = ({
  files,
  selectedFiles,
  uploading,
  selectionMode,
  onVideoSelected,
  onFilePress,
  onUpload,
  colors,
  formatFileSize,
  formatDuration,
  formatDate,
}) => {
  return (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {files.length === 0 ? (
        <EmptyState
          uploading={uploading}
          onUpload={onUpload}
          colors={colors}
        />
      ) : (
        files.map((file) => (
          <FileItem
            key={file._id}
            file={file}
            isSelected={selectedFiles.has(file._id)}
            onPress={() => {
              if (selectionMode && onVideoSelected) {
                // In selection mode, select the video and go back
                onVideoSelected(file);
              } else {
                // In normal mode, toggle selection
                onFilePress(file._id);
              }
            }}
            colors={colors}
            formatFileSize={formatFileSize}
            formatDuration={formatDuration}
            formatDate={formatDate}
          />
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: tokens.spacing[4],
  },
});

export default FileList;
