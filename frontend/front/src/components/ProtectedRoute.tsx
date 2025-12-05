// frontend/components/ProtectedRoute.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "../../src/store/useUserStore";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useUserStore((s) => s.token);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  if (!token) {
    // avoid rendering protected content until token exists
    return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
  }

  return <>{children}</>;
}
