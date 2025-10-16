import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '../theme/tokens';
import CampaignsScreen from './CampaignsScreen';
import { trucksService } from '../services/services';
import { useTheme } from '../context/ThemeContext';
import { useCampaignRefresh } from '../context/CampaignRefreshContext';
import { useAlert } from '../context/AlertContext';

const { width } = Dimensions.get('window');

interface TruckDetailsScreenProps {
  truck: any;
  navigation?: any;
}

const TruckDetailsScreen: React.FC<TruckDetailsScreenProps> = ({ truck, navigation }) => {
  const { colors, isDark } = useTheme();
  const { refreshTrigger } = useCampaignRefresh();
  const { showAlert } = useAlert();
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
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image 
              source={require('../../assets/ui/back_icon.png')} 
              style={styles.backIcon} 
              resizeMode="contain" 
            />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>My Truck</Text>
        </View>

        {/* Truck Image */}
        <View style={styles.truckImageContainer}>
          <Image 
            source={
              getTruckStatus() === 'online'
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

        {/* Truck Info Card */}
        <View style={[styles.truckInfoCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.truckPlate, { color: colors.text }]}>{truck.truck_number || truck.plate || 'KA 25 AA 7007'}</Text>
          <Text style={[styles.truckRoute, { color: colors.text }]}>
            {truck.route && typeof truck.route === 'object' && 'route_name' in truck.route 
              ? truck.route.route_name 
              : truck.route || 'Indranagar Route'}
          </Text>
          <Text style={[styles.lastSync, { color: colors.textSecondary }]}>
            Last Sync: {truck.last_heartbeat_at ? getTimeAgo(truck.last_heartbeat_at) : 'Unknown'}
          </Text>
          
          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <View style={styles.statusIndicator}>
              <View style={[
                styles.statusDotOuter,
                { backgroundColor: getTruckStatus() === 'online' ? '#53C920' : '#FF4D4D' }
              ]}>
                <View style={styles.statusDotInner} />
              </View>
            </View>
            <Text style={[styles.statusText, { color: colors.text }]}>{getStatusDisplayText()}</Text>
          </View>
        </View>

        {/* Month Header */}
        <View style={styles.monthHeader}>
          <Image 
            source={require('../../assets/icons/calendar_month.png')} 
            style={[styles.calendarIcon, { tintColor: colors.text }]} 
            resizeMode="contain" 
          />
          <Text style={[styles.monthText, { color: colors.text }]}>
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
        </View>

        {/* Campaign Cards */}
        <ScrollView style={styles.campaignsContainer} showsVerticalScrollIndicator={false}>
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
          ) : (
            <>
              {/* Cycle 1 */}
              <View style={[styles.campaignCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.campaignHeader}>
                  <Text style={[styles.cycleTitle, { color: colors.text }]}>Cycle 1</Text>
                  <Text style={[styles.cyclePeriod, { color: colors.textSecondary }]}>Oct 1 - 15</Text>
                </View>
                <View style={styles.campaignDetails}>
                  <Text style={[styles.slotsText, { color: colors.text }]}>
                    {getCycleCounts().cycle1}/7 slots filled
                  </Text>
                  <Text style={[
                    styles.statusText, 
                    { color: getCycleCounts().cycle1 >= 7 ? '#A92C0C' : '#FFA100' }
                  ]}>
                    {getCycleCounts().cycle1 >= 7 ? 'Full' : 'Available'}
                  </Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View style={[
                    styles.progressFill, 
                    { 
                      width: `${(getCycleCounts().cycle1 / 7) * 100}%`, 
                      backgroundColor: getCycleCounts().cycle1 >= 7 ? '#A92C0C' : '#FFA200' 
                    }
                  ]} />
                </View>
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.actionButton, 
                      { backgroundColor: colors.surface, borderColor: colors.primary },
                      getCycleCounts().cycle1 >= 7 && { borderColor: '#A92C0C' }
                    ]} 
                    onPress={handleAddCampaigns}
                  >
                    <Text style={[styles.actionButtonText, { color: colors.text }]}>
                      {getCycleCounts().cycle1 >= 7 ? 'View Campaigns' : 'Add Campaigns'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.pushNowButton, { backgroundColor: colors.primary }]} 
                    onPress={handlePushPlaylist}
                  >
                    <Text style={[styles.pushNowButtonText, { color: colors.text }]}>Push Now</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Cycle 2 */}
              <View style={[styles.campaignCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.campaignHeader}>
                  <Text style={[styles.cycleTitle, { color: colors.text }]}>Cycle 2</Text>
                  <Text style={[styles.cyclePeriod, { color: colors.textSecondary }]}>Oct 16 - 30</Text>
                </View>
                <View style={styles.campaignDetails}>
                  <Text style={[styles.slotsText, { color: colors.text }]}>
                    {getCycleCounts().cycle2}/7 slots filled
                  </Text>
                  <Text style={[
                    styles.statusText, 
                    { color: getCycleCounts().cycle2 >= 7 ? '#A92C0C' : '#FFA100' }
                  ]}>
                    {getCycleCounts().cycle2 >= 7 ? 'Full' : 'Available'}
                  </Text>
                </View>
                <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                  <View style={[
                    styles.progressFill, 
                    { 
                      width: `${(getCycleCounts().cycle2 / 7) * 100}%`, 
                      backgroundColor: getCycleCounts().cycle2 >= 7 ? '#A92C0C' : '#FFA200' 
                    }
                  ]} />
                </View>
                <View style={styles.actionButtonsContainer}>
                  <TouchableOpacity 
                    style={[
                      styles.actionButton, 
                      { backgroundColor: colors.surface, borderColor: colors.primary },
                      getCycleCounts().cycle2 >= 7 && { borderColor: '#A92C0C' }
                    ]} 
                    onPress={handleAddCampaigns}
                  >
                    <Text style={[styles.actionButtonText, { color: colors.text }]}>
                      {getCycleCounts().cycle2 >= 7 ? 'View Campaigns' : 'Add Campaigns'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.pushNowButton, { backgroundColor: colors.primary }]} 
                    onPress={handlePushPlaylist}
                  >
                    <Text style={[styles.pushNowButtonText, { color: colors.text }]}>Push Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#87EA5C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backIcon: {
    width: 18,
    height: 18,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
    textAlign: 'center',
    flex: 1,
    marginRight: 32, // To center the title
  },
  truckImageContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  truckImage: {
    width: 76,
    height: 63,
  },
  truckInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  truckPlate: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
    marginBottom: 2,
  },
  truckRoute: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#083400',
    marginBottom: 2,
  },
  lastSync: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#083400',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    marginRight: 8,
  },
  statusDotOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(10, 207, 237, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDotInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0ACFED',
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Inter',
    color: '#083400',
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  calendarIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  monthText: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
  },
  campaignsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  campaignCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E2E2',
  },
  campaignHeader: {
    marginBottom: 12,
  },
  cycleTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
    marginBottom: 2,
  },
  cyclePeriod: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#083400',
  },
  campaignDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  slotsText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#083400',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E2E2E2',
    borderRadius: 2,
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#53C920',
    height: 44,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
  },
  pushNowButton: {
    backgroundColor: '#87EA5C',
    borderRadius: 12,
    height: 44,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pushNowButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
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
});

export default TruckDetailsScreen;
