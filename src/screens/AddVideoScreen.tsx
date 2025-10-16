import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '../theme/tokens';
import { useTheme } from '../context/ThemeContext';
import { campaignsService, videosService, trucksService } from '../services/services';
import { Truck } from '../types/api';
import { useCampaignRefresh } from '../context/CampaignRefreshContext';
import { useAlert } from '../context/AlertContext';

interface AddVideoScreenProps {
  navigation?: any;
  truck?: Truck;
  selectedCycle?: 'cycle1' | 'cycle2';
  selectedVideo?: any;
  onVideoSelected?: (video: any) => void;
  formData?: any;
  onFormDataChange?: (data: any) => void;
  onCampaignCreated?: () => void;
}

const AddVideoScreen: React.FC<AddVideoScreenProps> = ({ 
  navigation, 
  truck, 
  selectedCycle = 'cycle1',
  selectedVideo: propSelectedVideo,
  onVideoSelected,
  formData,
  onFormDataChange,
  onCampaignCreated
}) => {
  const { colors, isDark } = useTheme();
  const { triggerRefresh } = useCampaignRefresh();
  const { showAlert } = useAlert();
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
          <Text style={[styles.title, { color: colors.text }]}>Add Video</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Campaign Name Section */}
          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Campaign Name</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                value={campaignName}
                onChangeText={setCampaignName}
                placeholder="Enter campaign name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          {/* Company Section */}
          <View style={styles.section}>
            <View style={styles.labelContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Company</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                value={company}
                onChangeText={setCompany}
                placeholder="Enter company name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </View>

          {/* Package Type Section */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Package Type</Text>
            <View style={styles.packageContainer}>
              <TouchableOpacity 
                style={[
                  styles.packageOption, 
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  packageType === 'half_month' && styles.packageOptionSelected
                ]}
                onPress={() => setPackageType('half_month')}
              >
                <Text style={[
                  styles.packageText,
                  { color: colors.text },
                  packageType === 'half_month' && styles.packageTextSelected
                ]}>
                  Half Month (15 days)
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.packageOption, 
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  packageType === 'full_month' && styles.packageOptionSelected
                ]}
                onPress={() => setPackageType('full_month')}
              >
                <Text style={[
                  styles.packageText,
                  { color: colors.text },
                  packageType === 'full_month' && styles.packageTextSelected
                ]}>
                  Full Month (30 days)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Cycle Info */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Selected Cycle</Text>
            <View style={[styles.cycleInfoContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cycleInfoText, { color: colors.text }]}>
                {selectedCycle === 'cycle1' ? 'Cycle 1 (1st - 15th)' : 'Cycle 2 (16th - 30th)'}
              </Text>
              <Text style={[styles.cycleInfoSubtext, { color: colors.textSecondary }]}>
                Start Date: {getStartDate()}
              </Text>
              {calculatedPlayOrder && (
                <Text style={[styles.cycleInfoSubtext, { color: colors.primary, fontWeight: 'bold' }]}>
                  Play Order: {calculatedPlayOrder}/7
                </Text>
              )}
            </View>
          </View>

          {/* Attach Video Section */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Attach Video</Text>
            <TouchableOpacity style={[styles.uploadContainer, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={selectVideo}>
              {selectedVideo ? (
                <View style={styles.selectedVideoCard}>
                  <View style={styles.videoInfoHeader}>
                    <Image 
                      source={require('../../assets/ui/upload.png')} 
                      style={[styles.videoFileIcon, { tintColor: colors.success }]}
                      resizeMode="contain"
                    />
                    <Text style={[styles.selectedVideoText, { color: colors.success }]}>✓ Video Selected</Text>
                  </View>
                  <Text style={[styles.selectedVideoName, { color: colors.text }]} numberOfLines={2} ellipsizeMode="middle">
                    {selectedVideo.filename}
                  </Text>
                  <View style={styles.videoDetailsRow}>
                    <Text style={[styles.selectedVideoSize, { color: colors.textSecondary }]}>
                      {selectedVideo.file_size_mb ? `${selectedVideo.file_size_mb.toFixed(1)} MB` : 'Size unknown'}
                    </Text>
                    <Text style={[styles.selectedVideoDuration, { color: colors.textSecondary }]}>
                      Duration: {Math.floor(selectedVideo.duration_sec / 60)}:{(selectedVideo.duration_sec % 60).toString().padStart(2, '0')}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.uploadPrompt}>
                  <Image 
                    source={require('../../assets/ui/upload.png')} 
                    style={styles.uploadIcon}
                    resizeMode="contain"
                  />
                  <Text style={[styles.uploadText, { color: colors.textSecondary }]}>Choose from Library{'\n'}or upload new video</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Upload Button */}
        <View style={[styles.uploadButtonContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.uploadButton, { backgroundColor: colors.surface, borderColor: colors.primary }, uploading && styles.uploadButtonDisabled]} 
            onPress={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={[styles.uploadButtonText, { color: colors.text }]}>Create Campaign</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
    height: 24,
  },
  title: {
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '600',
    fontSize: 20,
    lineHeight: 20, // 100% of font size
    letterSpacing: 0,
    color: '#083400',
    textAlign: 'center',
    flex: 1,
    width: 105,
    height: 30,
    opacity: 1,
  },
  headerSpacer: {
    width: 32,
    height: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: tokens.spacing[4],
  },
  section: {
    marginBottom: tokens.spacing[6],
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing[3],
  },
  label: {
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.regular,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
  },
  required: {
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.regular,
    color: '#FF0000',
    fontFamily: 'Poppins_600SemiBold',
    marginLeft: tokens.spacing[1],
  },
  inputContainer: {
    backgroundColor: tokens.colors.surface.white,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    height: 54,
    justifyContent: 'center',
    paddingHorizontal: tokens.spacing[3],
  },
  input: {
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.semibold,
    color: '#083400', // Fixed: Changed from placeholder color to proper text color
    fontFamily: 'Poppins_600SemiBold',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing[6],
  },
  halfSection: {
    flex: 1,
    marginRight: tokens.spacing[2],
  },
  uploadContainer: {
    backgroundColor: tokens.colors.surface.white,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    minHeight: 120,
    maxHeight: 150,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[3],
    width: '100%',
    maxWidth: '100%',
  },
  uploadIcon: {
    width: 50,
    height: 50,
    marginBottom: tokens.spacing[2],
  },
  uploadText: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.regular,
    color: '#083400',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  uploadButtonContainer: {
    paddingHorizontal: tokens.spacing[4],
    paddingVertical: tokens.spacing[4],
    backgroundColor: tokens.colors.surface.white,
    borderTopWidth: 1,
    borderTopColor: '#E2E2E2',
  },
  uploadButton: {
    backgroundColor: tokens.colors.surface.white,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: '#53C920',
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: tokens.typography.sizes.lg,
    fontWeight: tokens.typography.weights.semibold,
    color: '#083400',
    fontFamily: 'Poppins_400Regular',
  },
  packageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  packageOption: {
    flex: 1,
    backgroundColor: tokens.colors.surface.white,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[3],
    marginRight: tokens.spacing[2],
    alignItems: 'center',
  },
  packageOptionSelected: {
    borderColor: '#53C920',
    backgroundColor: '#F0F9E8',
  },
  packageText: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.regular,
    color: '#6D7E72',
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
  packageTextSelected: {
    color: '#083400',
    fontWeight: tokens.typography.weights.semibold,
  },
  cycleInfoContainer: {
    backgroundColor: tokens.colors.surface.white,
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    paddingVertical: tokens.spacing[3],
    paddingHorizontal: tokens.spacing[3],
  },
  cycleInfoText: {
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.semibold,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: tokens.spacing[1],
  },
  cycleInfoSubtext: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.regular,
    color: '#6D7E72',
    fontFamily: 'Poppins_600SemiBold',
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  selectedVideoCard: {
    width: '100%',
    maxWidth: '100%',
    paddingHorizontal: tokens.spacing[2],
    paddingVertical: tokens.spacing[2],
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  videoInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: tokens.spacing[2],
  },
  videoFileIcon: {
    width: 24,
    height: 24,
    marginRight: tokens.spacing[2],
    tintColor: '#53C920',
  },
  videoDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: tokens.spacing[1],
    width: '100%',
    flexWrap: 'wrap',
  },
  uploadPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedVideoText: {
    fontSize: tokens.typography.sizes.md,
    fontWeight: tokens.typography.weights.semibold,
    color: '#53C920',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: tokens.spacing[1],
  },
  selectedVideoName: {
    fontSize: tokens.typography.sizes.sm,
    fontWeight: tokens.typography.weights.regular,
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'left',
    marginBottom: tokens.spacing[1],
    flexWrap: 'wrap',
    maxWidth: '100%',
    width: '100%',
    paddingHorizontal: 0,
  },
  selectedVideoSize: {
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.regular,
    color: '#6D7E72',
    fontFamily: 'Poppins_600SemiBold',
  },
  selectedVideoDuration: {
    fontSize: tokens.typography.sizes.xs,
    fontWeight: tokens.typography.weights.regular,
    color: '#6D7E72',
    fontFamily: 'Poppins_600SemiBold',
    marginTop: 2,
  },
});

export default AddVideoScreen;
