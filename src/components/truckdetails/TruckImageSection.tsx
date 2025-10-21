import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

interface TruckImageSectionProps {
  truckStatus: 'online' | 'offline';
  isDark: boolean;
}

const TruckImageSection: React.FC<TruckImageSectionProps> = ({ truckStatus, isDark }) => {
  return (
    <View style={styles.truckImageContainer}>
      <Image 
        source={
          truckStatus === 'online'
            ? isDark 
              ? require('../../../assets/vehicles/white_truck_online.png')
              : require('../../../assets/vehicles/truck_online.png')
            : isDark
              ? require('../../../assets/vehicles/white_truck_offline.png')
              : require('../../../assets/vehicles/truck_offline_blue.png')
        }
        style={styles.truckImage} 
        resizeMode="contain" 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  truckImageContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  truckImage: {
    width: 76,
    height: 63,
  },
});

export default TruckImageSection;
