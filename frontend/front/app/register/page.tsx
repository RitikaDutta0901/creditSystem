"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MotionWrapper from "../../src/components/MotionWrapper";
import { useUserStore } from "../../src/store/useUserStore";
import { useApi } from "../../src/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const api = useApi();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [refCode, setRefCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    try {
      const r = new URLSearchParams(window.location.search).get("r");
      if (r) setRefCode(r);
    } catch {}
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const payload: any = { name, email, password };
      if (refCode) payload.refCode = refCode;
      const resp = await api.post("/auth/register", payload);
      setUser(resp.data.user, resp.data.token);
      router.push("/dashboard");
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Failed to register");
    } finally { setLoading(false); }
  }

  return (
    <MotionWrapper>
      <div className="flex justify-center">
        <div className="card p-10 w-full max-w-lg">
          <h2 className="text-2xl font-semibold mb-2">Create an account</h2>
          <p className="hint mb-4">Sign up and start sharing your referral link.</p>

          {err && <div className="text-sm text-red-600 mb-3">{err}</div>}

          <form onSubmit={submit} className="space-y-4">
            <input className="input" placeholder="Name (optional)" value={name} onChange={e => setName(e.target.value)} />
            <input className="input" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input className="input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            <input className="input" placeholder="Referral code (optional)" value={refCode ?? ""} onChange={e => setRefCode(e.target.value || null)} />
            <div className="flex items-center justify-between mt-2">
              <button className="btn btn-primary" disabled={loading}>{loading ? "Creating..." : "Create account"}</button>
              <button type="button" onClick={() => router.push("/login")} className="text-sm text-gray-600">Have an account? Login</button>
            </div>
          </form>
        </div>
      </div>
    </MotionWrapper>
  );
}
