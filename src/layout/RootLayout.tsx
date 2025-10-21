import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@/context/ThemeContext';
import { CampaignRefreshProvider } from '@/context/CampaignRefreshContext';
import { AlertProvider } from '@/context/AlertContext';
import AppNavigator from '@/navigation/AppNavigator';
import { User } from '@/types/api';

export default function RootLayout() {
  const [user, setUser] = useState<User | null>(null);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <ThemeProvider>
      <CampaignRefreshProvider>
        <AlertProvider>
          <AppNavigator 
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
          />
          <StatusBar style="auto" />
        </AlertProvider>
      </CampaignRefreshProvider>
    </ThemeProvider>
  );
}
