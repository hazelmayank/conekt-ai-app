import { useState, useEffect, useRef, useCallback } from 'react';
import { Dimensions } from 'react-native';
import { State, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { citiesService, trucksService } from '@/services/services';
import { City, Truck } from '@/types/api';
import { useAlert } from '@/context/AlertContext';

const { height } = Dimensions.get('window');

export const useHomePage = () => {
  const { showAlert } = useAlert();
  const [currentScreen, setCurrentScreen] = useState<'home' | 'addTruck' | 'truckDetails'>('home');
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);

  // dropdown state
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isTrucksCardMinimized, setIsTrucksCardMinimized] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [cardHeight, setCardHeight] = useState(height * 0.35);
  const [truckDragPositions, setTruckDragPositions] = useState<Record<string, number>>({});

  const mapRef = useRef<any>(null);

  const loadTrucksForCity = useCallback(async (cityId: string) => {
    try {
      const trucksData = await trucksService.getTrucksInCity(cityId);
      setTrucks(trucksData);
    } catch (error) {
      showAlert({
        message: `Failed to load trucks: ${error instanceof Error ? error.message : 'Please try again.'}`,
        type: 'error',
        title: 'Error'
      });
    }
  }, [showAlert]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        
        // Load cities first
        const citiesData = await citiesService.getAllCities();
        setCities(citiesData);
        
        if (citiesData.length > 0) {
          const firstCity = citiesData[0];
          setSelectedCity(firstCity);
          
          // Load trucks for the first city in parallel
          await loadTrucksForCity(firstCity._id);
        }
      } catch (error) {
        showAlert({
          message: `Failed to load data: ${error instanceof Error ? error.message : 'Please try again.'}`,
          type: 'error',
          title: 'Error'
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [loadTrucksForCity, showAlert]);

  const handleCityChange = useCallback(async (city: City) => {
    setSelectedCity(city);
    setDropdownVisible(false);
    await loadTrucksForCity(city._id);
    if (mapRef.current) {
      const region = {
        latitude: city.coordinates?.lat ?? 19.0760,
        longitude: city.coordinates?.lng ?? 72.8777,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      };
      mapRef.current.animateToRegion(region, 400);
    }
  }, [loadTrucksForCity]);

  const handleAddTruck = useCallback(() => setCurrentScreen('addTruck'), []);
  const handleBackToHome = useCallback(() => setCurrentScreen('home'), []);

  const handleTruckPress = useCallback((truck: Truck) => {
    setSelectedTruck(truck);
    setCurrentScreen('truckDetails');
  }, []);

  const handleBackFromTruckDetails = useCallback(() => {
    setCurrentScreen('home');
    setSelectedTruck(null);
  }, []);

  const handleDragGesture = useCallback((event: any) => {
    const { translationY, state } = event.nativeEvent;
    
    if (state === State.ACTIVE) {
      const newDragY = Math.max(0, Math.min(height * 0.7, translationY));
      setDragY(newDragY);
      
      // Auto-minimize if dragged up significantly
      if (translationY > height * 0.3) {
        setIsTrucksCardMinimized(true);
        setDragY(0);
      }
    } else if (state === State.END) {
      // Snap to nearest position
      if (dragY > height * 0.15) {
        setIsTrucksCardMinimized(true);
        setDragY(0);
      } else {
        setIsTrucksCardMinimized(false);
        setDragY(0);
      }
    }
  }, [dragY]);

  const handleTruckCardDrag = useCallback((truckId: string) => (event: PanGestureHandlerGestureEvent) => {
    const { translationY, state } = event.nativeEvent;
    
    if (state === State.ACTIVE) {
      // Only allow downward dragging
      const newDragY = Math.max(0, Math.min(100, translationY));
      setTruckDragPositions(prev => ({
        ...prev,
        [truckId]: newDragY
      }));
    } else if (state === State.END) {
      // Snap back to original position or trigger action if dragged far enough
      if (translationY > 60) {
        // Trigger action (e.g., delete truck, show options)
        showAlert({
          title: 'Truck Action',
          message: 'What would you like to do with this truck?',
          type: 'info',
          buttons: [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => {
              // Add delete functionality here
              console.log('Delete truck:', truckId);
            }},
            { text: 'Archive', onPress: () => {
              // Add archive functionality here
              console.log('Archive truck:', truckId);
            }}
          ]
        });
      }
      
      // Reset drag position
      setTruckDragPositions(prev => ({
        ...prev,
        [truckId]: 0
      }));
    }
  }, [showAlert]);

  return {
    // State
    currentScreen,
    selectedTruck,
    trucks,
    cities,
    selectedCity,
    loading,
    dropdownVisible,
    isTrucksCardMinimized,
    dragY,
    truckDragPositions,
    mapRef,
    
    // Actions
    setCurrentScreen,
    setSelectedTruck,
    setDropdownVisible,
    setIsTrucksCardMinimized,
    setDragY,
    setTruckDragPositions,
    handleCityChange,
    handleAddTruck,
    handleBackToHome,
    handleTruckPress,
    handleBackFromTruckDetails,
    handleDragGesture,
    handleTruckCardDrag,
  };
};
