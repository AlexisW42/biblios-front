// src/store/userStore.ts
import { create } from 'zustand';
import type { User, UserState } from '../types'; // Importa las interfaces

const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: (userData: User) => set({ user: userData, isAuthenticated: true }),

  logout: () => set({ user: null, isAuthenticated: false }),
}));

export default useUserStore;