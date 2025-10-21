import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface ProfileHeaderProps {
  colors: any;
  onBack: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ colors, onBack }) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Image 
          source={require('../../../assets/ui/back_icon.png')} 
          style={styles.backIcon} 
          resizeMode="contain" 
        />
      </TouchableOpacity>
      <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    marginTop: tokens.spacing[2],
    position: 'relative',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#87EA5C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing[3],
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
    position: 'absolute',
    left: '50%',
    marginLeft: -32, // Half of title width to center it
    top: '50%',
    marginTop: -15, // Half of title height to center it vertically
  },
});

export default ProfileHeader;
