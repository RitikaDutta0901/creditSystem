"use client";
import React from "react";
import MotionWrapper from "../../src/components/MotionWrapper";
import { useUserStore } from "../../src/store/useUserStore";
import Link from "next/link";

export default function ProfilePage() {
  const user = useUserStore((s) => s.user);

  return (
    <MotionWrapper>
      <section className="w-full max-w-[90rem] mx-auto px-10 py-20">
        <div className="bg-white p-12 rounded-2xl shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold">Profile</h1>
              <p className="text-gray-600 mt-1">Manage your account and see referral details.</p>
            </div>

            <div className="flex gap-3 items-center">
              <Link href="/dashboard" className="btn btn-primary px-4 py-2 text-sm">
                View Dashboard
              </Link>
              <Link href="/" className="btn-secondary px-4 py-2 text-sm">
                Back to Home
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm text-gray-500 mb-2">Name</h3>
              <div className="text-lg font-medium">{user?.name ?? "—"}</div>

              <h3 className="text-sm text-gray-500 mt-6 mb-2">Email</h3>
              <div className="text-lg">{user?.email ?? "—"}</div>
            </div>

            <div>
              <h3 className="text-sm text-gray-500 mb-2">Referral Code</h3>
              <div className="font-mono text-lg">{user?.referralCode ?? "—"}</div>

              <h3 className="text-sm text-gray-500 mt-6 mb-2">Credits</h3>
              <div className="text-lg font-bold">{user?.credits ?? 0}</div>
            </div>
          </div>
        </div>
      </section>
    </MotionWrapper>
  );
}
