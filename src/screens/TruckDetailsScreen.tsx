import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import CampaignsScreen from './CampaignsScreen';

// TruckDetails components
import TruckDetailsHeader from '@/components/truckdetails/TruckDetailsHeader';
import TruckImageSection from '@/components/truckdetails/TruckImageSection';
import TruckInfoCard from '@/components/truckdetails/TruckInfoCard';
import MonthHeader from '@/components/truckdetails/MonthHeader';
import CampaignCard from '@/components/truckdetails/CampaignCard';
import LoadingCard from '@/components/truckdetails/LoadingCard';

// Custom hook
import { useTruckDetails } from '@/hooks/useTruckDetails';

interface TruckDetailsScreenProps {
  truck: any;
  navigation?: any;
}

const TruckDetailsScreen: React.FC<TruckDetailsScreenProps> = ({ truck, navigation }) => {
  const { colors, isDark } = useTheme();
  
  const {
    // State
    state: { showCampaigns, loading },
    // Actions
    actions: { 
      handleBack, 
      handleAddCampaigns, 
      handlePushPlaylist, 
      refreshCampaignData,
      getTimeAgo,
      getTruckStatus,
      getStatusDisplayText,
      getCycleCounts,
    }
  } = useTruckDetails({ truck, navigation });

  const truckStatus = getTruckStatus() as 'online' | 'offline';
  const cycleCounts = getCycleCounts();

  return (
    <SafeAreaProvider>
      {showCampaigns ? (
        <CampaignsScreen 
          truck={truck}
          navigation={{ 
            goBack: handleBack,
            navigate: (screen: string, params?: any) => {
              if (screen === 'AddVideoScreen') {
                // Pass the navigation function to parent with truck info and refresh callback
                navigation?.navigate?.('AddVideoScreen', {
                  ...params,
                  truck: truck, // Include truck information
                  onCampaignCreated: refreshCampaignData // Callback to refresh data
                });
              }
            },
            navigateToTruckDetails: handleBack // Method to navigate back to truck details
          }}
          onCampaignRemoved={refreshCampaignData} // Callback to refresh data when campaign is removed
        />
      ) : (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Header */}
          <TruckDetailsHeader onBack={handleBack} colors={colors} />

          {/* Truck Image */}
          <TruckImageSection truckStatus={truckStatus} isDark={isDark} />

          {/* Truck Info Card */}
          <TruckInfoCard 
            truck={truck}
            lastSyncText={truck.last_heartbeat_at ? getTimeAgo(truck.last_heartbeat_at) : 'Unknown'}
            statusText={getStatusDisplayText()}
            truckStatus={truckStatus}
            colors={colors}
          />

          {/* Month Header */}
          <MonthHeader colors={colors} />

          {/* Campaign Cards */}
          <ScrollView style={styles.campaignsContainer} showsVerticalScrollIndicator={false}>
            {loading ? (
              <LoadingCard colors={colors} />
            ) : (
              <>
                {/* Cycle 1 */}
                <CampaignCard 
                  cycleNumber={1}
                  cyclePeriod="Oct 1 - 15"
                  slotsFilled={cycleCounts.cycle1}
                  maxSlots={7}
                  isFull={cycleCounts.cycle1 >= 7}
                  onAddCampaigns={handleAddCampaigns}
                  onPushPlaylist={handlePushPlaylist}
                  colors={colors}
                />

                {/* Cycle 2 */}
                <CampaignCard 
                  cycleNumber={2}
                  cyclePeriod="Oct 16 - 30"
                  slotsFilled={cycleCounts.cycle2}
                  maxSlots={7}
                  isFull={cycleCounts.cycle2 >= 7}
                  onAddCampaigns={handleAddCampaigns}
                  onPushPlaylist={handlePushPlaylist}
                  colors={colors}
                />
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      )}
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  campaignsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default TruckDetailsScreen;
