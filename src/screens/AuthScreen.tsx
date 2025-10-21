import React from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { tokens } from '@/theme/tokens';
import { useTheme } from '@/context/ThemeContext';

// Auth components
import AuthHeader from '@/components/auth/AuthHeader';
import PhoneForm from '@/components/auth/PhoneForm';
import OTPForm from '@/components/auth/OTPForm';
import AuthButton from '@/components/auth/AuthButton';
import SecondaryButton from '@/components/auth/SecondaryButton';
import SwitchModeButton from '@/components/auth/SwitchModeButton';
import SkipAuthButton from '@/components/auth/SkipAuthButton';
import ResendButton from '@/components/auth/ResendButton';
import AuthFooter from '@/components/auth/AuthFooter';

// Custom hook
import { useAuth } from '@/hooks/useAuth';

interface AuthScreenProps {
  onLoginSuccess: (user: any) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const { colors } = useTheme();
  
  const {
    // State
    state: { phone, name, otp, step, mode, loading },
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
  } = useAuth({ onLoginSuccess });

  const handlePrimaryAction = () => {
    if (step === 'phone') {
      if (mode === 'create') {
        handleCreateAccount();
      } else {
        handleLogin();
      }
    } else {
      handleVerifyOTP();
    }
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
            <AuthHeader step={step} mode={mode} colors={colors} />

            {/* Form */}
            <View style={styles.form}>
              {step === 'phone' ? (
                <>
                  <PhoneForm
                    phone={phone}
                    name={name}
                    mode={mode}
                    colors={colors}
                    onPhoneChange={setPhone}
                    onNameChange={setName}
                  />

                  <AuthButton
                    loading={loading}
                    mode={mode}
                    step={step}
                    colors={colors}
                    onPress={handlePrimaryAction}
                  />

                  <SwitchModeButton
                    mode={mode}
                    colors={colors}
                    onPress={switchMode}
                    disabled={loading}
                  />

                  {/* Skip Authentication Button */}
                  <SkipAuthButton colors={colors} onPress={handleSkipAuth} />
                </>
              ) : (
                <>
                  <OTPForm
                    otp={otp}
                    colors={colors}
                    onOtpChange={setOtp}
                    onVerifyOTP={handleVerifyOTP}
                  />

                  <AuthButton
                    loading={loading}
                    mode={mode}
                    step={step}
                    colors={colors}
                    onPress={handlePrimaryAction}
                  />

                  <SecondaryButton
                    text="Back to Phone"
                    onPress={handleBackToPhone}
                    disabled={loading}
                  />

                  <ResendButton
                    colors={colors}
                    onPress={handleResendOTP}
                    disabled={loading}
                  />
                </>
              )}
            </View>

            {/* Footer */}
            <AuthFooter />
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
  form: {
    marginBottom: tokens.spacing[8],
  },
});

export default AuthScreen;
