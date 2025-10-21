import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, StyleSheet } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { tokens } from '@/theme/tokens';
import { Truck } from '@/types/api';
import TruckCard from './TruckCard';
import EmptyState from './EmptyState';

interface TrucksCardOverlayProps {
  trucks: Truck[];
  isTrucksCardMinimized: boolean;
  dragY: number;
  truckDragPositions: Record<string, number>;
  colors: any;
  isDark: boolean;
  onDragGesture: (event: any) => void;
  onToggleMinimized: () => void;
  onAddTruck: () => void;
  onTruckPress: (truck: Truck) => void;
  onTruckCardDrag: (truckId: string) => (event: any) => void;
}

const TrucksCardOverlay: React.FC<TrucksCardOverlayProps> = ({
  trucks,
  isTrucksCardMinimized,
  dragY,
  truckDragPositions,
  colors,
  isDark,
  onDragGesture,
  onToggleMinimized,
  onAddTruck,
  onTruckPress,
  onTruckCardDrag,
}) => {
  return (
    <PanGestureHandler onHandlerStateChange={onDragGesture}>
      <View style={[
        styles.trucksCardOverlay, 
        { backgroundColor: colors.surface },
        isTrucksCardMinimized && styles.trucksCardMinimized,
        { transform: [{ translateY: dragY }] }
      ]}>
        <TouchableOpacity 
          style={styles.trucksCardHandle}
          onPress={onToggleMinimized}
        >
          <View style={styles.handleBar} />
        </TouchableOpacity>
        
        <View style={styles.myTrucksHeader}>
          <Text style={[styles.myTrucksTitle, { color: colors.text }]}>My Trucks</Text>
          <TouchableOpacity style={styles.addButton} onPress={onAddTruck}>
            <Image 
              source={require('../../../assets/ui/add_icon.png')} 
              style={styles.addButtonIcon} 
              resizeMode="contain" 
            />
          </TouchableOpacity>
        </View>

        {!isTrucksCardMinimized && (
          <ScrollView style={styles.truckCardsContainer} showsVerticalScrollIndicator={false}>
            {trucks.map((truck, index) => (
              <TouchableOpacity
                key={truck._id}
                onPress={() => onTruckPress(truck)}
                style={styles.truckCardWrapper}
                activeOpacity={0.7}
              >
                <TruckCard 
                  truck={truck} 
                  index={index}
                  dragY={truckDragPositions[truck._id] || 0}
                  onDrag={onTruckCardDrag(truck._id)}
                  colors={colors}
                  isDark={isDark}
                />
              </TouchableOpacity>
            ))}
            {trucks.length === 0 && (
              <EmptyState onAddTruck={onAddTruck} colors={colors} />
            )}
          </ScrollView>
        )}
      </View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  trucksCardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -5 },
    elevation: 10,
    zIndex: 999,
    maxHeight: '70%',
    minHeight: 80,
  },
  trucksCardMinimized: {
    maxHeight: 80,
  },
  trucksCardHandle: {
    alignItems: 'center',
    paddingVertical: tokens.spacing[2],
    paddingHorizontal: tokens.spacing[4],
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E2E2E2',
    borderRadius: 2,
  },
  myTrucksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    marginBottom: tokens.spacing[2],
  },
  myTrucksTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    lineHeight: 20,
    color: '#083400',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#87EA5C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonIcon: {
    width: 18,
    height: 18,
  },
  truckCardsContainer: { flex: 1 },
  truckCardWrapper: { 
    marginBottom: tokens.spacing[2],
    marginHorizontal: tokens.spacing[3],
  },
});

export default TrucksCardOverlay;
