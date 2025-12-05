"use client";
import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { useMemo } from "react";
import { useUserStore } from "../store/useUserStore";

declare const process: any;

// --- CORRECTION HERE ---
// 1. Get the raw domain (e.g., http://localhost:5000)
const RAW_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// 2. Append "/api" so all requests hit the correct backend group
// Result: "http://localhost:5000/api"
const BASE_URL = `${RAW_URL}/api`; 

export function createApi(token?: string): AxiosInstance {
  const inst = axios.create({
    baseURL: BASE_URL,
    headers: { "Content-Type": "application/json" },
  });

  if (token) {
    inst.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      // Safely add the header without breaking types
      if (config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  return inst;
}

export function useApi() {
  const token = useUserStore((s) => s.token);
  const logout = useUserStore((s) => s.logout);

  return useMemo(() => {
    // Pass undefined if token is null so default param works if needed
    const api = createApi(token || undefined);

    api.interceptors.response.use(
      (resp) => resp,
      async (error: AxiosError) => {
        // Check for 401 (Unauthorized) to log the user out
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return api;
  }, [token, logout]);
}