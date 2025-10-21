import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { tokens } from '@/theme/tokens';

interface TruckInfoCardProps {
  truck: any;
  lastSyncText: string;
  truckStatus: 'online' | 'offline';
  isDark: boolean;
  colors: any;
}

const TruckInfoCard: React.FC<TruckInfoCardProps> = ({ 
  truck, 
  lastSyncText, 
  truckStatus, 
  isDark, 
  colors 
}) => {
  return (
    <View style={[styles.truckInfoCard, { backgroundColor: colors.surface }]}>
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
      <View style={styles.truckInfo}>
        <Text style={[styles.truckPlate, { color: colors.text }]}>
          {truck.truck_number || truck.plate || 'Unknown Truck'}
        </Text>
        <Text style={[styles.truckRoute, { color: colors.text }]}>
          {truck.route && typeof truck.route === 'object' && 'route_name' in truck.route 
            ? truck.route.route_name 
            : truck.route || 'Unknown Route'}
        </Text>
        <Text style={[styles.lastSync, { color: colors.textSecondary }]}>
          Last Sync: {lastSyncText}
        </Text>
        
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: colors.surface }]}>
          <View style={[styles.statusDot, { backgroundColor: truckStatus === 'online' ? tokens.colors.accent.online : tokens.colors.accent.offline }]} />
          <Text style={[styles.statusText, { color: colors.text }]}>
            {(truck.status || 'offline').toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  truckInfoCard: {
    backgroundColor: tokens.colors.surface.white,
    borderRadius: 32,
    padding: tokens.spacing[4],
    marginHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[4],
    alignItems: 'center',
    flexDirection: 'row',
  },
  truckImage: {
    width: 76,
    height: 63,
    marginRight: tokens.spacing[4],
  },
  truckInfo: {
    flex: 1,
  },
  truckPlate: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.semibold,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: tokens.spacing[1],
  },
  truckRoute: {
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.regular,
    color: '#083400',
    fontFamily: 'Poppins_400Regular',
    marginBottom: tokens.spacing[1],
  },
  lastSync: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.regular,
    color: '#083400',
    fontFamily: 'Poppins_400Regular',
    marginBottom: tokens.spacing[3],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.surface.white,
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: tokens.spacing[1],
    borderRadius: tokens.radius.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: tokens.spacing[1],
  },
  statusText: {
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.medium,
    color: '#083400',
    fontFamily: 'Inter',
  },
});

export default TruckInfoCard;
