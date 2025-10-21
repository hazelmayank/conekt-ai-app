import React from 'react';
import { TouchableOpacity, Image, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface UploadButtonProps {
  uploading: boolean;
  onUpload: () => void;
  colors: any;
  size?: 'small' | 'large';
}

const UploadButton: React.FC<UploadButtonProps> = ({
  uploading,
  onUpload,
  colors,
  size = 'small',
}) => {
  const isLarge = size === 'large';
  
  if (isLarge) {
    return (
      <TouchableOpacity 
        style={[styles.largeButton, { backgroundColor: colors.primary }]} 
        onPress={onUpload}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <>
            <Image 
              source={require('../../../assets/ui/upload.png')} 
              style={styles.largeIcon}
              resizeMode="contain"
            />
            <Text style={[styles.largeText, { color: colors.text }]}>Upload Video</Text>
          </>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.smallButton, { backgroundColor: colors.primary }]} 
      onPress={onUpload}
      disabled={uploading}
    >
      {uploading ? (
        <ActivityIndicator size="small" color={colors.text} />
      ) : (
        <Image 
          source={require('../../../assets/ui/upload.png')} 
          style={styles.smallIcon}
          resizeMode="contain"
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  smallButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#87EA5C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smallIcon: {
    width: 20,
    height: 20,
  },
  largeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#87EA5C',
    borderRadius: tokens.radius.lg,
    paddingHorizontal: tokens.spacing[6],
    paddingVertical: tokens.spacing[3],
  },
  largeIcon: {
    width: 20,
    height: 20,
    marginRight: tokens.spacing[2],
  },
  largeText: {
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '600',
    fontSize: 16,
    color: '#083400',
  },
});

export default UploadButton;
