// Test API connectivity for Render deployment
// Run this in browser console after deployment

console.log('🔍 Testing Render Deployment Connection...');

// Test API configuration
import('./src/lib/config.js').then(({ API_CONFIG }) => {
  console.log('📡 API Configuration:');
  console.log('Base URL:', API_CONFIG.BASE_URL);
  console.log('WebSocket URL:', API_CONFIG.WS_URL);
  
  // Test API endpoint
  fetch(`${API_CONFIG.BASE_URL}/api/health`)
    .then(response => {
      if (response.ok) {
        console.log('✅ Backend connection successful');
        return response.json();
      } else {
        console.log('❌ Backend connection failed:', response.status);
      }
    })
    .catch(error => {
      console.log('❌ Network error:', error.message);
    });
}).catch(() => {
  // Fallback test without module import
  const baseUrl = window.location.hostname.includes('onrender.com') 
    ? 'https://community-connect-backend.onrender.com'
    : 'http://localhost:5222';
    
  console.log('📡 Testing with URL:', baseUrl);
  
  fetch(`${baseUrl}/api/health`)
    .then(response => {
      console.log(response.ok ? '✅ Connection OK' : '❌ Connection failed');
    })
    .catch(error => {
      console.log('❌ Error:', error.message);
    });
});