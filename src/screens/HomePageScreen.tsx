import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  TextInput,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Polyline, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import type { LatLng, Region } from 'react-native-maps';
import { PanGestureHandler, State, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import { tokens } from '../theme/tokens';
import { citiesService, trucksService } from '../services/services';
import { City, Truck } from '../types/api';
import TruckDetailsScreen from './TruckDetailsScreen';
import LoadingScreen from '../components/LoadingScreen';
import { useTheme } from '../context/ThemeContext';
import { useAlert } from '../context/AlertContext';

const { height } = Dimensions.get('window');

/* --------------------------------- Helpers -------------------------------- */

// Accepts [[lat,lng], ...] or [{lat,lng}, ...] and returns LatLng[]
const toLatLngObjects = (pairs?: any): LatLng[] => {
  if (!Array.isArray(pairs)) return [];
  return pairs
    .map((p: any) => {
      if (Array.isArray(p) && p.length === 2) {
        const [lat, lng] = p;
        if (typeof lat === 'number' && typeof lng === 'number') {
          return { latitude: lat, longitude: lng } as LatLng;
        }
      } else if (p && typeof p === 'object' && typeof p.lat === 'number' && typeof p.lng === 'number') {
        return { latitude: p.lat, longitude: p.lng } as LatLng;
      }
      return null;
    })
    .filter(Boolean) as LatLng[];
};

// If polygon is given as 2 points (southWest, northEast), expand to a rectangle
const expandTwoPointRect = (coords: LatLng[]): LatLng[] => {
  if (coords.length !== 2) return coords;
  const sw = coords[0];
  const ne = coords[1];
  const nw = { latitude: ne.latitude, longitude: sw.longitude };
  const se = { latitude: sw.latitude, longitude: ne.longitude };
  return [sw, se, ne, nw, sw];
};

const fitAll = (mapRef: React.RefObject<MapView | null>, coords: LatLng[]) => {
  if (!mapRef.current || !coords.length) return;
  mapRef.current.fitToCoordinates(coords, {
    edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
    animated: true,
  });
};

const regionFromCity = (city?: City | null): Region => {
  const lat = city?.coordinates?.lat ?? 19.0760;
  const lng = city?.coordinates?.lng ?? 72.8777;
  return {
    latitude: lat,
    longitude: lng,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };
};

/* ------------------------------- AddTruckScreen ------------------------------ */

const AddTruckScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [route, setRoute] = useState('');
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string>('');
  const [selectedCityName, setSelectedCityName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const citiesData = await citiesService.getAllCities();
        setCities(citiesData);
      } catch (error) {
        showAlert({
          message: `Failed to load cities: ${error instanceof Error ? error.message : 'Please try again.'}`,
          type: 'error',
          title: 'Error'
        });
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!selectedCityId || !registrationNumber || !route) {
      showAlert({
        message: 'Please fill in all required fields',
        type: 'error',
        title: 'Error'
      });
      return;
    }
    setLoading(true);
    try {
      const truckData = {
        city_id: selectedCityId,
        truck_number: registrationNumber,
        route: {
          route_name: route,
          polyline: [
            { lat: 19.0760, lng: 72.8777 },
            { lat: 19.0761, lng: 72.8778 },
            { lat: 19.0762, lng: 72.8779 },
          ],
          polygon: [
            { lat: 19.0750, lng: 72.8760 },
            { lat: 19.0770, lng: 72.8790 },
          ],
        },
        gps_lat: 19.0760,
        gps_lng: 72.8777,
      };
      await trucksService.createTruck(truckData);
      showAlert({
        message: 'Truck created successfully!',
        type: 'success',
        title: 'Success'
      });
      navigation?.goBack();
    } catch (error) {
      showAlert({
        message: `Failed to create truck: ${error instanceof Error ? error.message : 'Please try again.'}`,
        type: 'error',
        title: 'Error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCitySelect = (city: City) => {
    setSelectedCityId(city._id);
    setSelectedCityName(city.name);
    setDropdownVisible(false);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[addTruckStyles.container, { backgroundColor: colors.background }]}>
        <View style={addTruckStyles.header}>
          <TouchableOpacity style={addTruckStyles.backButton} onPress={() => navigation?.goBack()}>
            <Image source={require('../../assets/ui/back_icon.png')} style={addTruckStyles.backIcon} resizeMode="contain" />
          </TouchableOpacity>
          <Text style={[addTruckStyles.title, { color: colors.text }]}>Add Truck</Text>
        </View>

        {/* Form Fields - Matching Figma Layout */}
        <View style={addTruckStyles.formContainer}>
          {/* Registration Number Field */}
          <View style={addTruckStyles.fieldGroup}>
            <View style={addTruckStyles.labelContainer}>
              <Text style={[addTruckStyles.label, { color: colors.text }]}>Registration Number</Text>
              <Text style={addTruckStyles.requiredAsterisk}>*</Text>
            </View>
            <View style={[addTruckStyles.inputField, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[addTruckStyles.inputText, { color: colors.text }]}
                placeholder="Enter registration number (e.g., KA 01 A 1234)"
                placeholderTextColor={colors.textSecondary}
                value={registrationNumber}
                onChangeText={setRegistrationNumber}
              />
            </View>
          </View>

          {/* City Field */}
          <View style={addTruckStyles.fieldGroup}>
            <View style={addTruckStyles.labelContainer}>
              <Text style={[addTruckStyles.label, { color: colors.text }]}>City</Text>
              <Text style={addTruckStyles.requiredAsterisk}>*</Text>
            </View>
            <TouchableOpacity 
              style={[addTruckStyles.dropdownContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setDropdownVisible(!dropdownVisible)}
            >
              <Text style={[
                addTruckStyles.dropdownText,
                selectedCityName ? [addTruckStyles.dropdownTextSelected, { color: colors.text }] : [addTruckStyles.dropdownTextPlaceholder, { color: colors.textSecondary }]
              ]}>
                {selectedCityName || 'Select'}
              </Text>
              <Text style={[addTruckStyles.dropdownArrow, { color: colors.text }]}>
                {dropdownVisible ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>
            
            {/* Dropdown Menu */}
            {dropdownVisible && (
              <View style={[addTruckStyles.dropdownMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                {cities.map((city) => (
                  <TouchableOpacity
                    key={city._id}
                    style={[
                      addTruckStyles.dropdownItem,
                      selectedCityId === city._id && addTruckStyles.dropdownItemSelected
                    ]}
                    onPress={() => handleCitySelect(city)}
                  >
                    <Text style={[
                      addTruckStyles.dropdownItemText,
                      { color: colors.text },
                      selectedCityId === city._id && addTruckStyles.dropdownItemTextSelected
                    ]}>
                      {city.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Route Field */}
          <View style={addTruckStyles.fieldGroup}>
            <View style={addTruckStyles.labelContainer}>
              <Text style={[addTruckStyles.label, { color: colors.text }]}>Route</Text>
              <Text style={addTruckStyles.requiredAsterisk}>*</Text>
            </View>
            <View style={[addTruckStyles.inputField, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[addTruckStyles.inputText, { color: colors.text }]}
                placeholder="eg. Hebbal Route"
                placeholderTextColor={colors.textSecondary}
                value={route}
                onChangeText={setRoute}
              />
            </View>
          </View>
        </View>

        <View style={[addTruckStyles.saveButtonContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[addTruckStyles.saveButton, { backgroundColor: colors.surface, borderColor: colors.primary }, loading && addTruckStyles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={colors.text} /> : <Text style={[addTruckStyles.saveButtonText, { color: colors.text }]}>Save</Text>}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

/* -------------------------------- TruckCard -------------------------------- */

const TruckCard: React.FC<{
  truck: Truck;
  index: number;
  dragY?: number;
  onDrag?: (event: PanGestureHandlerGestureEvent) => void;
  colors?: any;
  isDark?: boolean;
}> = React.memo(({ truck, dragY = 0, onDrag, colors, isDark = false }) => {
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
                  ? require('../../assets/vehicles/white_truck_online.png')
                  : require('../../assets/vehicles/truck_online.png')
                : isDark
                  ? require('../../assets/vehicles/white_truck_offline.png')
                  : require('../../assets/vehicles/truck_offline_blue.png')
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
            source={require('../../assets/ui/forward_icon.png')}
            style={[styles.forwardIconImage, { tintColor: colors.text }]}
            resizeMode="contain"
          />
        </View>
      </View>
    </PanGestureHandler>
  );
});

/* ------------------------------- HomePageScreen ------------------------------ */

const HomePageScreen: React.FC<{
  onNavigateToProfile?: () => void;
  navigation?: any;
}> = ({ onNavigateToProfile, navigation }) => {
  const { colors, isDark } = useTheme();
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

  const mapRef = useRef<MapView | null>(null);

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
  }, []);

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
  }, [loadTrucksForCity]);

  const initialRegion = useMemo(() => regionFromCity(selectedCity), [selectedCity]);

  const handleCityChange = useCallback(async (city: City) => {
    setSelectedCity(city);
    setDropdownVisible(false);
    await loadTrucksForCity(city._id);
    if (mapRef.current) {
      mapRef.current.animateToRegion(regionFromCity(city), 400);
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
  }, [dragY, height]);

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
  }, []);

  // Memoize map markers to prevent unnecessary re-renders
  const mapMarkers = useMemo(() => {
    return trucks.map((t) => {
      const poly = toLatLngObjects((t.route as any)?.polyline);
      let area = toLatLngObjects((t.route as any)?.polygon);
      if (area.length === 2) area = expandTwoPointRect(area);
      const hasGps = typeof t.gps_lat === 'number' && typeof t.gps_lng === 'number';

      return (
        <React.Fragment key={t._id}>
          {/* soft glow under route */}
          {!!poly.length && (
            <Polyline coordinates={poly} strokeColor="rgba(39,174,96,0.25)" strokeWidth={10} />
          )}
          {!!poly.length && <Polyline coordinates={poly} strokeColor="#27AE60" strokeWidth={6} />}

          {!!area.length && (
            <Polygon
              coordinates={area}
              strokeColor="#27AE60"
              fillColor="rgba(135,234,92,0.18)"
              strokeWidth={2}
            />
          )}

          {hasGps && (
            <Marker coordinate={{ latitude: t.gps_lat!, longitude: t.gps_lng! }}>
              <View style={markerStyles.wrap}>
                <View style={markerStyles.halo} />
                <Image
                  source={require('../../assets/icons/location_pin_filled.png')}
                  style={markerStyles.img}
                  resizeMode="contain"
                />
              </View>
            </Marker>
          )}
        </React.Fragment>
      );
    });
  }, [trucks]);

  // Auto-fit to all trucks + routes when trucks or city changes
  useEffect(() => {
    if (!mapRef.current) return;

    if (!trucks.length) {
      mapRef.current.animateToRegion(initialRegion, 400);
      return;
    }

    const all: LatLng[] = [];
    trucks.forEach((t) => {
      if (typeof t.gps_lat === 'number' && typeof t.gps_lng === 'number') {
        all.push({ latitude: t.gps_lat, longitude: t.gps_lng });
      }
      const poly = toLatLngObjects((t.route as any)?.polyline);
      if (poly.length) all.push(...poly);
      let area = toLatLngObjects((t.route as any)?.polygon);
      if (area.length === 2) area = expandTwoPointRect(area);
      if (area.length) all.push(...area);
    });

    if (all.length) fitAll(mapRef, all);
  }, [trucks, initialRegion]);

  if (loading) {
    return <LoadingScreen message="Loading trucks..." />;
  }

  if (currentScreen === 'truckDetails' && selectedTruck) {
    return (
      <TruckDetailsScreen
        truck={selectedTruck}
        navigation={{
          goBack: handleBackFromTruckDetails,
          navigate: (screenName: string, params?: any) => {
            if (navigation?.navigate) navigation.navigate(screenName, params);
          },
        }}
      />
    );
  }

  if (currentScreen === 'addTruck') {
    return <AddTruckScreen navigation={{ goBack: handleBackToHome }} />;
  }

  /* ---------------------------------- Home ---------------------------------- */

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Full Screen Map */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={StyleSheet.absoluteFill}
            provider={PROVIDER_GOOGLE}
            initialRegion={initialRegion}
            showsCompass
            showsBuildings
            toolbarEnabled={false}
            loadingEnabled
          >
            {mapMarkers}
          </MapView>
        </View>

        {/* Header Overlay - City Dropdown + Avatar */}
        <View style={styles.headerOverlay}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.cityDropdown}
            onPress={() => setDropdownVisible((v) => !v)}
          >
            <Image 
              source={require('../../assets/ui/location_icon.png')} 
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
              <Image source={require('../../assets/avatar/image.png')} style={styles.profileBubbleImg} resizeMode="cover" />
            </TouchableOpacity>
          )}
        </View>

        {/* Dropdown Menu Overlay */}
        {dropdownVisible && (
          <View style={styles.dropdownMenu}>
            {cities.map((city, idx) => {
              const isActive = city._id === selectedCity?._id;
              return (
                <TouchableOpacity
                  key={city._id ?? String(idx)}
                  style={[styles.dropdownItem, idx === cities.length - 1 ? { borderBottomWidth: 0 } : null]}
                  onPress={() => handleCityChange(city)}
                >
                  <View style={styles.radioCircle}>
                    {isActive ? <View style={styles.radioDot} /> : null}
                  </View>
                  <Text style={[styles.dropdownItemText, isActive && styles.dropdownItemTextSelected]}>
                    {city.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Draggable My Trucks Card Overlay */}
        <PanGestureHandler onHandlerStateChange={handleDragGesture}>
          <View style={[
            styles.trucksCardOverlay, 
            { backgroundColor: colors.surface },
            isTrucksCardMinimized && styles.trucksCardMinimized,
            { transform: [{ translateY: dragY }] }
          ]}>
            <TouchableOpacity 
              style={styles.trucksCardHandle}
              onPress={() => setIsTrucksCardMinimized(!isTrucksCardMinimized)}
            >
              <View style={styles.handleBar} />
            </TouchableOpacity>
            
            <View style={styles.myTrucksHeader}>
              <Text style={[styles.myTrucksTitle, { color: colors.text }]}>My Trucks</Text>
              <TouchableOpacity style={styles.addButton} onPress={handleAddTruck}>
                <Image 
                  source={require('../../assets/ui/add_icon.png')} 
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
                    onPress={() => handleTruckPress(truck)}
                    style={styles.truckCardWrapper}
                    activeOpacity={0.7}
                  >
                    <TruckCard 
                      truck={truck} 
                      index={index}
                      dragY={truckDragPositions[truck._id] || 0}
                      onDrag={handleTruckCardDrag(truck._id)}
                      colors={colors}
                      isDark={isDark}
                    />
                  </TouchableOpacity>
                ))}
                {trucks.length === 0 && (
                  <View style={styles.emptyState}>
                    <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No trucks found for this city</Text>
                    <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddTruck}>
                      <Text style={[styles.emptyStateButtonText, { color: colors.text }]}>Add Your First Truck</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </PanGestureHandler>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

/* ---------------------------------- Styles --------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: tokens.spacing[3],
    fontSize: 16,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
  },

  /* header + dropdown */
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    marginTop: tokens.spacing[3],
    justifyContent: 'space-between', // Ensure proper spacing between dropdown and avatar
  },
  cityDropdown: {
    backgroundColor: '#87EA5C',
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 12, // Reduced padding since arrow is positioned absolutely
    shadowColor: '#87EA5C',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginRight: tokens.spacing[3], // Add margin to prevent overlap with avatar
    flex: 1, // Keep flex: 1 but with proper margin
    maxWidth: '85%', // Increased max width for longer city names
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
    lineHeight: 20, // Increased line height for better text rendering
    marginRight: 32, // Add margin to prevent text from overlapping with arrow
  },
  cityDropdownRight: {
    position: 'absolute',
    right: 8, // Moved closer to edge to give more space for text
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 24, // Slightly wider for better touch target
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
    marginLeft: 0, // Remove negative margin to prevent overlap
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileBubbleImg: { width: 34, height: 34, borderRadius: 17 },

  dropdownMenu: {
    backgroundColor: '#87EA5CCC', // 80% opacity when dropdown is open
    borderRadius: 16,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    position: 'absolute',
    top: 90, // Adjusted to account for new header position
    left: tokens.spacing[4],
    right: tokens.spacing[4],
    zIndex: 1001,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(8,52,0,0.20)',
    minHeight: 48,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#083400',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'transparent',
    flexShrink: 0,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#083400',
  },
  dropdownItemText: {
    color: '#083400',
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    lineHeight: 20,
    flex: 1,
    paddingRight: 8,
  },
  dropdownItemTextSelected: {
    fontFamily: 'Poppins_600SemiBold',
  },

  /* map */
  mapContainer: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  /* bottom list */
  bottomSection: {
    backgroundColor: '#F8F9FB',
    borderTopLeftRadius: tokens.radius.lg,
    borderTopRightRadius: tokens.radius.lg,
    borderTopWidth: 1,
    borderTopColor: '#E2E2E2',
    paddingTop: tokens.spacing[4],
    paddingHorizontal: tokens.spacing[4],
    height: height * 0.35,
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

  /* card */
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

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: tokens.spacing[8] },
  emptyStateText: { fontSize: 16, color: '#6D7E72', fontFamily: 'Poppins_400Regular', marginBottom: tokens.spacing[4] },
  emptyStateButton: {
    backgroundColor: '#87EA5C',
    borderRadius: tokens.radius.lg,
    paddingHorizontal: tokens.spacing[6],
    paddingVertical: tokens.spacing[3],
  },
  emptyStateButtonText: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: '#083400' },

  /* New Overlay Styles */
  headerOverlay: {
    position: 'absolute',
    top: tokens.spacing[6], // Increased from tokens.spacing[3] to add more margin top
    left: tokens.spacing[4],
    right: tokens.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 1000,
  },
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
});

const markerStyles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(135,234,92,0.25)',
  },
  img: { width: 28, height: 28 },
});

const addTruckStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8F9FB' 
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    marginTop: tokens.spacing[2],
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing[3],
  },
  backIcon: { 
    width: 24, 
    height: 24 
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
    textAlign: 'center',
    flex: 1,
    marginRight: 32, // To center the title
  },
  // Form container - matching Figma layout
  formContainer: {
    flex: 1,
    paddingHorizontal: tokens.spacing[4],
    paddingTop: tokens.spacing[6],
  },
  fieldGroup: { 
    marginBottom: tokens.spacing[8] 
  },
  labelContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: tokens.spacing[2] 
  },
  label: { 
    fontSize: 16, 
    fontFamily: 'Poppins_400Regular', 
    color: '#083400' 
  },
  requiredAsterisk: {
    color: '#FF0000',
    fontSize: 16,
    marginLeft: tokens.spacing[1],
    fontFamily: 'Poppins_400Regular',
  },
  // Dropdown styles
  dropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing[3],
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
  },
  dropdownTextPlaceholder: {
    color: '#DFDFDF',
  },
  dropdownTextSelected: {
    color: '#083400',
  },
  dropdownArrow: {
    fontSize: 16,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    marginTop: tokens.spacing[1],
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemSelected: {
    backgroundColor: '#F0F9E8',
  },
  dropdownItemText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
  },
  dropdownItemTextSelected: {
    color: '#53C920',
  },
  inputField: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    height: 54,
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing[3],
  },
  inputText: { 
    fontSize: 16, 
    fontFamily: 'Poppins_600SemiBold', 
    color: '#083400' 
  },
  saveButtonContainer: {
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[4],
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E2E2',
  },
  saveButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#53C920',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonDisabled: { 
    opacity: 0.6 
  },
  saveButtonText: { 
    fontSize: 18, 
    fontFamily: 'Poppins_600SemiBold', 
    color: '#083400' 
  },
});

export default HomePageScreen;
