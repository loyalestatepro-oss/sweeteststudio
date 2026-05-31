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

interface PendingSignup {
  name: string;
  email: string;
  password: string;
  code: string;
  expiresAt: number;
  attempts: number;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  pendingSignup: Omit<PendingSignup, "code" | "password"> | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  startSignup: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ error?: string; devCode?: string }>;
  verifySignupOtp: (code: string) => Promise<{ error?: string }>;
  resendSignupOtp: () => Promise<{ error?: string; devCode?: string }>;
  cancelSignup: () => void;
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

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

let pendingFull: PendingSignup | null = null;

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      pendingSignup: null,

      login: async (email, password) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 700));
        const found = DEMO_USERS[email.toLowerCase()];
        if (!found || found.password !== password) {
          set({ isLoading: false });
          return { error: "Invalid email or password." };
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _pw, ...user } = found;
        set({ user, isLoading: false, pendingSignup: null });
        return {};
      },

      startSignup: async (name, email, password) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 700));
        if (DEMO_USERS[email.toLowerCase()]) {
          set({ isLoading: false });
          return { error: "An account with this email already exists." };
        }
        if (password.length < 8) {
          set({ isLoading: false });
          return { error: "Password must be at least 8 characters." };
        }
        const code = generateCode();
        pendingFull = {
          name,
          email,
          password,
          code,
          expiresAt: Date.now() + OTP_TTL_MS,
          attempts: 0,
        };
        set({
          isLoading: false,
          pendingSignup: {
            name,
            email,
            expiresAt: pendingFull.expiresAt,
            attempts: 0,
          },
        });
        return { devCode: code };
      },

      verifySignupOtp: async (code) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 500));
        if (!pendingFull) {
          set({ isLoading: false });
          return { error: "No pending verification. Please sign up again." };
        }
        if (Date.now() > pendingFull.expiresAt) {
          pendingFull = null;
          set({ isLoading: false, pendingSignup: null });
          return { error: "Code expired. Request a new one." };
        }
        if (pendingFull.attempts >= MAX_ATTEMPTS) {
          pendingFull = null;
          set({ isLoading: false, pendingSignup: null });
          return { error: "Too many attempts. Please sign up again." };
        }
        if (code.trim() !== pendingFull.code) {
          pendingFull.attempts += 1;
          set({
            isLoading: false,
            pendingSignup: { ...get().pendingSignup!, attempts: pendingFull.attempts },
          });
          return {
            error: `Incorrect code. ${MAX_ATTEMPTS - pendingFull.attempts} attempts left.`,
          };
        }
        const user: User = {
          id: `u_${Date.now()}`,
          name: pendingFull.name,
          email: pendingFull.email,
          plan: "Starter",
          credits: { used: 0, total: 200 },
          initials: initialsOf(pendingFull.name),
        };
        pendingFull = null;
        set({ user, isLoading: false, pendingSignup: null });
        return {};
      },

      resendSignupOtp: async () => {
        if (!pendingFull) return { error: "No pending verification." };
        const code = generateCode();
        pendingFull = {
          ...pendingFull,
          code,
          expiresAt: Date.now() + OTP_TTL_MS,
          attempts: 0,
        };
        set({
          pendingSignup: {
            name: pendingFull.name,
            email: pendingFull.email,
            expiresAt: pendingFull.expiresAt,
            attempts: 0,
          },
        });
        return { devCode: code };
      },

      cancelSignup: () => {
        pendingFull = null;
        set({ pendingSignup: null });
      },

      logout: () => set({ user: null }),

      updateUser: (data) => {
        const current = get().user;
        if (current) set({ user: { ...current, ...data } });
      },
    }),
    {
      name: "sweetest-auth",
      partialize: (s) => ({ user: s.user }),
    }
  )
);
