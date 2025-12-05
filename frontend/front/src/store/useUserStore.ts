import { create } from "zustand";

export type User = {
  id: string;
  name?: string;
  email?: string;
  referralCode?: string;
  credits?: number;
};

export type UserState = {
  token: string | null;
  user: User | null;
  setUser: (user: User | null, token?: string | null) => void;
  logout: () => void;
};

export const useUserStore = create<UserState>((set) => ({
  token: null,
  user: null,
  setUser: (user, token) => {
    if (token) {
      try { localStorage.setItem("token", token); } catch {}
    } else {
      try { localStorage.removeItem("token"); } catch {}
    }
    set({ user, token: token ?? null });
  },
  logout: () => {
    try { localStorage.removeItem("token"); } catch {}
    set({ user: null, token: null });
  },
}));
