import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';

// Campaigns components
import CampaignsHeader from '@/components/campaigns/CampaignsHeader';
import TruckInfoCard from '@/components/campaigns/TruckInfoCard';
import CycleSelector from '@/components/campaigns/CycleSelector';
import SlotsIndicator from '@/components/campaigns/SlotsIndicator';
import AddVideoCard from '@/components/campaigns/AddVideoCard';
import CampaignsList from '@/components/campaigns/CampaignsList';
import EmptyState from '@/components/campaigns/EmptyState';
import LoadingCard from '@/components/campaigns/LoadingCard';
import SaveButton from '@/components/campaigns/SaveButton';

// Custom hook
import { useCampaigns } from '@/hooks/useCampaigns';

interface CampaignsScreenProps {
  truck: any;
  navigation?: any;
  onCampaignRemoved?: () => void;
}

const CampaignsScreen: React.FC<CampaignsScreenProps> = ({ truck, navigation, onCampaignRemoved }) => {
  const { colors, isDark } = useTheme();
  
  const {
    // State
    state: { selectedCycle, campaigns, loading, reordering },
    // Actions
    actions: { 
      handleBack, 
      handleSave, 
      handleAddVideo, 
      handleCycleChange, 
      handleDeleteCampaign, 
      handleMoveCampaign,
      getCurrentCycleInfo,
      getTimeAgo,
      getTruckStatus,
    }
  } = useCampaigns({ truck, navigation, onCampaignRemoved });

  const cycleInfo = getCurrentCycleInfo();
  const truckStatus = getTruckStatus() as 'online' | 'offline';

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <CampaignsHeader onBack={handleBack} colors={colors} />

        {/* Truck Info Card */}
        <TruckInfoCard 
          truck={truck}
          lastSyncText={truck.last_heartbeat_at ? getTimeAgo(truck.last_heartbeat_at) : 'Unknown'}
          truckStatus={truckStatus}
          isDark={isDark}
          colors={colors}
        />

        {/* Cycle Info */}
        <CycleSelector 
          selectedCycle={selectedCycle}
          cyclePeriod={cycleInfo.period}
          onCycleChange={handleCycleChange}
          colors={colors}
        />
        
        {/* Slots Available */}
        <SlotsIndicator 
          availableSlots={cycleInfo.availableSlots}
          isFullyBooked={cycleInfo.isFullyBooked}
        />

        {/* Add Video Card */}
        <AddVideoCard onPress={handleAddVideo} colors={colors} />

        {/* Campaigns List */}
        {loading ? (
          <LoadingCard colors={colors} />
        ) : campaigns.length > 0 ? (
          <CampaignsList 
            campaigns={campaigns}
            reordering={reordering}
            onDeleteCampaign={handleDeleteCampaign}
            onMoveCampaign={handleMoveCampaign}
            colors={colors}
          />
        ) : (
          <EmptyState colors={colors} />
        )}

        {/* Save Button */}
        <SaveButton onPress={handleSave} colors={colors} />
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

export default CampaignsScreen;