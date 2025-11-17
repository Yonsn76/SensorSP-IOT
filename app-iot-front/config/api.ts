// API Configuration
// Production API URL
export const API_BASE_URL = 'https://iot-final-api.onrender.com/api';

// Alternative: Use environment variable if needed for development
// export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://iot-final-api.onrender.com/api';

// API Timeout (in milliseconds)
export const API_TIMEOUT = 30000; // 30 seconds for production (increased from 10s)

// API Headers
export const getAuthHeaders = (token: string) => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const getHeaders = () => {
  return {
    'Content-Type': 'application/json'
  };
};

