"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import MotionWrapper from "../../src/components/MotionWrapper";
import { useUserStore } from "../../src/store/useUserStore";
import { useApi } from "../../src/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const api = useApi();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const resp = await api.post("/auth/login", { email, password });
      const { user, token } = resp.data;
      setUser(user, token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <MotionWrapper>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div className="auth-card card">
          <h2 className="text-lg font-semibold">Sign in</h2>
          <p className="hint">Welcome back — login to view your dashboard.</p>

          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

          <form onSubmit={handleLogin} aria-label="Login form">
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                type="email"
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="input"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="auth-actions" style={{ marginTop: 8 }}>
              <button
                className="btn btn-primary"
                type="submit"
                disabled={loading}
                aria-disabled={loading}
              >
                {loading ? "Signing in..." : "Login"}
              </button>

              <button
                type="button"
                onClick={() => router.push("/register")}
                className="secondary"
                aria-label="Create account"
              >
                Create account
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* keep footer but give it some space; uses .app-footer in CSS */}
      <footer className="app-footer">© {new Date().getFullYear()} ReferralApp — Built with ❤️</footer>
    </MotionWrapper>
  );
}
