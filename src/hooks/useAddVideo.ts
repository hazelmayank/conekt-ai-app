import { useState, useEffect } from 'react';
import { campaignsService, trucksService } from '@/services/services';
import { useCampaignRefresh } from '@/context/CampaignRefreshContext';
import { useAlert } from '@/context/AlertContext';
import { Truck } from '@/types/api';

interface UseAddVideoProps {
  navigation?: any;
  truck?: Truck;
  selectedCycle?: 'cycle1' | 'cycle2';
  selectedVideo?: any;
  onVideoSelected?: (video: any) => void;
  formData?: any;
  onFormDataChange?: (data: any) => void;
  onCampaignCreated?: () => void;
}

export const useAddVideo = ({
  navigation,
  truck,
  selectedCycle = 'cycle1',
  selectedVideo: propSelectedVideo,
  onVideoSelected,
  formData,
  onFormDataChange,
  onCampaignCreated
}: UseAddVideoProps) => {
  const { triggerRefresh } = useCampaignRefresh();
  const { showAlert } = useAlert();
  
  // State
  const [campaignName, setCampaignName] = useState(formData?.campaignName || '');
  const [company, setCompany] = useState(formData?.company || '');
  const [packageType, setPackageType] = useState<'half_month' | 'full_month'>(formData?.packageType || 'half_month');
  const [selectedVideo, setSelectedVideo] = useState<any>(propSelectedVideo || null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [calculatedPlayOrder, setCalculatedPlayOrder] = useState<number | null>(null);

  // Update selectedVideo when prop changes
  useEffect(() => {
    if (propSelectedVideo) {
      setSelectedVideo(propSelectedVideo);
    }
  }, [propSelectedVideo]);

  // Update form fields when formData prop changes (when returning from FilesScreen)
  useEffect(() => {
    if (formData) {
      setCampaignName(formData.campaignName || '');
      setCompany(formData.company || '');
      setPackageType(formData.packageType || 'half_month');
    }
  }, [formData]);

  // Calculate and display play order when component mounts or truck/cycle changes
  useEffect(() => {
    const calculatePlayOrder = async () => {
      try {
        const playOrder = await getNextPlayOrder();
        setCalculatedPlayOrder(playOrder);
      } catch (error) {
        console.error('Error calculating play order for display:', error);
        setCalculatedPlayOrder(null);
      }
    };

    if (truck?._id && selectedCycle) {
      calculatePlayOrder();
    }
  }, [truck?._id, selectedCycle]);

  // Update form data when it changes
  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange({
        campaignName,
        company,
        packageType,
        selectedCycle,
        truck
      });
    }
  }, [campaignName, company, packageType, selectedCycle, truck, onFormDataChange]);

  // Debug: Log truck information
  useEffect(() => {
    console.log('AddVideoScreen - Truck prop:', truck);
    console.log('AddVideoScreen - Truck ID:', truck?._id);
    console.log('AddVideoScreen - Selected Cycle:', selectedCycle);
  }, [truck, selectedCycle]);

  const getStartDate = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    if (selectedCycle === 'cycle1') {
      return `${year}-${month.toString().padStart(2, '0')}-01`;
    } else {
      return `${year}-${month.toString().padStart(2, '0')}-16`;
    }
  };

  const getNextPlayOrder = async (): Promise<number> => {
    try {
      if (!truck || !truck._id) {
        console.log('No truck ID available, using default play_order 1');
        return 1;
      }

      // Get current month's data to find existing campaigns
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;
      
      console.log('Getting existing campaigns for play_order calculation:', { startDate, endDate });
      
      const calendarData = await trucksService.getTruckCalendar(truck._id, startDate, endDate);
      console.log('Calendar data received:', calendarData);
      console.log('Calendar campaigns structure:', calendarData?.campaigns);
      
      if (!calendarData || !calendarData.campaigns) {
        console.log('No existing campaigns found, using play_order 1');
        return 1;
      }

      // Find campaigns for the selected cycle
      const cycleCampaigns: any[] = [];
      
      if (calendarData.campaigns && typeof calendarData.campaigns === 'object') {
        const startDay = selectedCycle === 'cycle1' ? 1 : 16;
        const endDay = selectedCycle === 'cycle1' ? 15 : 31;
        
        for (let day = startDay; day <= endDay; day++) {
          const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
          
          if ((calendarData.campaigns as any)[dateStr] && Array.isArray((calendarData.campaigns as any)[dateStr])) {
            const dayCampaigns = (calendarData.campaigns as any)[dateStr];
            
            // Add unique ACTIVE campaigns
            dayCampaigns.forEach((campaign: any) => {
              if (campaign.status === 'active' && !cycleCampaigns.find(c => c._id === campaign._id)) {
                cycleCampaigns.push(campaign);
              }
            });
          }
        }
      }

      console.log(`📋 Found ${cycleCampaigns.length} campaigns for ${selectedCycle}:`, cycleCampaigns.map(c => ({ 
        id: c._id, 
        name: c.campaign_name, 
        play_order: c.play_order,
        status: c.status 
      })));

      // Find the highest play_order in the cycle
      let maxPlayOrder = 0;
      cycleCampaigns.forEach(campaign => {
        if (campaign.play_order && campaign.play_order > maxPlayOrder) {
          maxPlayOrder = campaign.play_order;
        }
      });

      const nextPlayOrder = maxPlayOrder + 1;
      
      // Validate that we don't exceed the maximum slots (7 per cycle)
      if (nextPlayOrder > 7) {
        console.warn(`⚠️ Maximum slots reached for ${selectedCycle}. Current campaigns: ${cycleCampaigns.length}, next play_order would be: ${nextPlayOrder}`);
        throw new Error(`Maximum of 7 campaigns allowed per cycle. Current cycle has ${cycleCampaigns.length} campaigns.`);
      }
      
      console.log(`📊 Play order calculation: Found ${cycleCampaigns.length} existing campaigns, max play_order: ${maxPlayOrder}, next: ${nextPlayOrder}`);
      
      return nextPlayOrder;
      
    } catch (error) {
      console.error('Error calculating next play_order:', error);
      console.error('Error details:', {
        error: error instanceof Error ? error.message : String(error),
        truckId: truck?._id,
        selectedCycle,
        errorType: typeof error
      });
      // Fallback to 1 if there's an error
      return 1;
    }
  };

  const selectVideo = () => {
    // Store current form data before navigating
    const formData = {
      campaignName,
      company,
      packageType,
      selectedCycle,
      truck
    };
    
    // Navigate to FilesScreen for video selection
    navigation?.navigate?.('FilesScreen', {
      onVideoSelected: (video: any) => {
        console.log('Video selected from FilesScreen:', video);
        setSelectedVideo(video);
        // Call the callback to update parent state
        onVideoSelected?.(video);
        showAlert({
          message: `Video selected: ${video.filename}`,
          type: 'success',
          title: 'Success'
        });
      },
      selectionMode: true,
      formData // Pass form data to maintain state
    });
  };

  const handleBack = () => {
    navigation?.goBack();
  };

  const handleUpload = async () => {
    try {
      setUploading(true);
      
      // Validate form
      if (!campaignName.trim()) {
        showAlert({
          message: 'Please enter a campaign name',
          type: 'error',
          title: 'Error'
        });
        return;
      }
      
      if (!company.trim()) {
        showAlert({
          message: 'Please enter a company name',
          type: 'error',
          title: 'Error'
        });
        return;
      }
      
      if (!selectedVideo) {
        showAlert({
          message: 'Please select a video to upload',
          type: 'error',
          title: 'Error'
        });
        return;
      }
      
      if (!truck || !truck._id) {
        console.error('Truck information missing:', { truck, truckId: truck?._id });
        showAlert({
          message: 'Truck information is missing. Please go back and try again.',
          type: 'error',
          title: 'Error'
        });
        return;
      }

      console.log('Creating campaign with data:', {
        campaignName,
        company,
        packageType,
        selectedCycle,
        truckId: truck._id,
        selectedVideo: selectedVideo
      });

      // Use the selected video's ID directly (video is already uploaded)
      if (!selectedVideo._id) {
        showAlert({
          message: 'Selected video is missing ID. Please select a video again.',
          type: 'error',
          title: 'Error'
        });
        return;
      }

      console.log('Using existing video ID:', selectedVideo._id);

      // Calculate the next play_order automatically
      const nextPlayOrder = await getNextPlayOrder();
      console.log('Calculated next play_order:', nextPlayOrder);

      // Create campaign using the existing video
      console.log('Creating campaign...');
      const campaignData = await campaignsService.createCampaign({
        campaign_name: campaignName.trim(),
        company_name: company.trim(),
        truck_id: truck._id,
        video_id: selectedVideo._id, // Use the existing video ID
        package_type: packageType,
        start_date: getStartDate(),
        play_order: nextPlayOrder // Automatically calculated play order
      });

      console.log('Campaign created:', campaignData);
      
      showAlert({
        message: 'Campaign created successfully!',
        type: 'success',
        title: 'Success',
        buttons: [{
          text: 'OK',
          onPress: () => {
            // Clear form data after successful creation
            setCampaignName('');
            setCompany('');
            setPackageType('half_month');
            setSelectedVideo(null);
            
            // Trigger global refresh for all screens
            triggerRefresh();
            // Call the callback to refresh campaign data in parent screen
            onCampaignCreated?.();
            
            // Navigate back to TruckDetailsScreen instead of HomePageScreen
            // Check if we have a specific navigation method for going back to truck details
            if (navigation?.navigateToTruckDetails) {
              navigation.navigateToTruckDetails();
            } else {
              // Fallback to goBack if no specific method is available
              navigation?.goBack();
            }
          }
        }]
      });
      
    } catch (error) {
      console.error('Error creating campaign:', error);
      showAlert({
        message: `Failed to create campaign: ${error instanceof Error ? error.message : 'Please try again.'}`,
        type: 'error',
        title: 'Error'
      });
    } finally {
      setUploading(false);
    }
  };

  return {
    // State
    state: {
      campaignName,
      company,
      packageType,
      selectedVideo,
      loading,
      uploading,
      calculatedPlayOrder,
    },
    // Actions
    actions: {
      setCampaignName,
      setCompany,
      setPackageType,
      selectVideo,
      handleBack,
      handleUpload,
      getStartDate,
    }
  };
};
