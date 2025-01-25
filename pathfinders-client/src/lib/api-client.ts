import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://pathfindersgifts.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to get CSRF token
const getCSRFToken = () => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
};

// Add request interceptor
apiClient.interceptors.request.use((config) => {
  const csrfToken = getCSRFToken();
  
  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  
  // For non-GET requests, ensure CSRF token is set
  if (config.method !== 'get' && !csrfToken) {
    console.warn('No CSRF token found for non-GET request');
  }
  
  return config;
});

// Add response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403) {
      console.error('CSRF token validation failed:', error);
      // Optionally, try to refresh CSRF token here
    }
    return Promise.reject(error);
  }
);

export default apiClient; 