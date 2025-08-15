// src/store/authStore.ts
import { create } from 'zustand';
import axios from 'axios'; // Para login/register directo sin interceptor de token
import type { AuthState, User } from '../types/auth';
import { API_BASE_URL } from '../utils/constants';
import authApi from '../services/authApi'; // Importa la instancia de Axios con interceptores

const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,

    login: async (email, password) => {
        try {
            // Usa una instancia de axios simple para login/register para evitar bucles con interceptores
            const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password }, { withCredentials: true });
            set({
                user: response.data.user as User,
                accessToken: response.data.accessToken,
                isAuthenticated: true,
            });
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            set({ user: null, accessToken: null, isAuthenticated: false });
            return false;
        }
    },

    logout: async () => {
        try {
            await authApi.post('/auth/logout', {}); // Pide al backend que limpie la cookie de refresh token
        } catch (error) {
            console.error('Logout failed on server:', error);
            // Continúa limpiando el estado local aunque el server falle
        } finally {
            set({ user: null, accessToken: null, isAuthenticated: false });
        }
    },

    checkAuth: async () => {
        set({ isLoading: true });
        try {
            const response = await axios.get(`${API_BASE_URL}/auth/refresh`, { withCredentials: true });
            set({
                user: response.data.user,
                isAuthenticated: response.data.isAuthenticated,
                accessToken: null, // No necesitas accessToken con sesiones Passport
            });
        } catch (error) {
            console.log('Auth check failed:', error);
            set({ user: null, accessToken: null, isAuthenticated: false });
        } finally {
            set({ isLoading: false });
        }
    },
    // Exponemos la instancia de axios configurada para que los componentes puedan usarla
    axiosPrivate: authApi,
}));

export default useAuthStore;