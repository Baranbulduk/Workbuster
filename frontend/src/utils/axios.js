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

// Add response interceptor to handle token expiration
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't already tried to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the admin token
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.post('http://localhost:5000/api/auth/verify-token', { token });
          
          if (response.data.valid && response.data.token) {
            // Update the token in localStorage
            localStorage.setItem('token', response.data.token);
            
            // Update the original request with the new token
            originalRequest.headers['Authorization'] = `Bearer ${response.data.token}`;
            
            // Retry the original request
            return instance(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('adminId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('admin');
        
        // Redirect to login page
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // If it's a token expiration error, handle it specifically
    if (error.response?.data?.expired) {
      localStorage.removeItem('token');
      localStorage.removeItem('adminId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('admin');
      
      // Redirect to login page
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default instance; 