import axios from 'axios';
import { getApiUrl } from '../config/api.js';

// Create axios instance with base URL
const instance = axios.create({
  baseURL: getApiUrl()
});

// Add request interceptor
instance.interceptors.request.use(
  (config) => {
    // Check for tokens from all user types
    const adminToken = localStorage.getItem('adminToken');
    const candidateToken = localStorage.getItem('candidateToken');
    const employeeToken = localStorage.getItem('employeeToken');
    const clientToken = localStorage.getItem('clientToken');
    
    // Use the first available token
    const token = adminToken || candidateToken || employeeToken || clientToken;

    // If token exists, add it to the request headers
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // Get admin ID and add it to the request headers if it exists
    const adminId = localStorage.getItem('adminId');
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
        // Try to refresh the token based on user type
        const adminToken = localStorage.getItem('adminToken');
        const candidateToken = localStorage.getItem('candidateToken');
        const employeeToken = localStorage.getItem('employeeToken');
        const clientToken = localStorage.getItem('clientToken');

        let token = null;
        let endpoint = '';

        if (adminToken) {
          token = adminToken;
          endpoint = 'http://localhost:5000/api/auth/verify-token';
        } else if (employeeToken) {
          token = employeeToken;
          endpoint = 'http://localhost:5000/api/employees/verify-token';
        } else if (candidateToken) {
          token = candidateToken;
          endpoint = 'http://localhost:5000/api/candidates/verify-token';
        } else if (clientToken) {
          token = clientToken;
          endpoint = 'http://localhost:5000/api/clients/verify-token';
        }

        if (token && endpoint) {
          const response = await axios.post(endpoint, { token });

          if (response.data.valid && response.data.token) {
            // Update the token in localStorage based on user type
            if (adminToken) {
              localStorage.setItem('adminToken', response.data.token);
            } else if (employeeToken) {
              localStorage.setItem('employeeToken', response.data.token);
            } else if (candidateToken) {
              localStorage.setItem('candidateToken', response.data.token);
            } else if (clientToken) {
              localStorage.setItem('clientToken', response.data.token);
            }

            // Update the original request with the new token
            originalRequest.headers['Authorization'] = `Bearer ${response.data.token}`;

            // Retry the original request
            return instance(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh fails, clear all tokens and redirect to login
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('admin');
        localStorage.removeItem('candidateToken');
        localStorage.removeItem('candidate');
        localStorage.removeItem('employeeToken');
        localStorage.removeItem('employee');
        localStorage.removeItem('clientToken');
        localStorage.removeItem('client');

        // Redirect to login page
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // If it's a token expiration error, handle it specifically
    if (error.response?.data?.expired) {
      // Clear all tokens
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('admin');
      localStorage.removeItem('candidateToken');
      localStorage.removeItem('candidate');
      localStorage.removeItem('employeeToken');
      localStorage.removeItem('employee');
      localStorage.removeItem('clientToken');
      localStorage.removeItem('client');

      // Redirect to login page
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default instance; 