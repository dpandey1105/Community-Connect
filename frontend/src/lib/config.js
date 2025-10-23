// API Configuration for different environments
const isProduction = import.meta.env.PROD;
const isGitHubPages = window.location.hostname === 'dpandey1105.github.io';

export const API_BASE_URL = isProduction
  ? (isGitHubPages
      ? 'https://community-connect-backend.onrender.com'
      : 'http://localhost:5000'
    )
  : 'http://localhost:5000';

export const WS_BASE_URL = isProduction
  ? (isGitHubPages
      ? 'wss://community-connect-backend.onrender.com'
      : 'ws://localhost:5000'
    )
  : 'ws://localhost:5000';

console.log('Environment:', isProduction ? 'production' : 'development');
console.log('GitHub Pages:', isGitHubPages);
console.log('API Base URL:', API_BASE_URL);
console.log('WS Base URL:', WS_BASE_URL);
