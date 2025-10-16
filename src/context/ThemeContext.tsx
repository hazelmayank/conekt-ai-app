import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'device';

interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  secondary: string;
  error: string;
  success: string;
}

interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
}

const lightColors: ThemeColors = {
  background: '#F8F9FB',
  surface: '#FFFFFF',
  text: '#083400',
  textSecondary: '#6D7E72',
  border: '#E2E2E2',
  primary: '#87EA5C',
  secondary: '#53C920',
  error: '#FF5A5A',
  success: '#36D39A',
};

const darkColors: ThemeColors = {
  background: '#121411',
  surface: '#1A1B19',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#333333',
  primary: '#87EA5C',
  secondary: '#53C920',
  error: '#FF5A5A',
  success: '#36D39A',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('device');
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load saved theme from AsyncStorage
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme');
        if (savedTheme && ['light', 'dark', 'device'].includes(savedTheme)) {
          setThemeState(savedTheme as ThemeMode);
        }
      } catch (error) {
        console.error('Failed to load theme from storage:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadTheme();

    // Listen to system theme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme === 'dark' ? 'dark' : 'light');
    });

    // Set initial system theme
    setSystemTheme(Appearance.getColorScheme() === 'dark' ? 'dark' : 'light');

    return () => subscription?.remove();
  }, []);

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem('appTheme', newTheme);
    } catch (error) {
      console.error('Failed to save theme to storage:', error);
    }
  };

  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (theme === 'device') {
      return systemTheme;
    }
    return theme;
  };

  const effectiveTheme = getEffectiveTheme();
  const colors = effectiveTheme === 'dark' ? darkColors : lightColors;
  const isDark = effectiveTheme === 'dark';

  const value: ThemeContextType = {
    theme,
    colors,
    setTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
