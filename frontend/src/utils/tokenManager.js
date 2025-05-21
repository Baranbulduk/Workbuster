import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Function to verify and refresh token if needed
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

// Function to handle API calls with automatic token refresh
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

// Function to handle token expiration
export const handleTokenExpiration = (navigate, token, email) => {
  localStorage.removeItem('employeeToken');
  navigate(`/employee/login${token ? `?token=${token}${email ? `&email=${email}` : ''}` : ''}`);
}; 