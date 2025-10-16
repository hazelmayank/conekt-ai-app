// Test script to verify API endpoints
export const testCreateAccount = async () => {
  try {
    console.log('Testing create account endpoint...');
    
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
    console.log('Create account response:', data);
    
    if (response.ok) {
      console.log('✅ Create account endpoint working');
      return data;
    } else {
      console.log('❌ Create account failed:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Create account error:', error);
    return null;
  }
};

export const testVerifyAccount = async () => {
  try {
    console.log('Testing verify account endpoint...');
    
    const response = await fetch('https://conekt-v2-backend.onrender.com/admin/auth/create-admin/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '+919876543210',
        otp: '000000'
      })
    });
    
    const data = await response.json();
    console.log('Verify account response:', data);
    
    if (response.ok) {
      console.log('✅ Verify account endpoint working');
      return data;
    } else {
      console.log('❌ Verify account failed:', data);
      return null;
    }
  } catch (error) {
    console.error('❌ Verify account error:', error);
    return null;
  }
};
