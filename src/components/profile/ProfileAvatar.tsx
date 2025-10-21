import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';
import { User } from '@/types/api';

interface ProfileAvatarProps {
  user: User | null;
  colors: any;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ user, colors }) => {
  return (
    <View style={styles.profileSection}>
      <View style={styles.avatarContainer}>
        <Image 
          source={require('../../../assets/avatar/image.png')} 
          style={styles.avatar}
          resizeMode="cover"
        />
        <View style={styles.editIconContainer}>
          <Text style={styles.editIcon}>✎</Text>
        </View>
      </View>
      
      <View style={styles.greetingContainer}>
        <Text style={[styles.greeting, { color: colors.text }]}>Hi 👋, {user?.name || 'User'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileSection: {
    alignItems: 'center',
    paddingVertical: tokens.spacing[6],
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: tokens.spacing[4],
  },
  avatar: {
    width: 88,
    height: 80,
    borderRadius: 44,
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#53C920',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  editIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
  },
});

export default ProfileAvatar;
