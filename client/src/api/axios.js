import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

instance.interceptors.request.use((config) => {
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

export default instance;
