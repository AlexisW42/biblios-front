// src/store/authStore.ts
import { create } from 'zustand';
import axios from 'axios'; // Para login/register directo sin interceptor de token
import type { AuthState, User } from '../types/auth';
import { API_BASE_URL } from '../utils/constants';
import authApi from '../services/authApi'; // Importa la instancia de Axios con interceptores

const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,

    login: async (username, password) => {
        try {
            // Usa una instancia de axios simple para login/register para evitar bucles con interceptores
            const response = await axios.post(`${API_BASE_URL}/auth/login`, { username, password }, { withCredentials: true });
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
            // Intenta obtener un nuevo access token usando el refresh token cookie
            const response = await axios.get(`${API_BASE_URL}/auth/refresh`, { withCredentials: true });
            set({
                accessToken: response.data.accessToken,
                isAuthenticated: true,
                // Puedes decodificar el token aquí o tener un endpoint /me para obtener los datos del usuario
                user: get().user || { id: null, username: 'Authenticated User' } // Mantener usuario si ya estaba o poner placeholder
            });
        } catch (error) {
            console.error('No valid refresh token or session expired:', error);
            set({ user: null, accessToken: null, isAuthenticated: false });
        } finally {
            set({ isLoading: false });
        }
    },
    // Exponemos la instancia de axios configurada para que los componentes puedan usarla
    axiosPrivate: authApi,
}));

export default useAuthStore;

// // stores/authStore.js
// import { create } from 'zustand';
// import axios from 'axios'; // Or your preferred HTTP client

// const apiUrl = import.meta.env.VITE_URL_BACKEND;

// const useAuthStore = create((set, get) => ({
//   user: null,
//   accessToken: null,
//   isAuthenticated: false,
//   isLoading: false,

//   login: async (credentials) => {
//     set({ isLoading: true });
//     try {
//       const response = await axios.post(apiUrl+'/api/login', credentials);
//       const { accessToken, refreshToken, user } = response.data;
//       set({
//         user,
//         accessToken,
//         isAuthenticated: true,
//         isLoading: false,
//       });
//       // Store refresh token securely (e.g., HttpOnly cookie)
//       // For simplicity, we'll assume it's handled by the backend
//       localStorage.setItem('accessToken', accessToken); // Less secure, see "Token Storage"
//       return true; // Indicate successful login
//     } catch (error) {
//       console.error('Login failed:', error);
//       set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
//       return false; // Indicate failed login
//     }
//   },

//   logout: () => {
//     set({ user: null, accessToken: null, isAuthenticated: false });
//     localStorage.removeItem('accessToken'); // Clear stored token
//     // Invalidate refresh token on backend if applicable
//   },

//   setAccessToken: (token) => {
//     set({ accessToken: token });
//     localStorage.setItem('accessToken', token); // Less secure, see "Token Storage"
//   },

//   // Example for refreshing token (requires backend support)
//   refreshToken: async () => {
//     try {
//       const response = await axios.post('/api/refresh-token', {
//         // Send refresh token (e.g., from an HttpOnly cookie)
//       });
//       const { accessToken } = response.data;
//       get().setAccessToken(accessToken);
//       return true;
//     } catch (error) {
//       console.error('Token refresh failed:', error);
//       get().logout(); // Log out if refresh token is invalid
//       return false;
//     }
//   },

//   // Example for fetching current user after refresh or initial load
//   fetchCurrentUser: async () => {
//     set({ isLoading: true });
//     try {
//       const accessToken = localStorage.getItem('accessToken'); // Less secure, see "Token Storage"
//       if (!accessToken) {
//         set({ user: null, isAuthenticated: false, isLoading: false });
//         return;
//       }
//       // Set Authorization header for this request
//       axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
//       const response = await axios.get('/api/currentuser'); // Your API endpoint
//       set({ user: response.data.user, isAuthenticated: true, isLoading: false });
//     } catch (error) {
//       console.error('Failed to fetch current user:', error);
//       set({ user: null, isAuthenticated: false, isLoading: false });
//       // If 401/403, try refreshing token or log out
//     }
//   },
// }));

// export default useAuthStore;