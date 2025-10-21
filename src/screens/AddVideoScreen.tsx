import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';
import { tokens } from '@/theme/tokens';
import { Truck } from '@/types/api';

// AddVideo components
import AddVideoHeader from '@/components/addvideo/AddVideoHeader';
import CampaignNameInput from '@/components/addvideo/CampaignNameInput';
import CompanyInput from '@/components/addvideo/CompanyInput';
import PackageTypeSelector from '@/components/addvideo/PackageTypeSelector';
import CycleInfoCard from '@/components/addvideo/CycleInfoCard';
import VideoSelector from '@/components/addvideo/VideoSelector';
import CreateCampaignButton from '@/components/addvideo/CreateCampaignButton';

// Custom hook
import { useAddVideo } from '@/hooks/useAddVideo';

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
  
  const {
    // State
    state: { campaignName, company, packageType, selectedVideo, uploading, calculatedPlayOrder },
    // Actions
    actions: { setCampaignName, setCompany, setPackageType, selectVideo, handleBack, handleUpload, getStartDate },
  } = useAddVideo({
    navigation,
    truck,
    selectedCycle,
    selectedVideo: propSelectedVideo,
    onVideoSelected,
    formData,
    onFormDataChange,
    onCampaignCreated
  });

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <AddVideoHeader onBack={handleBack} colors={colors} />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Campaign Name Section */}
          <CampaignNameInput 
            value={campaignName}
            onChangeText={setCampaignName}
            colors={colors}
          />

          {/* Company Section */}
          <CompanyInput 
            value={company}
            onChangeText={setCompany}
            colors={colors}
          />

          {/* Package Type Section */}
          <PackageTypeSelector 
            packageType={packageType}
            onPackageTypeChange={setPackageType}
            colors={colors}
          />

          {/* Cycle Info */}
          <CycleInfoCard 
            selectedCycle={selectedCycle}
            startDate={getStartDate()}
            calculatedPlayOrder={calculatedPlayOrder}
            colors={colors}
          />

          {/* Attach Video Section */}
          <VideoSelector 
            selectedVideo={selectedVideo}
            onSelectVideo={selectVideo}
            colors={colors}
          />
        </ScrollView>

        {/* Upload Button */}
        <CreateCampaignButton 
          uploading={uploading}
          onPress={handleUpload}
          colors={colors}
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
  content: {
    flex: 1,
    paddingHorizontal: tokens.spacing[4],
  },
});

export default AddVideoScreen;
