import { useState, useEffect } from 'react';
import { trucksService } from '@/services/services';
import { useCampaignRefresh } from '@/context/CampaignRefreshContext';
import { useAlert } from '@/context/AlertContext';

interface UseTruckDetailsProps {
  truck: any;
  navigation?: any;
}

export const useTruckDetails = ({ truck, navigation }: UseTruckDetailsProps) => {
  const { refreshTrigger } = useCampaignRefresh();
  const { showAlert } = useAlert();
  
  // State
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [campaignData, setCampaignData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pushingPlaylist, setPushingPlaylist] = useState(false);

  useEffect(() => {
    loadCampaignData();
  }, []);

  // Watch for refresh trigger changes (when campaigns are modified)
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('🔄 Campaign refresh triggered, reloading data...');
      loadCampaignData();
    }
  }, [refreshTrigger]);

  // Add a refresh function that can be called when returning from AddVideoScreen
  const refreshCampaignData = () => {
    loadCampaignData();
  };

  const loadCampaignData = async () => {
    try {
      setLoading(true);
      
      // Check if truck has valid ID
      if (!truck || !truck._id) {
        console.log('No truck ID available, using mock data');
        setCampaignData({ availableCycles: [] });
        return;
      }
      
      console.log('Loading campaign data for truck:', truck._id);
      
      // Get current month's data
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // 0-indexed, so add 1
      
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
      
      console.log('Loading calendar data:', { startDate, endDate });
      const calendarData = await trucksService.getTruckCalendar(truck._id, startDate, endDate);
      console.log('Calendar data loaded:', calendarData);
      console.log('Calendar data type:', typeof calendarData);
      console.log('Calendar data keys:', Object.keys(calendarData || {}));
      
      // Handle the actual API response structure
      if (calendarData && typeof calendarData === 'object') {
        console.log('Setting campaign data with calendar data');
        setCampaignData(calendarData);
      } else {
        console.log('No calendar data found, setting empty data');
        setCampaignData({ campaigns: {} });
      }
    } catch (error) {
      console.error('Error loading campaign data:', error);
      showAlert({
        message: `Failed to load campaign data: ${error instanceof Error ? error.message : 'Please try again.'}`,
        type: 'error',
        title: 'Error'
      });
      // Set empty data on error to prevent crashes
      setCampaignData({ availableCycles: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (showCampaigns) {
      setShowCampaigns(false);
    } else {
      navigation?.goBack();
    }
  };

  const handleAddCampaigns = () => {
    setShowCampaigns(true);
  };

  const handlePushPlaylist = async () => {
    if (!truck || !truck._id) {
      showAlert({
        message: 'Truck information is missing',
        type: 'error',
        title: 'Error'
      });
      return;
    }

    try {
      setPushingPlaylist(true);
      
      // Get today's date in YYYY-MM-DD format
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      
      console.log('Pushing playlist for truck:', truck._id, 'date:', todayString);
      
      const result = await trucksService.pushPlaylist(truck._id, todayString);
      
      console.log('Playlist push result:', result);
      
      showAlert({
        title: 'Success',
        message: `Playlist pushed successfully!\n\nCampaigns: ${result.campaignCount}\nVersion: ${result.version}\nStatus: ${result.pushStatus}`,
        type: 'success',
        buttons: [{ text: 'OK' }]
      });
      
    } catch (error) {
      console.error('Error pushing playlist:', error);
      showAlert({
        message: `Failed to push playlist: ${error instanceof Error ? error.message : 'Please try again.'}`,
        type: 'error',
        title: 'Error'
      });
    } finally {
      setPushingPlaylist(false);
    }
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

  const getStatusDisplayText = () => {
    const status = getTruckStatus();
    return status.toUpperCase();
  };

  const getCycleCounts = () => {
    // Add comprehensive null checks
    if (!campaignData) {
      console.log('No campaign data available');
      return { cycle1: 0, cycle2: 0 };
    }

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    // Count unique campaigns for each cycle
    let cycle1Campaigns = new Set();
    let cycle2Campaigns = new Set();
    
    if (campaignData.campaigns && typeof campaignData.campaigns === 'object') {
      // Count unique campaigns for each day in the current month
      for (let day = 1; day <= 31; day++) {
        const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        if ((campaignData.campaigns as any)[dateStr] && Array.isArray((campaignData.campaigns as any)[dateStr])) {
          const dayCampaigns = (campaignData.campaigns as any)[dateStr];
          
          // Add unique ACTIVE campaign IDs to the appropriate cycle set
          dayCampaigns.forEach((campaign: any) => {
            // Only count campaigns with status "active"
            if (campaign.status === 'active') {
              if (day <= 15) {
                // Cycle 1: 1st to 15th
                cycle1Campaigns.add(campaign._id);
              } else {
                // Cycle 2: 16th to 30th/31st
                cycle2Campaigns.add(campaign._id);
              }
            }
          });
        }
      }
    }
    
    const cycle1Count = cycle1Campaigns.size;
    const cycle2Count = cycle2Campaigns.size;
    
    console.log('Unique ACTIVE campaign counts:', { 
      cycle1: cycle1Count, 
      cycle2: cycle2Count,
      cycle1CampaignIds: Array.from(cycle1Campaigns),
      cycle2CampaignIds: Array.from(cycle2Campaigns)
    });
    
    return { cycle1: cycle1Count, cycle2: cycle2Count };
  };

  return {
    // State
    state: {
      showCampaigns,
      campaignData,
      loading,
      pushingPlaylist,
    },
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
  };
};
