// API Configuration for different environments
export const API_CONFIG = {
  // Use environment variable if available, otherwise detect based on hostname
  BASE_URL: import.meta.env.VITE_API_URL || 
    (window.location.hostname.includes('onrender.com')
      ? 'https://community-connect-backend.onrender.com'
      : window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:5222'
        : window.location.origin),
  
  // WebSocket URL (if needed in the future)
  WS_URL: import.meta.env.VITE_WS_URL || 
    (window.location.hostname.includes('onrender.com')
      ? 'wss://community-connect-backend.onrender.com'
      : window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'ws://localhost:5222'
        : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`)
};

// Helper function to build API URLs
export function buildApiUrl(endpoint) {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.BASE_URL}/api/${cleanEndpoint}`;
}