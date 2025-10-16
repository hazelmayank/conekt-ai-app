// Test the live API endpoints
export const testLiveAPI = async () => {
  try {
    console.log('🧪 Testing Live API Endpoints...');
    
    // Test 1: Health Check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await fetch('https://conekt-v2-backend.onrender.com/health');
    const healthData = await healthResponse.json();
    console.log('Health check result:', healthData);
    
    if (healthResponse.ok) {
      console.log('✅ Health check passed');
    } else {
      console.log('❌ Health check failed');
      return false;
    }
    
    // Test 2: Send OTP
    console.log('2️⃣ Testing send OTP...');
    const otpResponse = await fetch('https://conekt-v2-backend.onrender.com/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '+919876543210'
      })
    });
    
    const otpData = await otpResponse.json();
    console.log('Send OTP result:', otpData);
    
    if (otpResponse.ok && otpData.ok) {
      console.log('✅ Send OTP passed');
    } else {
      console.log('❌ Send OTP failed:', otpData.message || otpData.error);
      return false;
    }
    
    // Test 3: Verify OTP (use 000000 for development)
    console.log('3️⃣ Testing verify OTP...');
    const verifyResponse = await fetch('https://conekt-v2-backend.onrender.com/admin/auth/login/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '+919876543210',
        otp: '000000'
      })
    });
    
    const verifyData = await verifyResponse.json();
    console.log('Verify OTP result:', verifyData);
    
    if (verifyResponse.ok && verifyData.ok && verifyData.token) {
      console.log('✅ Verify OTP passed');
      console.log('🔑 Token received:', verifyData.token.substring(0, 20) + '...');
      
      // Test 4: Get Cities with token
      console.log('4️⃣ Testing get cities with token...');
      const citiesResponse = await fetch('https://conekt-v2-backend.onrender.com/admin/cities', {
        headers: {
          'Authorization': `Bearer ${verifyData.token}`,
          'Content-Type': 'application/json',
        }
      });
      
      const citiesData = await citiesResponse.json();
      console.log('Get cities result:', citiesData);
      
      if (citiesResponse.ok && citiesData.success) {
        console.log('✅ Get cities passed');
        console.log('🏙️ Cities found:', citiesData.data?.length || 0);
      } else {
        console.log('❌ Get cities failed:', citiesData.message);
      }
      
      return true;
    } else {
      console.log('❌ Verify OTP failed:', verifyData.message);
      return false;
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error);
    return false;
  }
};

// Test create admin account
export const testCreateAdmin = async () => {
  try {
    console.log('🧪 Testing Create Admin Account...');
    
    const response = await fetch('https://conekt-v2-backend.onrender.com/admin/auth/create-admin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '+919876543210',
        name: 'Test Admin'
      })
    });
    
    const data = await response.json();
    console.log('Create admin result:', data);
    
    if (response.ok && data.ok) {
      console.log('✅ Create admin passed');
      return data;
    } else {
      console.log('❌ Create admin failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Create admin error:', error);
    return null;
  }
};
