import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Function to verify and refresh admin token if needed
export const verifyAndRefreshAdminToken = async () => {
  const token = localStorage.getItem('adminToken');
  if (!token) return { valid: false, expired: true };

  try {
    const response = await axios.post(`${API_URL}/auth/verify-token`, { token });
    
    if (response.data.token && response.data.token !== token) {
      // Update token in localStorage if it was refreshed
      localStorage.setItem('adminToken', response.data.token);
    }
    
    return { valid: true, token: response.data.token };
  } catch (error) {
    if (error.response?.data?.expired) {
      // Clear token if it's expired
      localStorage.removeItem('adminToken');
      return { valid: false, expired: true };
    }
    return { valid: false, expired: false };
  }
};

// Function to verify and refresh token if needed (for employees)
export const verifyAndRefreshToken = async () => {
  const token = localStorage.getItem('employeeToken');
  if (!token) return { valid: false, expired: true };

  try {
    const response = await axios.post(`${API_URL}/employees/verify-token`, { token });
    
    if (response.data.tokenRefreshed) {
      // Update token in localStorage if it was refreshed
      localStorage.setItem('employeeToken', response.data.token);
    }
    
    return { valid: true, token: response.data.token };
  } catch (error) {
    if (error.response?.data?.expired) {
      // Clear token if it's expired
      localStorage.removeItem('employeeToken');
      return { valid: false, expired: true };
    }
    return { valid: false, expired: false };
  }
};

// Function to handle API calls with automatic token refresh (for employees)
export const apiCall = async (method, endpoint, data = null, config = {}) => {
  try {
    // Verify token before making the request
    const { valid, expired, token } = await verifyAndRefreshToken();
    
    if (!valid) {
      if (expired) {
        throw new Error('TOKEN_EXPIRED');
      }
      throw new Error('INVALID_TOKEN');
    }

    // Add token to request headers
    const headers = {
      ...config.headers,
      'Authorization': `Bearer ${token || localStorage.getItem('employeeToken')}`
    };

    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      data,
      headers
    });

    return response.data;
  } catch (error) {
    if (error.message === 'TOKEN_EXPIRED') {
      throw { response: { data: { message: 'Session expired. Please log in again.' } } };
    }
    throw error;
  }
};

// Function to handle API calls with automatic token refresh (for admins)
export const adminApiCall = async (method, endpoint, data = null, config = {}) => {
  try {
    // Verify token before making the request
    const { valid, expired, token } = await verifyAndRefreshAdminToken();
    
    if (!valid) {
      if (expired) {
        throw new Error('TOKEN_EXPIRED');
      }
      throw new Error('INVALID_TOKEN');
    }

    // Add token to request headers
    const headers = {
      ...config.headers,
      'Authorization': `Bearer ${token || localStorage.getItem('adminToken')}`
    };

    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      data,
      headers
    });

    return response.data;
  } catch (error) {
    if (error.message === 'TOKEN_EXPIRED') {
      throw { response: { data: { message: 'Session expired. Please log in again.' } } };
    }
    throw error;
  }
};

// Function to handle token expiration (for employees)
export const handleTokenExpiration = (navigate, token, email) => {
  localStorage.removeItem('employeeToken');
  navigate(`/employee/login${token ? `?token=${token}${email ? `&email=${email}` : ''}` : ''}`);
};

// Function to handle admin token expiration
export const handleAdminTokenExpiration = (navigate) => {
  localStorage.removeItem('adminToken');
  navigate('/login');
}; 