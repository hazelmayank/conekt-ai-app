import React from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import LoadingScreen from '@/components/LoadingScreen';
import TruckDetailsScreen from './TruckDetailsScreen';
import AddTruckScreen from './AddTruckScreen';

// Home components
import HomeHeader from '@/components/home/HomeHeader';
import CityDropdownMenu from '@/components/home/CityDropdownMenu';
import MapViewSection from '@/components/home/MapViewSection';
import TrucksCardOverlay from '@/components/home/TrucksCardOverlay';

// Custom hook
import { useHomePage } from '@/hooks/useHomePage';

const HomePageScreen: React.FC<{
  onNavigateToProfile?: () => void;
  navigation?: any;
}> = ({ onNavigateToProfile, navigation }) => {
  const { colors, isDark } = useTheme();
  
  const {
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
  } = useHomePage();

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

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Map Section */}
        <MapViewSection 
          trucks={trucks}
          selectedCity={selectedCity}
          mapRef={mapRef}
        />

        {/* Header Overlay */}
        <HomeHeader
          selectedCity={selectedCity}
          dropdownVisible={dropdownVisible}
          onCityDropdownPress={() => setDropdownVisible((v) => !v)}
          onNavigateToProfile={onNavigateToProfile}
        />

        {/* Dropdown Menu Overlay */}
        {dropdownVisible && (
          <CityDropdownMenu
            cities={cities}
            selectedCity={selectedCity}
            onCitySelect={handleCityChange}
          />
        )}

        {/* Trucks Card Overlay */}
        <TrucksCardOverlay
          trucks={trucks}
          isTrucksCardMinimized={isTrucksCardMinimized}
          dragY={dragY}
          truckDragPositions={truckDragPositions}
          colors={colors}
          isDark={isDark}
          onDragGesture={handleDragGesture}
          onToggleMinimized={() => setIsTrucksCardMinimized(!isTrucksCardMinimized)}
          onAddTruck={handleAddTruck}
          onTruckPress={handleTruckPress}
          onTruckCardDrag={handleTruckCardDrag}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
});

export default HomePageScreen;
