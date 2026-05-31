import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  email: string;
  plan: "Starter" | "Creator" | "Studio" | "Enterprise";
  credits: { used: number; total: number };
  initials: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const DEMO_USERS: Record<string, User & { password: string }> = {
  "demo@studio.ai": {
    id: "u_demo",
    name: "Demo Studio",
    email: "demo@studio.ai",
    password: "demo1234",
    plan: "Creator",
    credits: { used: 860, total: 3000 },
    initials: "DS",
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 900));
        const found = DEMO_USERS[email.toLowerCase()];
        if (!found || found.password !== password) {
          set({ isLoading: false });
          return { error: "Invalid email or password." };
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _pw, ...user } = found;
        set({ user, isLoading: false });
        return {};
      },

      signup: async (name, email, password) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 1000));
        if (DEMO_USERS[email.toLowerCase()]) {
          set({ isLoading: false });
          return { error: "An account with this email already exists." };
        }
        if (password.length < 8) {
          set({ isLoading: false });
          return { error: "Password must be at least 8 characters." };
        }
        const initials = name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        const user: User = {
          id: `u_${Date.now()}`,
          name,
          email,
          plan: "Starter",
          credits: { used: 0, total: 200 },
          initials,
        };
        set({ user, isLoading: false });
        return {};
      },

      logout: () => set({ user: null }),

      updateUser: (data) => {
        const current = get().user;
        if (current) set({ user: { ...current, ...data } });
      },
    }),
    { name: "sweetest-auth" }
  )
);
