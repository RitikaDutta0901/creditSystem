"use client";
import React, { useEffect } from "react";
import { useUserStore } from "../store/useUserStore";
import { createApi } from "../lib/api";

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    async function restore() {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) return;

        const api = createApi(token);
        const resp = await api.get("/dashboard/me");
        const data = resp.data;

        const user = {
          id: data.user?.id ?? null,
          name: data.user?.name ?? null,
          email: data.user?.email ?? null,
          referralCode: data.referralCode ?? null,
          credits: data.totalCredits ?? 0,
        };

        setUser(user as any, token);
      } catch (err) {
        try { localStorage.removeItem("token"); } catch {}
        console.warn("Auth restore failed:", err);
      }
    }

    restore();
  }, [setUser]);

  return <>{children}</>;
}
