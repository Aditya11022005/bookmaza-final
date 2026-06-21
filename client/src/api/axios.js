import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Simple in-memory cache
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHED_URLS = ['/categories', '/books'];

instance.interceptors.request.use((config) => {
  // Check if cache has a valid response
  if (config.method?.toLowerCase() === 'get' && CACHED_URLS.includes(config.url)) {
    const cached = cache.get(config.url);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      config.adapter = () => {
        return Promise.resolve({
          data: cached.data,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        });
      };
    }
  }

  let token = null;

  try {
    const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
    if (isAdminPath) {
      const adminInfo = localStorage.getItem('pm_admin_session');
      if (adminInfo) {
        token = JSON.parse(adminInfo)?.token;
      }
    }
    if (!token) {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        token = JSON.parse(userInfo)?.token;
      }
    }
    if (!token && !isAdminPath) {
      const adminInfo = localStorage.getItem('pm_admin_session');
      if (adminInfo) {
        token = JSON.parse(adminInfo)?.token;
      }
    }
  } catch (e) {}

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

instance.interceptors.response.use((response) => {
  const { config } = response;
  const method = config.method?.toLowerCase();
  
  if (method === 'get' && CACHED_URLS.includes(config.url)) {
    cache.set(config.url, {
      data: response.data,
      timestamp: Date.now()
    });
  } else if (['post', 'put', 'delete', 'patch'].includes(method)) {
    // Invalidate caches on mutation
    cache.clear();
  }
  return response;
}, (error) => {
  return Promise.reject(error);
});

export default instance;
