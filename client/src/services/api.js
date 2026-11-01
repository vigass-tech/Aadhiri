import axios from 'axios';

const getBaseUrl = () => {
  // If running in browser on Vercel or any live host, always route to '/api' on the same domain
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('vercel.app') || window.location.hostname !== 'localhost')
  ) {
    return '/api';
  }
  return import.meta.env.VITE_API_URL || '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aadhirai_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle token expiration and global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Avoid looping if 401 is returned on login/track endpoints
      const isAuthEndpoint =
        error.config.url.includes('/auth/login') ||
        error.config.url.includes('/auth/register') ||
        error.config.url.includes('/complaints/track');

      if (!isAuthEndpoint) {
        localStorage.removeItem('aadhirai_token');
        localStorage.removeItem('aadhirai_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
