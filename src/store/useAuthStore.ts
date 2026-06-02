import { create } from "zustand";
import { persist } from "zustand/middleware";
import { sendWelcomeEmail, sendPasswordResetEmail, generateResetCode } from "@/lib/emailService";

export interface User {
  id: string;
  name: string;
  email: string;
  plan: "Starter" | "Creator" | "Studio" | "Enterprise";
  credits: { used: number; total: number };
  initials: string;
}

interface StoredUser extends User {
  password: string;
}

interface ResetEntry {
  code: string;
  expires: number; // timestamp ms
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  // In-memory registry (persisted) for demo multi-user support
  registry: Record<string, StoredUser>;
  resetCodes: Record<string, ResetEntry>; // email → code

  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  requestPasswordReset: (email: string) => Promise<{ error?: string; simulated?: boolean }>;
  confirmPasswordReset: (email: string, code: string, newPassword: string) => Promise<{ error?: string }>;
}

const SEED_USERS: Record<string, StoredUser> = {
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
      registry: SEED_USERS,
      resetCodes: {},

      login: async (email, password) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 800));
        const em = email.toLowerCase().trim();
        const found = get().registry[em];
        if (!found || found.password !== password) {
          set({ isLoading: false });
          return { error: "Invalid email or password." };
        }
        const { password: _pw, ...user } = found;
        set({ user, isLoading: false });
        return {};
      },

      signup: async (name, email, password) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 900));
        const em = email.toLowerCase().trim();
        if (get().registry[em]) {
          set({ isLoading: false });
          return { error: "An account with this email already exists." };
        }
        if (password.length < 8) {
          set({ isLoading: false });
          return { error: "Password must be at least 8 characters." };
        }
        const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
        const newUser: StoredUser = {
          id: `u_${Date.now()}`,
          name: name.trim(),
          email: em,
          password,
          plan: "Starter",
          credits: { used: 0, total: 200 },
          initials,
        };
        set((state) => ({
          registry: { ...state.registry, [em]: newUser },
          isLoading: false,
        }));
        const { password: _pw, ...userWithoutPw } = newUser;
        set({ user: userWithoutPw });
        // Send welcome email (non-blocking)
        sendWelcomeEmail(name.trim(), em).catch(console.error);
        return {};
      },

      logout: () => set({ user: null }),

      updateUser: (data) => {
        const current = get().user;
        if (!current) return;
        const updated = { ...current, ...data };
        set({ user: updated });
        // Sync back to registry
        const reg = get().registry;
        if (reg[current.email]) {
          set((state) => ({
            registry: {
              ...state.registry,
              [current.email]: { ...state.registry[current.email], ...data },
            },
          }));
        }
      },

      requestPasswordReset: async (email) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 800));
        const em = email.toLowerCase().trim();
        const found = get().registry[em];
        if (!found) {
          // For security, don't reveal whether email exists — still succeed
          set({ isLoading: false });
          return { simulated: true };
        }
        const code = generateResetCode();
        set((state) => ({
          isLoading: false,
          resetCodes: {
            ...state.resetCodes,
            [em]: { code, expires: Date.now() + 15 * 60 * 1000 }, // 15 min TTL
          },
        }));
        const result = await sendPasswordResetEmail(found.name, em, code);
        return { simulated: result.simulated };
      },

      confirmPasswordReset: async (email, code, newPassword) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 600));
        const em = email.toLowerCase().trim();
        const entry = get().resetCodes[em];
        if (!entry) {
          set({ isLoading: false });
          return { error: "No reset was requested for this email." };
        }
        if (Date.now() > entry.expires) {
          set({ isLoading: false });
          return { error: "Reset code expired. Please request a new one." };
        }
        if (entry.code !== code) {
          set({ isLoading: false });
          return { error: "Incorrect code. Please check your email." };
        }
        if (newPassword.length < 8) {
          set({ isLoading: false });
          return { error: "Password must be at least 8 characters." };
        }
        // Update password in registry
        set((state) => {
          const reg = { ...state.registry };
          if (reg[em]) reg[em] = { ...reg[em], password: newPassword };
          const codes = { ...state.resetCodes };
          delete codes[em];
          return { registry: reg, resetCodes: codes, isLoading: false };
        });
        return {};
      },
    }),
    { name: "sweetest-auth-v2" }
  )
);
