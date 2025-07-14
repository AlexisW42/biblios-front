// utils/axiosInstance.js
import axios from 'axios';
import useAuthStore from '../stores/authStore'; // Your Zustand store

const api = axios.create({
  baseURL: '/api', // Your backend API base URL
  withCredentials: true, // Important for sending cookies (refresh token)
});

api.interceptors.request.use(
  (config) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retried to avoid infinite loops
      const success = await useAuthStore.getState().refreshToken();
      if (success) {
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${useAuthStore.getState().accessToken}`;
        return api(originalRequest);
      } else {
        // If refresh fails, log out
        useAuthStore.getState().logout();
        // Redirect to login page
        window.location.href = '/login'; // Or use React Router's navigate
      }
    }
    return Promise.reject(error);
  }
);

export default api;