// API Configuration
const API_CONFIG = {
  development: 'http://localhost:5000/api',
  production: process.env.REACT_APP_API_URL || 'https://your-backend-url.railway.app/api'
};

export const getApiUrl = () => {
  return process.env.NODE_ENV === 'production' 
    ? API_CONFIG.production 
    : API_CONFIG.development;
};

export default API_CONFIG; 