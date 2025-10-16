import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '../theme/tokens';
import { trucksService, campaignsService } from '../services/services';
import { useTheme } from '../context/ThemeContext';
import { useCampaignRefresh } from '../context/CampaignRefreshContext';
import { useAlert } from '../context/AlertContext';

interface CampaignsScreenProps {
  truck: any;
  navigation?: any;
  onCampaignRemoved?: () => void;
}

const CampaignsScreen: React.FC<CampaignsScreenProps> = React.memo(({ truck, navigation, onCampaignRemoved }) => {
  const { colors, isDark } = useTheme();
  const { triggerRefresh } = useCampaignRefresh();
  const { showAlert } = useAlert();
  const [selectedCycle, setSelectedCycle] = useState<'cycle1' | 'cycle2'>('cycle1');
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cycleData, setCycleData] = useState<any>(null);
  const [reordering, setReordering] = useState(false);

  const loadCampaignData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading campaign data for truck:', truck._id, 'cycle:', selectedCycle);
      
      if (!truck || !truck._id) {
        console.log('No truck ID available');
        setCampaigns([]);
        setCycleData(null);
        return;
      }

      // Get current month's data
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
      
      console.log('Loading calendar data:', { startDate, endDate });
      const calendarData = await trucksService.getTruckCalendar(truck._id, startDate, endDate);
      console.log('Calendar data loaded:', calendarData);
      
      if (calendarData && typeof calendarData === 'object') {
        setCycleData(calendarData);
        
        // Filter campaigns for selected cycle
        const currentMonthCycles = (calendarData as any).availableCycles ? (calendarData as any).availableCycles.filter((cycle: any) => {
          const cycleStart = new Date(cycle.start);
          return cycleStart.getFullYear() === year && cycleStart.getMonth() === month - 1;
        }) : [];
        
        const targetCycle = currentMonthCycles.find((cycle: any) => {
          if (selectedCycle === 'cycle1') {
            return cycle.cycleNumber === 1 || cycle.cycleNumber === '1';
          } else {
            return cycle.cycleNumber === 2 || cycle.cycleNumber === '2';
          }
        });
        
        console.log('Target cycle found:', targetCycle);
        
        // Extract unique campaigns from the campaigns object
        const uniqueCampaigns = new Map();
        
        if (calendarData.campaigns && typeof calendarData.campaigns === 'object') {
          // Get campaigns for the selected cycle
          const startDay = selectedCycle === 'cycle1' ? 1 : 16;
          const endDay = selectedCycle === 'cycle1' ? 15 : 31;
          
          for (let day = startDay; day <= endDay; day++) {
            const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            
            if ((calendarData.campaigns as any)[dateStr] && Array.isArray((calendarData.campaigns as any)[dateStr])) {
              const dayCampaigns = (calendarData.campaigns as any)[dateStr];
              
              // Store unique ACTIVE campaigns by ID
              dayCampaigns.forEach((campaign: any) => {
                // Only store campaigns with status "active"
                if (campaign.status === 'active' && !uniqueCampaigns.has(campaign._id)) {
                  uniqueCampaigns.set(campaign._id, campaign);
                }
              });
            }
          }
        }
        
        const actualCampaigns = Array.from(uniqueCampaigns.values());
        console.log('Extracted unique ACTIVE campaigns for', selectedCycle, ':', actualCampaigns.length, 'campaigns');
        setCampaigns(actualCampaigns);
      } else {
        setCampaigns([]);
        setCycleData(null);
      }
    } catch (error) {
      console.error('Error loading campaign data:', error);
      showAlert({
        message: `Failed to load campaign data: ${error instanceof Error ? error.message : 'Please try again.'}`,
        type: 'error',
        title: 'Error'
      });
      setCampaigns([]);
      setCycleData(null);
    } finally {
      setLoading(false);
    }
  }, [truck, selectedCycle]);

  useEffect(() => {
    loadCampaignData();
  }, [loadCampaignData]);

  const handleBack = useCallback(() => {
    navigation?.goBack();
  }, [navigation]);

  const handleSave = useCallback(() => {
    console.log('Saving campaigns');
    navigation?.goBack();
  }, [navigation]);

  const handleAddVideo = useCallback(() => {
    if (navigation?.navigate) {
      navigation.navigate('AddVideoScreen', {
        truck,
        selectedCycle
      });
    } else {
      console.log('Navigation not available');
    }
  }, [navigation, truck, selectedCycle]);

  const handleCycleChange = useCallback((cycle: 'cycle1' | 'cycle2') => {
    setSelectedCycle(cycle);
  }, []);

  const handleDeleteCampaign = async (campaignId: string, campaignName: string) => {
    showAlert({
      title: 'Delete Campaign',
      message: `Are you sure you want to delete "${campaignName}"? This action cannot be undone.`,
      type: 'warning',
      buttons: [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Deleting campaign:', campaignId);
              await campaignsService.removeCampaign(campaignId);
              console.log('Campaign deleted successfully');
              
              // Reload campaign data to reflect the deletion
              await loadCampaignData();
              
              // Trigger global refresh for all screens
              triggerRefresh();
              
              // Notify parent screen to refresh its data
              onCampaignRemoved?.();
              
              showAlert({
                message: 'Campaign deleted successfully',
                type: 'success',
                title: 'Success'
              });
            } catch (error) {
              console.error('Error deleting campaign:', error);
              showAlert({
                message: `Failed to delete campaign: ${error instanceof Error ? error.message : 'Please try again.'}`,
                type: 'error',
                title: 'Error'
              });
            }
          },
        },
      ],
    });
  };

  const handleReorderCampaigns = async (newOrder: any[]) => {
    try {
      setReordering(true);
      
      // Update local state immediately for better UX
      setCampaigns(newOrder);
      
      // Prepare the reorder data for API
      const reorderData = newOrder.map((campaign, index) => ({
        campaign_id: campaign._id || campaign.id,
        play_order: index + 1 // play_order starts from 1
      }));
      
      console.log('Reordering campaigns:', reorderData);
      
      // Call the API to update play_order
      await trucksService.reorderCampaigns(truck._id, reorderData);
      
      console.log('Campaigns reordered successfully');
      
    } catch (error) {
      console.error('Error reordering campaigns:', error);
      
      // Revert to original order on error
      await loadCampaignData();
      
      showAlert({
        message: `Failed to reorder campaigns: ${error instanceof Error ? error.message : 'Please try again.'}`,
        type: 'error',
        title: 'Error'
      });
    } finally {
      setReordering(false);
    }
  };

  const handleMoveCampaign = async (campaignId: string, direction: 'up' | 'down') => {
    try {
      setReordering(true);
      
      const currentIndex = campaigns.findIndex(c => (c._id || c.id) === campaignId);
      if (currentIndex === -1) return;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      // Check bounds
      if (newIndex < 0 || newIndex >= campaigns.length) {
        setReordering(false);
        return;
      }
      
      // Create new order
      const newCampaigns = [...campaigns];
      const [movedCampaign] = newCampaigns.splice(currentIndex, 1);
      newCampaigns.splice(newIndex, 0, movedCampaign);
      
      console.log(`🔄 Moving campaign "${movedCampaign.campaign_name || movedCampaign.campaign}" from position ${currentIndex + 1} to ${newIndex + 1}`);
      console.log('Before reorder:', campaigns.map((c, i) => ({ name: c.campaign_name || c.campaign, play_order: c.play_order, position: i + 1 })));
      
      // Update local state immediately
      setCampaigns(newCampaigns);
      
      console.log('After reorder:', newCampaigns.map((c, i) => ({ name: c.campaign_name || c.campaign, play_order: c.play_order, position: i + 1 })));
      
      // Prepare the reorder data for bulk API call
      const reorderData = newCampaigns.map((campaign, index) => ({
        campaign_id: campaign._id || campaign.id,
        play_order: index + 1 // play_order starts from 1
      }));
      
      console.log('Reordering campaigns via bulk API:', reorderData);
      console.log('Truck ID:', truck._id);
      
      // Use the bulk reorder API instead of individual updates
      const result = await trucksService.reorderCampaigns(truck._id, reorderData);
      console.log('Reorder API result:', result);
      
      console.log('Campaign moved successfully');
      
      // Trigger global refresh to update other screens
      triggerRefresh();
      
      // Show success message
      showAlert({
        message: `Campaign moved to position ${newIndex + 1}`,
        type: 'success',
        title: 'Success'
      });
      
    } catch (error) {
      console.error('Error moving campaign:', error);
      
      // Revert to original order on error
      await loadCampaignData();
      
      showAlert({
        message: `Failed to move campaign: ${error instanceof Error ? error.message : 'Please try again.'}`,
        type: 'error',
        title: 'Error'
      });
    } finally {
      setReordering(false);
    }
  };

  const renderCampaignItem = (campaign: any, index: number) => (
    <View key={campaign._id || campaign.id} style={[styles.campaignCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.campaignContent}>
        <Image 
          source={require('../../assets/icons/image.png')} 
          style={styles.campaignLogo} 
          resizeMode="contain" 
        />
        <View style={styles.campaignInfo}>
          <Text style={[styles.campaignName, { color: colors.text }]}>{campaign.campaign_name || campaign.campaign}</Text>
          <Text style={[styles.companyName, { color: colors.text }]}>{campaign.company_name || campaign.company}</Text>
          {campaign.status && (
            <Text style={[styles.campaignStatus, { color: colors.textSecondary }]}>Status: {campaign.status}</Text>
          )}
          <Text style={[styles.playOrderText, { color: colors.textSecondary }]}>Order: {campaign.play_order || index + 1}</Text>
        </View>
        <View style={styles.campaignActions}>
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteCampaign(campaign._id || campaign.id, campaign.campaign_name || campaign.campaign)}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Reorder Controls */}
      <View style={[styles.reorderControls, { borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.reorderButton, index === 0 && styles.reorderButtonDisabled]}
          onPress={() => handleMoveCampaign(campaign._id || campaign.id, 'up')}
          disabled={index === 0 || reordering}
        >
          <Text style={styles.reorderButtonText}>↑</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.reorderButton, index === campaigns.length - 1 && styles.reorderButtonDisabled]}
          onPress={() => handleMoveCampaign(campaign._id || campaign.id, 'down')}
          disabled={index === campaigns.length - 1 || reordering}
        >
          <Text style={styles.reorderButtonText}>↓</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const getCurrentCycleInfo = () => {
    if (!cycleData) {
      return { availableSlots: 7, period: '1st - 15th', isFullyBooked: false };
    }

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    // Count unique campaigns for the selected cycle
    const uniqueCampaigns = new Set();
    
    if (cycleData.campaigns && typeof cycleData.campaigns === 'object') {
      const startDay = selectedCycle === 'cycle1' ? 1 : 16;
      const endDay = selectedCycle === 'cycle1' ? 15 : 31;
      
      for (let day = startDay; day <= endDay; day++) {
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        if ((cycleData.campaigns as any)[dateStr] && Array.isArray((cycleData.campaigns as any)[dateStr])) {
          const dayCampaigns = (cycleData.campaigns as any)[dateStr];
          
          // Add unique ACTIVE campaign IDs
          dayCampaigns.forEach((campaign: any) => {
            // Only count campaigns with status "active"
            if (campaign.status === 'active') {
              uniqueCampaigns.add(campaign._id);
            }
          });
        }
      }
    }
    
    const actualCampaignCount = uniqueCampaigns.size;
    const availableSlots = 7 - actualCampaignCount;
    const period = selectedCycle === 'cycle1' ? '1st - 15th' : '16th - 30th';
    const isFullyBooked = availableSlots <= 0;
    
    return { 
      availableSlots: Math.max(0, availableSlots), 
      period, 
      isFullyBooked,
      actualCampaignCount
    };
  };

  const getTimeAgo = (timestamp: string) => {
    try {
      const now = new Date();
      const lastSync = new Date(timestamp);
      const diffInMs = now.getTime() - lastSync.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

      if (diffInMinutes < 1) {
        return 'Just now';
      } else if (diffInMinutes < 60) {
        return `${diffInMinutes}min ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else {
        return `${diffInDays}d ago`;
      }
    } catch (error) {
      console.error('Error calculating time ago:', error);
      return 'Unknown';
    }
  };

  const cycleInfo = getCurrentCycleInfo();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image 
              source={require('../../assets/ui/back_icon.png')} 
              style={styles.backIcon} 
              resizeMode="contain" 
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Campaigns</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Truck Info Card */}
        <View style={[styles.truckInfoCard, { backgroundColor: colors.surface }]}>
          <Image 
            source={
              truck.status === 'online' 
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
          <View style={styles.truckInfo}>
            <Text style={[styles.truckPlate, { color: colors.text }]}>{truck.truck_number || truck.plate || 'Unknown Truck'}</Text>
            <Text style={[styles.truckRoute, { color: colors.text }]}>
              {truck.route && typeof truck.route === 'object' && 'route_name' in truck.route 
                ? truck.route.route_name 
                : truck.route || 'Unknown Route'}
            </Text>
            <Text style={[styles.lastSync, { color: colors.textSecondary }]}>
              Last Sync: {truck.last_heartbeat_at ? getTimeAgo(truck.last_heartbeat_at) : 'Unknown'}
            </Text>
            
            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: colors.surface }]}>
              <View style={[styles.statusDot, { backgroundColor: truck.status === 'online' ? tokens.colors.accent.online : tokens.colors.accent.offline }]} />
              <Text style={[styles.statusText, { color: colors.text }]}>{(truck.status || 'offline').toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Cycle Info */}
        <View style={styles.cycleInfo}>
          <Text style={[styles.cycleTitle, { color: colors.text }]}>
            {selectedCycle === 'cycle1' ? 'Cycle 1' : 'Cycle 2'}
          </Text>
          <View style={styles.cycleHeaderRight}>
            <Text style={[styles.cyclePeriod, { color: colors.textSecondary }]}>{cycleInfo.period}</Text>
            <TouchableOpacity 
              style={styles.dropdownButton}
              onPress={() => {
                // Toggle between cycle1 and cycle2
                handleCycleChange(selectedCycle === 'cycle1' ? 'cycle2' : 'cycle1');
              }}
            >
              <Text style={[styles.dropdownArrow, { color: colors.text }]}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Slots Available - Separate line as per Figma */}
        <View style={styles.slotsContainer}>
          <Text style={[
            styles.slotsAvailable, 
            { color: cycleInfo.isFullyBooked ? '#A92C0C' : '#3CA90C' }
          ]}>
            {cycleInfo.availableSlots} Slots Available
          </Text>
        </View>

        {/* Add Video Card - Positioned above campaigns */}
        <TouchableOpacity style={[styles.addVideoCard, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={handleAddVideo}>
          <View style={styles.addVideoIcon}>
            <Text style={styles.addVideoIconText}>+</Text>
          </View>
          <Text style={[styles.addVideoText, { color: colors.text }]}>Add Video</Text>
        </TouchableOpacity>

        {/* Campaigns List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <View style={[styles.loadingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={styles.loadingSpinner}
              />
              <Text style={[styles.loadingText, { color: colors.text }]}>Loading campaign data...</Text>
            </View>
          </View>
        ) : campaigns.length > 0 ? (
          <ScrollView style={styles.campaignsContainer} showsVerticalScrollIndicator={false}>
            {campaigns.map((campaign, index) => renderCampaignItem(campaign, index))}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.text }]}>No campaigns found for this cycle</Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
              Tap "Add Video" to create your first campaign
            </Text>
          </View>
        )}

        {/* Save Button */}
        <View style={[styles.saveButtonContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.surface, borderColor: colors.primary }]} onPress={handleSave}>
            <Text style={[styles.saveButtonText, { color: colors.text }]}>Save</Text>
          </TouchableOpacity>
        </View>
        </SafeAreaView>
    </SafeAreaProvider>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
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
    width: 18,
    height: 18,
  },
  title: {
    fontSize: tokens.typography.sizes.xl,
    fontWeight: tokens.typography.weights.semibold,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 32,
    height: 32,
  },
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
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.semibold,
    color: '#083400',
    marginBottom: tokens.spacing[1],
    fontFamily: 'Poppins_600SemiBold',
  },
  truckRoute: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.regular,
    color: '#083400',
    marginBottom: tokens.spacing[1],
    fontFamily: 'Poppins_600SemiBold',
  },
  lastSync: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.regular,
    color: '#083400',
    marginBottom: tokens.spacing[3],
    fontFamily: 'Poppins_600SemiBold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: tokens.colors.surface.white,
    borderRadius: 32,
    paddingHorizontal: tokens.spacing[3],
    paddingVertical: tokens.spacing[2],
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: tokens.spacing[2],
  },
  statusText: {
    fontSize: 10,
    fontWeight: tokens.typography.weights.regular,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
  },
  cycleInfo: {
    paddingHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slotsContainer: {
    paddingHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[4],
    alignItems: 'flex-end',
  },
  cycleTitle: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.semibold,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
  },
  cycleHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cyclePeriod: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.regular,
    color: '#083400',
    marginRight: tokens.spacing[2],
    fontFamily: 'Poppins_600SemiBold',
  },
  dropdownButton: {
    padding: tokens.spacing[1],
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
  },
  slotsAvailable: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.regular,
    color: '#3CA90C',
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'right',
  },
  campaignsContainer: {
    flex: 1,
    paddingHorizontal: tokens.spacing[4],
    paddingBottom: tokens.spacing[4],
  },
  campaignCard: {
    backgroundColor: tokens.colors.surface.white,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing[4],
    marginBottom: tokens.spacing[4],
    borderWidth: 1,
    borderColor: '#E2E2E2',
    minHeight: 120,
  },
  campaignContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: tokens.spacing[1],
  },
  campaignCardDragging: {
    backgroundColor: '#F0F9E8',
    borderColor: tokens.colors.brand.primary,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dragHandle: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing[2],
  },
  dragHandleText: {
    fontSize: 16,
    color: '#A0A0A0',
    fontWeight: 'bold',
  },
  campaignLogo: {
    width: 47,
    height: 47,
    marginRight: tokens.spacing[4],
  },
  campaignInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: tokens.spacing[1],
  },
  campaignActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playOrderText: {
    fontSize: tokens.typography.sizes.xs,
    color: tokens.colors.text.muted,
    fontFamily: 'Poppins_600SemiBold',
    marginTop: tokens.spacing[1],
  },
  reorderControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: tokens.spacing[3],
    paddingTop: tokens.spacing[3],
    borderTopWidth: 1,
    borderTopColor: '#E2E2E2',
  },
  reorderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: tokens.colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: tokens.spacing[2],
  },
  reorderButtonDisabled: {
    backgroundColor: '#E2E2E2',
  },
  reorderButtonText: {
    fontSize: 18,
    color: tokens.colors.surface.white,
    fontWeight: 'bold',
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF4D4D',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: tokens.spacing[2],
  },
  deleteButtonText: {
    color: tokens.colors.surface.white,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Poppins_600SemiBold',
  },
  campaignName: {
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.semibold,
    color: '#083400',
    marginBottom: tokens.spacing[1],
    fontFamily: 'Poppins_600SemiBold',
  },
  companyName: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.regular,
    color: '#083400',
    marginBottom: tokens.spacing[1],
    fontFamily: 'Poppins_600SemiBold',
  },
  addVideoCard: {
    backgroundColor: tokens.colors.surface.white,
    borderRadius: tokens.radius.lg,
    padding: tokens.spacing[4],
    marginHorizontal: tokens.spacing[4],
    marginBottom: tokens.spacing[4],
    borderWidth: 1,
    borderColor: '#E2E2E2',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    flexDirection: 'row',
  },
  addVideoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#87EA5C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: tokens.spacing[2],
  },
  addVideoIconText: {
    fontSize: 18,
    fontWeight: '600',
    color: tokens.colors.surface.white,
    fontFamily: 'Poppins_600SemiBold',
  },
  addVideoText: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.regular,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
  },
  saveButtonContainer: {
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[4],
    backgroundColor: tokens.colors.surface.white,
    borderTopWidth: 1,
    borderTopColor: '#E2E2E2',
  },
  saveButton: {
    backgroundColor: tokens.colors.surface.white,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: '#53C920',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.semibold,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: tokens.spacing[8],
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: tokens.spacing[2],
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6D7E72',
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E2E2',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
    textAlign: 'center',
  },
  campaignStatus: {
    fontSize: 12,
    color: '#6D7E72',
    fontFamily: 'Poppins_600SemiBold',
    marginTop: tokens.spacing[1],
  },
});

export default CampaignsScreen;
