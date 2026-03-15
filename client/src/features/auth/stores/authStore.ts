import { create } from "zustand";

interface User {
    userId: string;
    username: string;
    email: string;
}

interface AuthStore {
    user: User | null;
    login: (user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
    user: null,
    login: (userData) => set({ user: userData }),
    logout: () => set({ user: null }),
}));