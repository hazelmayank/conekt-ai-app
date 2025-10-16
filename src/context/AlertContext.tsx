import React, { useState, useCallback } from 'react';
import CustomAlert from '../components/CustomAlert';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertState {
  visible: boolean;
  title?: string;
  message: string;
  buttons?: AlertButton[];
  type?: 'success' | 'error' | 'warning' | 'info';
}

interface AlertContextType {
  showAlert: (config: Omit<AlertState, 'visible'>) => void;
  hideAlert: () => void;
}

const AlertContext = React.createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    message: '',
  });

  const showAlert = useCallback((config: Omit<AlertState, 'visible'>) => {
    setAlertState({
      ...config,
      visible: true,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertState(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <CustomAlert
        visible={alertState.visible}
        title={alertState.title}
        message={alertState.message}
        buttons={alertState.buttons}
        type={alertState.type}
        onDismiss={hideAlert}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = React.useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

// Convenience functions for common alert types
export const showSuccessAlert = (message: string, title?: string, onPress?: () => void) => {
  // This will be used with the context
  return {
    message,
    title,
    type: 'success' as const,
    buttons: [{ text: 'OK', onPress }],
  };
};

export const showErrorAlert = (message: string, title?: string, onPress?: () => void) => {
  return {
    message,
    title,
    type: 'error' as const,
    buttons: [{ text: 'OK', onPress }],
  };
};

export const showWarningAlert = (message: string, title?: string, onPress?: () => void) => {
  return {
    message,
    title,
    type: 'warning' as const,
    buttons: [{ text: 'OK', onPress }],
  };
};

export const showConfirmAlert = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  title?: string
) => {
  return {
    message,
    title,
    type: 'warning' as const,
    buttons: [
      { text: 'Cancel', onPress: onCancel, style: 'cancel' as const },
      { text: 'Confirm', onPress: onConfirm, style: 'destructive' as const },
    ],
  };
};
