import { useState } from 'react';
import { apiService } from '@/services/apiService';
import { useAlert } from '@/context/AlertContext';

interface UseAuthProps {
  onLoginSuccess: (user: any) => void;
}

export const useAuth = ({ onLoginSuccess }: UseAuthProps) => {
  const { showAlert } = useAlert();
  
  // State
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [mode, setMode] = useState<'login' | 'create'>('create'); // Default to create account
  const [loading, setLoading] = useState(false);

  // Utility functions
  const validatePhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 10 && cleanPhone.length <= 15;
  };

  const formatPhoneNumber = (phone: string): string => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      return `+91${cleanPhone}`;
    }
    return `+${cleanPhone}`;
  };

  // Actions
  const handleCreateAccount = async () => {
    if (!phone.trim()) {
      showAlert({
        message: 'Please enter your phone number',
        type: 'error',
        title: 'Error'
      });
      return;
    }

    if (!name.trim()) {
      showAlert({
        message: 'Please enter your name',
        type: 'error',
        title: 'Error'
      });
      return;
    }

    const formattedPhone = formatPhoneNumber(phone);
    
    if (!validatePhoneNumber(formattedPhone)) {
      showAlert({
        message: 'Please enter a valid phone number',
        type: 'error',
        title: 'Error'
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Creating admin account:', { phone: formattedPhone, name });
      const response = await apiService.createAdmin(formattedPhone, name);
      console.log('Create admin response:', response);
      
      if (response.ok) {
        setStep('otp');
        showAlert({
          message: 'Account created! Please check your phone for the OTP.',
          type: 'success',
          title: 'Success'
        });
      } else {
        console.error('Create account failed:', response);
        showAlert({
          message: response.message || 'Failed to create account',
          type: 'error',
          title: 'Error'
        });
      }
    } catch (error) {
      console.error('Error creating account:', error);
      showAlert({
        message: `Failed to create account: ${error instanceof Error ? error.message : 'Please try again.'}`,
        type: 'error',
        title: 'Error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!phone.trim()) {
      showAlert({
        message: 'Please enter your phone number',
        type: 'error',
        title: 'Error'
      });
      return;
    }

    const formattedPhone = formatPhoneNumber(phone);
    
    if (!validatePhoneNumber(formattedPhone)) {
      showAlert({
        message: 'Please enter a valid phone number',
        type: 'error',
        title: 'Error'
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Sending login OTP:', { phone: formattedPhone });
      const response = await apiService.sendLoginOTP(formattedPhone);
      console.log('Login OTP response:', response);
      
      if (response.ok) {
        setStep('otp');
        showAlert({
          message: 'OTP sent! Please check your phone for the verification code.',
          type: 'success',
          title: 'Success'
        });
      } else {
        console.error('Login OTP failed:', response);
        showAlert({
          message: response.message || 'Failed to send OTP',
          type: 'error',
          title: 'Error'
        });
      }
    } catch (error) {
      console.error('Error sending login OTP:', error);
      showAlert({
        message: `Failed to send OTP: ${error instanceof Error ? error.message : 'Please try again.'}`,
        type: 'error',
        title: 'Error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      showAlert({
        message: 'Please enter the OTP',
        type: 'error',
        title: 'Error'
      });
      return;
    }

    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(phone);
      console.log('Verifying OTP:', { phone: formattedPhone, otp, mode });
      
      let response;
      if (mode === 'create') {
        response = await apiService.verifyAdminAccount(formattedPhone, otp);
        
        // Admin account verification now returns JWT token
        if (response.ok && response.user) {
          console.log('Admin account verified successfully:', response.user);
          showAlert({
            message: 'Account created and logged in successfully!',
            type: 'success',
            title: 'Success'
          });
          onLoginSuccess(response.user);
        } else {
          console.error('Admin account verification failed:', response);
          showAlert({
            message: response.message || 'Invalid OTP',
            type: 'error',
            title: 'Error'
          });
        }
      } else {
        // Login verification - this returns JWT token
        response = await apiService.verifyLoginOTP(formattedPhone, otp);
        
        if (response.ok && response.user) {
          console.log('Login successful:', response.user);
          showAlert({
            message: 'Login successful!',
            type: 'success',
            title: 'Success'
          });
          onLoginSuccess(response.user);
        } else {
          console.error('Login verification failed:', response);
          showAlert({
            message: response.message || 'Invalid OTP',
            type: 'error',
            title: 'Error'
          });
        }
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      showAlert({
        message: `Invalid OTP: ${error instanceof Error ? error.message : 'Please try again.'}`,
        type: 'error',
        title: 'Error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setOtp('');
  };

  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const formattedPhone = formatPhoneNumber(phone);
      console.log('Resending OTP:', { phone: formattedPhone, mode });
      
      let response;
      if (mode === 'create') {
        response = await apiService.createAdmin(formattedPhone, name);
      } else {
        response = await apiService.sendLoginOTP(formattedPhone);
      }
      
      console.log('Resend OTP response:', response);
      
      if (response.ok) {
        showAlert({
          message: 'OTP resent! Please check your phone.',
          type: 'success',
          title: 'Success'
        });
      } else {
        showAlert({
          message: response.message || 'Failed to resend OTP',
          type: 'error',
          title: 'Error'
        });
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      showAlert({
        message: `Failed to resend OTP: ${error instanceof Error ? error.message : 'Please try again.'}`,
        type: 'error',
        title: 'Error'
      });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'create' ? 'login' : 'create');
    setStep('phone');
    setPhone('');
    setName('');
    setOtp('');
  };

  const handleSkipAuth = () => {
    showAlert({
      title: 'Skip Authentication',
      message: 'You will have full access to all app features.',
      type: 'info',
      buttons: [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: async () => {
            // Create a full-access demo user
            const demoUser = {
              id: 'demo-user',
              phone: '+919876543210',
              name: 'Demo User',
              role: 'admin',
              isDemo: true
            };
            
            // Use the provided JWT token for demo users
            const demoJWTToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGU2NzFmNTZhNGY1NjQyYzNlM2M4MjMiLCJpYXQiOjE3NjA2OTIzNDMsImV4cCI6MTc2MzI4NDM0M30.PsmKtuDRlGLlWieiWVO4820Vp1XYBUAqax_PI4jpZyU';
            
            try {
              // Set the JWT token for demo users
              await apiService.saveToken(demoJWTToken);
              console.log('Demo user logged in with provided JWT token');
              onLoginSuccess(demoUser);
            } catch (error) {
              console.error('Error setting demo token:', error);
              showAlert({
                message: 'Failed to set demo mode. Please try again.',
                type: 'error',
                title: 'Error'
              });
            }
          },
        },
      ],
    });
  };

  return {
    // State
    state: {
      phone,
      name,
      otp,
      step,
      mode,
      loading,
    },
    // Actions
    actions: {
      setPhone,
      setName,
      setOtp,
      handleCreateAccount,
      handleLogin,
      handleVerifyOTP,
      handleBackToPhone,
      handleResendOTP,
      switchMode,
      handleSkipAuth,
    },
  };
};
