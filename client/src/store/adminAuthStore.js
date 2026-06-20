import { create } from 'zustand';
import axios from '../api/axios';

const STORAGE_KEY = 'pm_admin_session';

const useAdminAuthStore = create((set) => ({
  admin: (() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),

  login: async (email, password) => {
    try {
      const { data } = await axios.post('/users/login', { email, password });
      
      if (data.role !== 'admin') {
        return { success: false, message: 'Not authorized as an administrator.' };
      }

      const session = {
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token,
        loginAt: new Date().toISOString(),
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      set({ admin: session });
      return { success: true };
    } catch (err) {
      console.error(err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Invalid email or password.' 
      };
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({ admin: null });
  },
}));

export default useAdminAuthStore;
