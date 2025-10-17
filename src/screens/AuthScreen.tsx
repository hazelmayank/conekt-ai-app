import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '../theme/tokens';
import { apiService } from '../services/apiService';
import { useTheme } from '../context/ThemeContext';
import { useAlert } from '../context/AlertContext';

interface AuthScreenProps {
  onLoginSuccess: (user: any) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const { colors, isDark } = useTheme();
  const { showAlert } = useAlert();
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [mode, setMode] = useState<'login' | 'create'>('create'); // Default to create account
  const [loading, setLoading] = useState(false);

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

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Welcome to Conekt</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {step === 'phone' 
                  ? (mode === 'create' 
                      ? 'Create your admin account' 
                      : 'Login to your account')
                  : 'Enter the OTP sent to your phone'
                }
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {step === 'phone' ? (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                      placeholder="9876543210 or +919876543210"
                      placeholderTextColor={colors.textSecondary}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      autoComplete="tel"
                    />
                  </View>

                  {mode === 'create' && (
                    <View style={styles.inputContainer}>
                      <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                        placeholder="Enter your full name"
                        placeholderTextColor={colors.textSecondary}
                        value={name}
                        onChangeText={setName}
                        autoComplete="name"
                      />
                    </View>
                  )}

                  <TouchableOpacity 
                    style={[styles.button, loading && styles.buttonDisabled]} 
                    onPress={mode === 'create' ? handleCreateAccount : handleLogin}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.buttonText, { color: colors.text }]}>
                        {mode === 'create' ? 'Create Account' : 'Send OTP'}
                      </Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.switchButton} 
                    onPress={switchMode}
                    disabled={loading}
                  >
                    <Text style={[styles.switchButtonText, { color: colors.textSecondary }]}>
                      {mode === 'create' 
                        ? 'Already have an account? Login' 
                        : 'Don\'t have an account? Create one'
                      }
                    </Text>
                  </TouchableOpacity>

                  {/* Skip Authentication Button */}
                  <View style={styles.skipContainer}>
                    <Text style={[styles.skipHint, { color: colors.textSecondary }]}>Don't have a verified number?</Text>
                    <TouchableOpacity 
                      style={styles.skipButton} 
                      onPress={handleSkipAuth}
                    >
                      <Text style={[styles.skipButtonText, { color: colors.text }]}>Skip for now</Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: colors.text }]}>OTP Code</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                      placeholder="Enter 6-digit OTP"
                      placeholderTextColor={colors.textSecondary}
                      value={otp}
                      onChangeText={(text) => {
                        console.log('OTP Input changed:', text);
                        setOtp(text);
                      }}
                      keyboardType="number-pad"
                      maxLength={6}
                      editable={true}
                      autoFocus={true}
                      selectTextOnFocus={true}
                      returnKeyType="done"
                      onSubmitEditing={handleVerifyOTP}
                    />
                    <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                      Check your SMS for the verification code
                    </Text>
                  </View>

                  <TouchableOpacity 
                    style={[styles.button, loading && styles.buttonDisabled]} 
                    onPress={handleVerifyOTP}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.buttonText, { color: colors.text }]}>Verify OTP</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.secondaryButton} 
                    onPress={handleBackToPhone}
                    disabled={loading}
                  >
                    <Text style={styles.secondaryButtonText}>Back to Phone</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.resendButton} 
                    onPress={handleResendOTP}
                    disabled={loading}
                  >
                    <Text style={[styles.resendButtonText, { color: colors.text }]}>Resend OTP</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: tokens.spacing[6],
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: tokens.spacing[8],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: tokens.spacing[2],
  },
  subtitle: {
    fontSize: 16,
    color: '#6D7E72',
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    marginBottom: tokens.spacing[8],
  },
  inputContainer: {
    marginBottom: tokens.spacing[6],
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: tokens.spacing[2],
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    height: 56,
    paddingHorizontal: tokens.spacing[4],
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#083400',
    textAlign: 'center', // Center the text for better UX
    letterSpacing: 2, // Add spacing between digits for better readability
  },
  helpText: {
    fontSize: 12,
    color: '#6D7E72',
    fontFamily: 'Poppins_600SemiBold',
    marginTop: tokens.spacing[2],
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#87EA5C',
    borderRadius: tokens.radius.lg,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing[4],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#083400',
    fontFamily: 'Poppins_600SemiBold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: '#87EA5C',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: tokens.spacing[4],
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#87EA5C',
    fontFamily: 'Poppins_600SemiBold',
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: tokens.spacing[3],
  },
  switchButtonText: {
    fontSize: 16,
    color: '#6D7E72',
    fontFamily: 'Poppins_600SemiBold',
    textDecorationLine: 'underline',
  },
  skipContainer: {
    alignItems: 'center',
    marginTop: tokens.spacing[4],
    marginBottom: tokens.spacing[2],
  },
  skipHint: {
    fontSize: 14,
    color: '#6D7E72',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: tokens.spacing[2],
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderRadius: tokens.radius.lg,
    borderWidth: 1,
    borderColor: '#87EA5C',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing[6],
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#87EA5C',
    fontFamily: 'Poppins_600SemiBold',
  },
  resendButton: {
    alignItems: 'center',
    paddingVertical: tokens.spacing[2],
  },
  resendButtonText: {
    fontSize: 14,
    color: '#87EA5C',
    fontFamily: 'Poppins_600SemiBold',
    textDecorationLine: 'underline',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: tokens.spacing[3],
  },
  backButtonText: {
    fontSize: 16,
    color: '#6D7E72',
    fontFamily: 'Poppins_600SemiBold',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6D7E72',
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default AuthScreen;
