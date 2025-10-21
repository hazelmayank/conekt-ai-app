import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { tokens } from '@/theme/tokens';
import { Truck } from '@/types/api';

interface TruckCardProps {
  truck: Truck;
  index: number;
  dragY?: number;
  onDrag?: (event: PanGestureHandlerGestureEvent) => void;
  colors?: any;
  isDark?: boolean;
}

const TruckCard: React.FC<TruckCardProps> = React.memo(({ 
  truck, 
  dragY = 0, 
  onDrag, 
  colors, 
  isDark = false 
}) => {
  const isOnline = truck.status === 'online';
  const routeName = useMemo(() => {
    return truck.route && typeof truck.route === 'object' && 'route_name' in truck.route 
      ? truck.route.route_name 
      : 'Unknown Route';
  }, [truck.route]);
  
  // Update truck card background and border colors based on theme
  const truckCardStyle = useMemo(() => [
    styles.truckCard,
    {
      backgroundColor: colors.surface,
      borderColor: colors.primary,
    }
  ], [colors.surface, colors.primary]);

  return (
    <PanGestureHandler onHandlerStateChange={onDrag}>
      <View style={[truckCardStyle, { transform: [{ translateY: dragY }] }]}>
        <View style={styles.truckImageContainer}>
          <Image
            source={
              isOnline
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

        <View style={styles.truckInfo}>
          <Text style={[styles.truckPlate, { color: colors?.text || '#083400' }]}>{truck.truck_number || 'Unknown Truck'}</Text>
          <Text style={[styles.truckRoute, { color: colors?.textSecondary || '#6D7E72' }]}>{routeName}</Text>

          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#36D39A' : '#FF5A5A' }]} />
            <Text style={[styles.statusText, { color: isOnline ? colors.text : '#D52C2C' }]}>
              {(truck.status || 'offline').toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.forwardIcon}>
          <Image 
            source={require('../../../assets/ui/forward_icon.png')}
            style={[styles.forwardIconImage, { tintColor: colors.text }]}
            resizeMode="contain"
          />
        </View>
      </View>
    </PanGestureHandler>
  );
});

const styles = StyleSheet.create({
  truckCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.surface.white,
    borderRadius: 18,
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    borderWidth: 1.5,
    borderColor: '#87EA5C',
    height: 104,
    shadowColor: '#87EA5C',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  truckImageContainer: { width: 76, height: 63, marginRight: tokens.spacing[4] },
  truckImage: { width: '100%', height: '100%' },
  truckInfo: { flex: 1 },
  truckPlate: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
    marginBottom: 6,
  },
  truckRoute: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#083400',
    marginBottom: 8,
  },
  statusContainer: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, fontFamily: 'Poppins_400Regular' },
  forwardIcon: { width: 24, height: 24, justifyContent: 'center', alignItems: 'center' },
  forwardIconImage: { width: 18, height: 18 },
});

export default TruckCard;
