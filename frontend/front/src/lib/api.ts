"use client";
import axios, { AxiosInstance, AxiosError } from "axios";
import { useMemo } from "react";
import { useUserStore } from "../store/useUserStore";

declare const process: any;
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export function createApi(token?: string): AxiosInstance {
  const inst = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
  });

  if (token) {
    inst.interceptors.request.use((cfg) => {
      if (!cfg.headers) (cfg as any).headers = {};
      (cfg.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
      return cfg;
    });
  }

  return inst;
}

export function useApi() {
  const token = useUserStore((s) => s.token);
  const logout = useUserStore((s) => s.logout);

  return useMemo(() => {
    const api = createApi(token ?? undefined);

    api.interceptors.response.use(
      (resp) => resp,
      async (error: AxiosError & { config?: any }) => {
        if (error.response?.status === 401) {
          // clear and logout — token invalid
          logout();
        }
        return Promise.reject(error);
      }
    );

    return api;
  }, [token, logout]);
}
