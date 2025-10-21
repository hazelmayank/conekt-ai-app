import { useState, useEffect, useCallback } from 'react';
import { trucksService, campaignsService } from '@/services/services';
import { useCampaignRefresh } from '@/context/CampaignRefreshContext';
import { useAlert } from '@/context/AlertContext';

interface UseCampaignsProps {
  truck: any;
  navigation?: any;
  onCampaignRemoved?: () => void;
}

export const useCampaigns = ({ truck, navigation, onCampaignRemoved }: UseCampaignsProps) => {
  const { triggerRefresh } = useCampaignRefresh();
  const { showAlert } = useAlert();
  
  // State
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
  }, [truck, selectedCycle, showAlert]);

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

  const handleDeleteCampaign = useCallback(async (campaignId: string, campaignName: string) => {
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
  }, [showAlert, loadCampaignData, triggerRefresh, onCampaignRemoved]);

  const handleReorderCampaigns = useCallback(async (newOrder: any[]) => {
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
  }, [truck._id, showAlert, loadCampaignData]);

  const handleMoveCampaign = useCallback(async (campaignId: string, direction: 'up' | 'down') => {
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
  }, [campaigns, truck._id, showAlert, loadCampaignData, triggerRefresh]);

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

  const getTruckStatus = () => {
    // If truck has explicit status, use it
    if (truck.status) {
      return truck.status.toLowerCase();
    }
    
    // Otherwise, determine status based on last heartbeat
    if (!truck.last_heartbeat_at) {
      return 'offline';
    }
    
    try {
      const now = new Date();
      const lastHeartbeat = new Date(truck.last_heartbeat_at);
      const diffInMs = now.getTime() - lastHeartbeat.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      
      // Consider truck online if last heartbeat was within 5 minutes
      return diffInMinutes <= 5 ? 'online' : 'offline';
    } catch (error) {
      console.error('Error calculating truck status:', error);
      return 'offline';
    }
  };

  return {
    // State
    state: {
      selectedCycle,
      campaigns,
      loading,
      cycleData,
      reordering,
    },
    // Actions
    actions: {
      handleBack,
      handleSave,
      handleAddVideo,
      handleCycleChange,
      handleDeleteCampaign,
      handleReorderCampaigns,
      handleMoveCampaign,
      getCurrentCycleInfo,
      getTimeAgo,
      getTruckStatus,
    }
  };
};
