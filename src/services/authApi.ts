// src/services/authApi.ts
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import useAuthStore from '../stores/authStore'; // Importación tardía para evitar circular dependency

const authApi = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// Interceptor de solicitud: Adjunta el token de acceso
authApi.interceptors.request.use(
    (config) => {
        const accessToken = useAuthStore.getState().accessToken; // Accede al estado de Zustand
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de respuesta: Maneja la expiración del token
authApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const { checkAuth, logout } = useAuthStore.getState(); // Accede a las acciones de Zustand

        // Si el error es 403 (Forbidden) o 401 (Unauthorized) y no es un reintento
        if ((error.response?.status === 403 || error.response?.status === 401) && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Intenta refrescar el token
                await checkAuth();
                const newAccessToken = useAuthStore.getState().accessToken; // Obtén el nuevo token
                if (newAccessToken) {
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return authApi(originalRequest); // Reintenta la solicitud original
                }
            } catch (refreshError) {
                // Si el refresh falla, cierra la sesión
                console.error('Refresh token failed, logging out:', refreshError);
                logout();
                // Opcional: Redirigir al usuario a la página de login
                // window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default authApi;