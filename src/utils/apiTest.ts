import { apiService } from './src/services/apiService';

// Test API connection
export const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    console.log('Base URL:', 'https://conekt-v2-backend.onrender.com');
    
    // Test basic connectivity
    const response = await fetch('https://conekt-v2-backend.onrender.com');
    const data = await response.json();
    
    console.log('API Response:', data);
    
    if (data.success) {
      console.log('✅ API connection successful!');
      console.log('Backend version:', data.version);
      console.log('Available endpoints:', data.endpoints);
      return true;
    } else {
      console.log('❌ API connection failed');
      return false;
    }
  } catch (error) {
    console.error('❌ API connection error:', error);
    return false;
  }
};

// Test authentication flow
export const testAuthFlow = async () => {
  try {
    console.log('Testing authentication flow...');
    
    // Test sending OTP
    const otpResponse = await apiService.sendLoginOTP('+919876543210');
    console.log('OTP Response:', otpResponse);
    
    if (otpResponse.ok) {
      console.log('✅ OTP sent successfully');
      
      // Test verifying OTP (use 000000 for development)
      const verifyResponse = await apiService.verifyLoginOTP('+919876543210', '000000');
      console.log('Verify Response:', verifyResponse);
      
      if (verifyResponse.ok && verifyResponse.user) {
        console.log('✅ Authentication successful!');
        console.log('User:', verifyResponse.user);
        return true;
      }
    }
    
    console.log('❌ Authentication failed');
    return false;
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return false;
  }
};
