"use client";
import React, { useEffect, useState } from "react";
import ProtectedRoute from "../../src/components/ProtectedRoute";
import MotionWrapper from "../../src/components/MotionWrapper";
import { useApi } from "../../src/lib/api";
import { useUserStore } from "../../src/store/useUserStore";
import { useRouter } from "next/navigation";

type DashboardData = {
  referralCode: string;
  totalReferred: number;
  referredWhoPurchased: number;
  totalCredits: number;
  user: { id: string; name?: string; email: string };
};

export default function DashboardPage() {
  const router = useRouter();
  const token = useUserStore((s) => s.token);
  const api = useApi();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const resp = await api.get<DashboardData>("/dashboard/me");
        if (!mounted) return;
        setData(resp.data);
      } catch (err: any) {
        setMsg(err?.response?.data?.message || "Failed to load dashboard");
      } finally { if (mounted) setLoading(false); }
    }
    load();
    return () => { mounted = false; };
  }, [api, router, token]);

  async function handleBuy() {
    const t = token ?? (typeof window !== "undefined" ? localStorage.getItem("token") : null);
    if (!t) { router.push("/login"); return; }
  
    setBuying(true); setMsg(null);
    try {
      const resp = await api.post("/purchase/buy", { amount: 100 }, { headers: { Authorization: `Bearer ${t}` }});
      const r2 = await api.get<DashboardData>("/dashboard/me", { headers: { Authorization: `Bearer ${t}` }});
      setData(r2.data);
      setMsg(resp?.data?.message ?? "Purchase successful — credits updated.");
    } catch (err: any) {
      setMsg(err?.response?.data?.message || "Purchase failed");
      console.error("[handleBuy] error:", err);
    } finally { setBuying(false); }
  }

  function copyLink() {
    if (!data) return;
    const link = `${window.location.origin}/register?r=${data.referralCode}`;
    navigator.clipboard.writeText(link);
    setMsg("Referral link copied to clipboard!");
  }

  return (
    <ProtectedRoute>
      <MotionWrapper>
        <div className="space-y-10">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Referral Code</div>
                <div className="font-mono text-lg font-medium">{data?.referralCode ?? "—"}</div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={copyLink} className="px-3 py-1 border rounded text-sm">Copy Link</button>
                <button onClick={handleBuy} disabled={buying} className="btn btn-primary">{buying ? "Processing..." : "Buy — ₹100"}</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6 text-center">
              <div className="text-sm text-gray-500">Referred</div>
              <div className="text-2xl font-bold">{data?.totalReferred ?? 0}</div>
            </div>

            <div className="card p-6 text-center">
              <div className="text-sm text-gray-500">Converted</div>
              <div className="text-2xl font-bold">{data?.referredWhoPurchased ?? 0}</div>
            </div>

            <div className="card p-6 text-center">
              <div className="text-sm text-gray-500">Credits</div>
              <div className="text-2xl font-bold">{data?.totalCredits ?? 0}</div>
            </div>
          </div>

          {msg && <div className="text-indigo-700">{msg}</div>}
        </div>
      </MotionWrapper>
    </ProtectedRoute>
  );
}
