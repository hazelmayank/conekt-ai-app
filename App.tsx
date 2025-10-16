import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Poppins_400Regular, Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { ThemeProvider } from './src/context/ThemeContext';
import { CampaignRefreshProvider } from './src/context/CampaignRefreshContext';
import { AlertProvider } from './src/context/AlertContext';

import HomePageScreen from './src/screens/HomePageScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AuthScreen from './src/screens/AuthScreen';
import FilesScreen from './src/screens/FilesScreen';
import AddVideoScreen from './src/screens/AddVideoScreen';
import TruckDetailsScreen from './src/screens/TruckDetailsScreen';
import LoadingScreen from './src/components/LoadingScreen';
import { apiService } from './src/services/apiService';
import { User } from './src/types/api';

export default function App() {
  return (
    <ThemeProvider>
      <CampaignRefreshProvider>
        <AlertProvider>
          <AppContent />
        </AlertProvider>
      </CampaignRefreshProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const [currentScreen, setCurrentScreen] = useState<'auth' | 'home' | 'profile' | 'files' | 'addVideo' | 'truckDetails'>('auth');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addVideoParams, setAddVideoParams] = useState<any>(null);
  const [videoSelectionCallback, setVideoSelectionCallback] = useState<((video: any) => void) | null>(null);
  const [selectedVideoForCampaign, setSelectedVideoForCampaign] = useState<any>(null);
  const [addVideoFormData, setAddVideoFormData] = useState<any>(null);
  const [selectedTruckForDetails, setSelectedTruckForDetails] = useState<any>(null);

  // --- Load Poppins fonts once for the whole app ---
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
  });

  // Make Poppins the default font for all <Text /> (optional, nice DX)
  useEffect(() => {
    if (!fontsLoaded) return;
    const oldRender = Text.render;
    Text.render = function (...args) {
      const origin = oldRender.call(this, ...args);
      // If a component already set fontFamily, we respect it; otherwise apply Poppins Regular
      const merged = Array.isArray(origin.props.style)
        ? [{ fontFamily: 'Poppins_400Regular' }, ...origin.props.style]
        : [{ fontFamily: 'Poppins_400Regular' }, origin.props.style];

      return React.cloneElement(origin, { style: merged });
    };
    // no clean-up needed for Expo lifecycle here
  }, [fontsLoaded]);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      await apiService.loadToken();
      const isAuthenticated = apiService.isAuthenticated();
      if (isAuthenticated) {
        const userData = await apiService.getStoredUser();
        if (userData) {
          setUser(userData);
        } else {
          setUser({
            id: '1',
            phone: '+919876543210',
            name: 'Nitin',
            role: 'admin',
          } as User);
        }
        setCurrentScreen('home');
      } else {
        setCurrentScreen('auth');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setCurrentScreen('auth');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
    if ((userData as any).isDemo) {
      console.log('Demo user logged in with full access');
    }
    setCurrentScreen('home');
  };

  const handleNavigateToProfile = () => setCurrentScreen('profile');
  const handleNavigateToFiles = () => setCurrentScreen('files');

  const handleNavigateToAddVideo = (screenName: string, params?: any) => {
    // Clear previous state when navigating to AddVideoScreen for a new campaign
    setSelectedVideoForCampaign(null);
    setAddVideoFormData(null);
    
    // Store the truck information for navigation back to truck details
    if (params?.truck) {
      setSelectedTruckForDetails(params.truck);
    }
    
    setAddVideoParams(params);
    setCurrentScreen('addVideo');
  };

  const handleNavigateToFilesFromAddVideo = (onVideoSelected: (video: any) => void, formData?: any) => {
    setCurrentScreen('files');
    setVideoSelectionCallback(() => onVideoSelected);
    if (formData) {
      setAddVideoFormData(formData);
    }
  };

  const handleVideoSelected = (video: any) => {
    if (videoSelectionCallback) videoSelectionCallback(video);
    setSelectedVideoForCampaign(video);
    setVideoSelectionCallback(null);
    // Don't clear addVideoFormData here - we want to preserve it when returning from video selection
    setCurrentScreen('addVideo');
  };

  const handleBackToHome = () => {
    // Clear all AddVideoScreen related state when going back to home
    setSelectedVideoForCampaign(null);
    setAddVideoFormData(null);
    setAddVideoParams(null);
    setVideoSelectionCallback(null);
    setSelectedTruckForDetails(null);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('auth');
  };

  // Gate on fonts first so UI never flashes with a fallback font
  if (!fontsLoaded) {
    return (
      <>
        <LoadingScreen message="Loading fonts..." />
        <StatusBar style="auto" />
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <LoadingScreen message="Connecting to Conekt..." />
        <StatusBar style="auto" />
      </>
    );
  }

  if (currentScreen === 'auth') {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    );
  }

  if (currentScreen === 'profile') {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ProfileScreen
          user={user}
          navigation={{
            goBack: handleBackToHome,
            navigate: (screen: string) => {
              if (screen === 'FilesScreen') handleNavigateToFiles();
            },
          }}
          onLogout={handleLogout}
        />
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    );
  }

  if (currentScreen === 'addVideo') {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AddVideoScreen
          navigation={{
            goBack: () => setCurrentScreen('home'),
            navigate: (screen: string, params?: any) => {
              if (screen === 'FilesScreen') {
                handleNavigateToFilesFromAddVideo(params?.onVideoSelected, params?.formData);
              }
            },
            navigateToTruckDetails: () => {
              // Navigate back to truck details screen with the selected truck
              if (selectedTruckForDetails) {
                setCurrentScreen('truckDetails');
              } else {
                // Fallback to home if no truck is selected
                setCurrentScreen('home');
              }
            }
          }}
          truck={addVideoParams?.truck}
          selectedCycle={addVideoParams?.selectedCycle}
          selectedVideo={selectedVideoForCampaign}
          onVideoSelected={(video) => setSelectedVideoForCampaign(video)}
          formData={addVideoFormData}
          onFormDataChange={setAddVideoFormData}
          onCampaignCreated={addVideoParams?.onCampaignCreated}
        />
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    );
  }

  if (currentScreen === 'truckDetails' && selectedTruckForDetails) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <TruckDetailsScreen
          truck={selectedTruckForDetails}
          navigation={{
            goBack: () => {
              setSelectedTruckForDetails(null);
              setCurrentScreen('home');
            },
            navigate: (screenName: string, params?: any) => {
              if (screenName === 'AddVideoScreen') {
                handleNavigateToAddVideo(screenName, params);
              }
            },
          }}
        />
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    );
  }

  if (currentScreen === 'files') {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <FilesScreen
          navigation={{
            goBack: () => {
              if (videoSelectionCallback) {
                setVideoSelectionCallback(null);
                setCurrentScreen('addVideo');
              } else {
                setCurrentScreen('profile');
              }
            },
          }}
          onVideoSelected={videoSelectionCallback ? handleVideoSelected : undefined}
          selectionMode={!!videoSelectionCallback}
        />
        <StatusBar style="auto" />
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HomePageScreen
        onNavigateToProfile={handleNavigateToProfile}
        navigation={{ navigate: handleNavigateToAddVideo }}
      />
      <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}
