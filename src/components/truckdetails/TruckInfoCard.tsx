import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TruckInfoCardProps {
  truck: any;
  lastSyncText: string;
  statusText: string;
  truckStatus: 'online' | 'offline';
  colors: any;
}

const TruckInfoCard: React.FC<TruckInfoCardProps> = ({ 
  truck, 
  lastSyncText, 
  statusText, 
  truckStatus, 
  colors 
}) => {
  return (
    <View style={[styles.truckInfoCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.truckPlate, { color: colors.text }]}>
        {truck.truck_number || truck.plate || 'KA 25 AA 7007'}
      </Text>
      <Text style={[styles.truckRoute, { color: colors.text }]}>
        {truck.route && typeof truck.route === 'object' && 'route_name' in truck.route 
          ? truck.route.route_name 
          : truck.route || 'Indranagar Route'}
      </Text>
      <Text style={[styles.lastSync, { color: colors.textSecondary }]}>
        Last Sync: {lastSyncText}
      </Text>
      
      {/* Status Badge */}
      <View style={styles.statusBadge}>
        <View style={styles.statusIndicator}>
          <View style={[
            styles.statusDotOuter,
            { backgroundColor: truckStatus === 'online' ? '#53C920' : '#FF4D4D' }
          ]}>
            <View style={styles.statusDotInner} />
          </View>
        </View>
        <Text style={[styles.statusText, { color: colors.text }]}>{statusText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  truckInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  truckPlate: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
    marginBottom: 2,
  },
  truckRoute: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#083400',
    marginBottom: 2,
  },
  lastSync: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#083400',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    marginRight: 8,
  },
  statusDotOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(10, 207, 237, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDotInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0ACFED',
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter',
    color: '#083400',
  },
});

export default TruckInfoCard;
