import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';
import { City } from '@/types/api';

interface HomeHeaderProps {
  selectedCity: City | null;
  dropdownVisible: boolean;
  onCityDropdownPress: () => void;
  onNavigateToProfile?: () => void;
}

const HomeHeader: React.FC<HomeHeaderProps> = ({
  selectedCity,
  dropdownVisible,
  onCityDropdownPress,
  onNavigateToProfile,
}) => {
  return (
    <View style={styles.headerOverlay}>
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.cityDropdown}
        onPress={onCityDropdownPress}
      >
        <Image 
          source={require('../../../assets/ui/location_icon.png')} 
          style={styles.cityDropdownIcon} 
          resizeMode="contain" 
        />
        <Text 
          style={styles.cityDropdownText}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {selectedCity?.name ?? 'Select City'}
        </Text>

        <View style={styles.cityDropdownRight}>
          <Text style={styles.cityDropdownTick}>{dropdownVisible ? '▲' : '▼'}</Text>
        </View>
      </TouchableOpacity>

      {onNavigateToProfile && (
        <TouchableOpacity style={styles.profileBubble} onPress={onNavigateToProfile}>
          <Image source={require('../../../assets/avatar/image.png')} style={styles.profileBubbleImg} resizeMode="cover" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerOverlay: {
    position: 'absolute',
    top: tokens.spacing[6],
    left: tokens.spacing[4],
    right: tokens.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
  },
  cityDropdown: {
    backgroundColor: '#87EA5C',
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 12,
    shadowColor: '#87EA5C',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginRight: tokens.spacing[3],
    flex: 1,
    maxWidth: '85%',
  },
  cityDropdownIcon: { 
    width: 18, 
    height: 18,
    marginRight: 8,
  },
  cityDropdownText: {
    flex: 1,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    lineHeight: 20,
    marginRight: 32,
  },
  cityDropdownRight: {
    position: 'absolute',
    right: 8,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 24,
  },
  cityDropdownTick: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 18,
    color: '#083400',
  },
  profileBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#87EA5C',
    backgroundColor: '#fff',
    marginLeft: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBubbleImg: { width: 34, height: 34, borderRadius: 17 },
});

export default HomeHeader;
