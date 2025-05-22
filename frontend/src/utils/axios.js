import axios from 'axios';

// Create axios instance with base URL
const instance = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add request interceptor
instance.interceptors.request.use(
  (config) => {
    // Get admin ID and token from localStorage
    const adminId = localStorage.getItem('adminId');
    const token = localStorage.getItem('token');
    
    // If token exists, add it to the request headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // If admin ID exists, add it to the request headers
    if (adminId) {
      config.headers['X-Admin-ID'] = adminId;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance; 